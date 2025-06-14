// Sistema de control de acceso basado en roles (RBAC) para HIPAA/ISO 27001
import { auditLogger } from './auditLogger';
import { hipaaCompliance } from './hipaaCompliance';

interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'audit';
  conditions?: {
    ownDataOnly?: boolean;
    timeRestriction?: { start: string; end: string };
    purposeLimitation?: string[];
  };
}

interface Role {
  name: string;
  permissions: Permission[];
  isHealthcareRole: boolean;
  requiresMFA: boolean;
  maxSessionDuration: number; // minutos
}

class AccessControlManager {
  private roles: Map<string, Role> = new Map();

  constructor() {
    this.initializeRoles();
  }

  private initializeRoles(): void {
    // Admin - Acceso completo con auditoría
    this.roles.set('admin', {
      name: 'admin',
      permissions: [
        { resource: '*', action: 'create' },
        { resource: '*', action: 'read' },
        { resource: '*', action: 'update' },
        { resource: '*', action: 'delete' },
        { resource: '*', action: 'export' },
        { resource: '*', action: 'audit' }
      ],
      isHealthcareRole: true,
      requiresMFA: true,
      maxSessionDuration: 480 // 8 horas
    });

    // Healthcare Provider - Acceso a datos de pacientes con justificación
    this.roles.set('healthcare_provider', {
      name: 'healthcare_provider',
      permissions: [
        { 
          resource: 'appointments', 
          action: 'read',
          conditions: { purposeLimitation: ['treatment', 'care_coordination'] }
        },
        { 
          resource: 'appointments', 
          action: 'update',
          conditions: { purposeLimitation: ['treatment'] }
        },
        { 
          resource: 'patient_data', 
          action: 'read',
          conditions: { purposeLimitation: ['treatment', 'care_coordination'] }
        },
        { 
          resource: 'patient_data', 
          action: 'update',
          conditions: { purposeLimitation: ['treatment'] }
        }
      ],
      isHealthcareRole: true,
      requiresMFA: true,
      maxSessionDuration: 240 // 4 horas
    });

    // Scheduler - Solo gestión de citas
    this.roles.set('scheduler', {
      name: 'scheduler',
      permissions: [
        { resource: 'appointments', action: 'create' },
        { resource: 'appointments', action: 'read' },
        { resource: 'appointments', action: 'update' },
        { resource: 'availability', action: 'read' }
      ],
      isHealthcareRole: false,
      requiresMFA: false,
      maxSessionDuration: 480 // 8 horas
    });

    // Auditor - Solo lectura y auditoría
    this.roles.set('auditor', {
      name: 'auditor',
      permissions: [
        { resource: 'audit_logs', action: 'read' },
        { resource: 'audit_logs', action: 'export' },
        { resource: 'security_logs', action: 'read' },
        { resource: 'compliance_reports', action: 'read' }
      ],
      isHealthcareRole: false,
      requiresMFA: true,
      maxSessionDuration: 240 // 4 horas
    });

    // Patient - Solo sus propios datos
    this.roles.set('patient', {
      name: 'patient',
      permissions: [
        { 
          resource: 'appointments', 
          action: 'read',
          conditions: { ownDataOnly: true }
        },
        { 
          resource: 'appointments', 
          action: 'create',
          conditions: { ownDataOnly: true }
        },
        { 
          resource: 'patient_data', 
          action: 'read',
          conditions: { ownDataOnly: true }
        }
      ],
      isHealthcareRole: false,
      requiresMFA: false,
      maxSessionDuration: 120 // 2 horas
    });
  }

  // Verificar si un usuario tiene permiso para una acción específica
  hasPermission(
    userRole: string,
    resource: string,
    action: string,
    context: {
      userId: string;
      resourceOwnerId?: string;
      purpose?: string;
      currentTime?: Date;
    }
  ): { allowed: boolean; reason?: string } {
    const role = this.roles.get(userRole);
    if (!role) {
      return { allowed: false, reason: 'Invalid role' };
    }

    // Buscar permiso específico o wildcard
    const permission = role.permissions.find(p => 
      (p.resource === resource || p.resource === '*') && 
      p.action === action
    );

    if (!permission) {
      return { allowed: false, reason: 'Permission not granted' };
    }

    // Verificar condiciones específicas
    if (permission.conditions) {
      // Verificar acceso solo a datos propios
      if (permission.conditions.ownDataOnly && 
          context.resourceOwnerId && 
          context.userId !== context.resourceOwnerId) {
        return { allowed: false, reason: 'Access limited to own data' };
      }

      // Verificar limitación de propósito
      if (permission.conditions.purposeLimitation && 
          context.purpose && 
          !permission.conditions.purposeLimitation.includes(context.purpose)) {
        return { allowed: false, reason: 'Purpose not authorized' };
      }

      // Verificar restricciones de tiempo
      if (permission.conditions.timeRestriction && context.currentTime) {
        const currentHour = context.currentTime.getHours();
        const startHour = parseInt(permission.conditions.timeRestriction.start);
        const endHour = parseInt(permission.conditions.timeRestriction.end);
        
        if (currentHour < startHour || currentHour > endHour) {
          return { allowed: false, reason: 'Access outside permitted hours' };
        }
      }
    }

    return { allowed: true };
  }

  // Verificar y registrar acceso con auditoría completa
  authorizeAccess(
    userId: string,
    userRole: string,
    resource: string,
    action: string,
    context: {
      resourceOwnerId?: string;
      purpose?: string;
      justification?: string;
      ipAddress: string;
      userAgent: string;
      sessionId: string;
    }
  ): { authorized: boolean; reason?: string; auditId?: string } {
    const permission = this.hasPermission(userRole, resource, action, {
      userId,
      resourceOwnerId: context.resourceOwnerId,
      purpose: context.purpose,
      currentTime: new Date()
    });

    // Registrar intento de acceso
    const auditData = {
      userId,
      userRole,
      action: `ACCESS_${action.toUpperCase()}_${resource.toUpperCase()}`,
      resource,
      resourceId: context.resourceOwnerId,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      sessionId: context.sessionId,
      success: permission.allowed,
      riskLevel: this.calculateRiskLevel(userRole, resource, action),
      phiAccessed: this.isPhiResource(resource),
      justification: context.justification || context.purpose
    };

    auditLogger.logEvent(auditData);

    if (!permission.allowed) {
      // Log intento de acceso no autorizado
      auditLogger.logEvent({
        ...auditData,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        riskLevel: 'critical'
      });
    }

    return {
      authorized: permission.allowed,
      reason: permission.reason,
      auditId: auditData.sessionId
    };
  }

  // Calcular nivel de riesgo basado en rol, recurso y acción
  private calculateRiskLevel(userRole: string, resource: string, action: string): 'low' | 'medium' | 'high' | 'critical' {
    if (action === 'delete' || action === 'export') return 'critical';
    if (this.isPhiResource(resource)) return 'high';
    if (userRole === 'admin') return 'medium';
    return 'low';
  }

  // Verificar si un recurso contiene PHI
  private isPhiResource(resource: string): boolean {
    const phiResources = ['appointments', 'patient_data', 'medical_records', 'communications'];
    return phiResources.includes(resource);
  }

  // Obtener permisos de un rol
  getRolePermissions(roleName: string): Permission[] {
    const role = this.roles.get(roleName);
    return role ? role.permissions : [];
  }

  // Verificar si el rol requiere MFA
  requiresMFA(roleName: string): boolean {
    const role = this.roles.get(roleName);
    return role ? role.requiresMFA : false;
  }

  // Obtener duración máxima de sesión
  getMaxSessionDuration(roleName: string): number {
    const role = this.roles.get(roleName);
    return role ? role.maxSessionDuration : 60; // Default 1 hora
  }

  // Validar sesión activa
  validateSession(
    userId: string,
    sessionStart: Date,
    userRole: string
  ): { valid: boolean; reason?: string; timeRemaining?: number } {
    const maxDuration = this.getMaxSessionDuration(userRole);
    const sessionAge = (Date.now() - sessionStart.getTime()) / (1000 * 60); // minutos

    if (sessionAge > maxDuration) {
      return { valid: false, reason: 'Session expired' };
    }

    return { 
      valid: true, 
      timeRemaining: Math.max(0, maxDuration - sessionAge)
    };
  }

  // Generar reporte de acceso para cumplimiento
  generateAccessReport(userId?: string, startDate?: Date, endDate?: Date): {
    totalAccesses: number;
    unauthorizedAttempts: number;
    phiAccesses: number;
    roleDistribution: Record<string, number>;
    riskDistribution: Record<string, number>;
  } {
    const filters: any = {};
    if (userId) filters.userId = userId;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const auditLogs = auditLogger.getAuditLogs(filters);
    
    const report = {
      totalAccesses: auditLogs.length,
      unauthorizedAttempts: auditLogs.filter(log => !log.success).length,
      phiAccesses: auditLogs.filter(log => log.phiAccessed).length,
      roleDistribution: {} as Record<string, number>,
      riskDistribution: {} as Record<string, number>
    };

    // Calcular distribuciones
    auditLogs.forEach(log => {
      report.roleDistribution[log.userRole] = (report.roleDistribution[log.userRole] || 0) + 1;
      report.riskDistribution[log.riskLevel] = (report.riskDistribution[log.riskLevel] || 0) + 1;
    });

    return report;
  }
}

export const accessControlManager = new AccessControlManager();