import { hipaaCompliance } from './hipaaCompliance';

// Sistema de auditoría completo para HIPAA e ISO 27001
interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  dataAccessed?: string[];
  dataModified?: any;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  phiAccessed: boolean;
  justification?: string;
  integrityHash: string;
}

class AuditLogger {
  private auditLog: AuditEvent[] = [];
  private readonly MAX_AUDIT_ENTRIES = 50000; // Retener 50k entradas
  private readonly CRITICAL_ACTIONS = [
    'PHI_ACCESS', 'USER_CREATION', 'ROLE_CHANGE', 'DATA_EXPORT', 
    'SYSTEM_CONFIG_CHANGE', 'BACKUP_RESTORE', 'LOGIN_FAILURE'
  ];

  // Registrar evento de auditoría
  logEvent(event: Omit<AuditEvent, 'id' | 'timestamp' | 'integrityHash'>): void {
    const auditEvent: AuditEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      integrityHash: '',
      ...event
    };

    // Generar hash de integridad
    auditEvent.integrityHash = hipaaCompliance.generateAuditHash({
      ...auditEvent,
      integrityHash: undefined
    });

    this.auditLog.push(auditEvent);

    // Mantener límite de entradas
    if (this.auditLog.length > this.MAX_AUDIT_ENTRIES) {
      this.auditLog.shift();
    }

    // Alertas para eventos críticos
    if (this.CRITICAL_ACTIONS.includes(event.action) || event.riskLevel === 'critical') {
      this.triggerSecurityAlert(auditEvent);
    }
  }

  // Acceso a PHI (Protected Health Information)
  logPHIAccess(
    userId: string, 
    userRole: string, 
    patientData: any, 
    ipAddress: string, 
    userAgent: string,
    sessionId: string,
    justification?: string
  ): void {
    this.logEvent({
      userId,
      userRole,
      action: 'PHI_ACCESS',
      resource: 'patient_data',
      resourceId: patientData.id?.toString(),
      ipAddress,
      userAgent,
      sessionId,
      dataAccessed: Object.keys(patientData),
      success: true,
      riskLevel: 'high',
      phiAccessed: true,
      justification
    });
  }

  // Modificación de datos
  logDataModification(
    userId: string,
    userRole: string,
    resource: string,
    resourceId: string,
    oldData: any,
    newData: any,
    ipAddress: string,
    userAgent: string,
    sessionId: string
  ): void {
    this.logEvent({
      userId,
      userRole,
      action: 'DATA_MODIFICATION',
      resource,
      resourceId,
      ipAddress,
      userAgent,
      sessionId,
      dataModified: {
        before: oldData,
        after: newData,
        changes: this.calculateChanges(oldData, newData)
      },
      success: true,
      riskLevel: 'medium',
      phiAccessed: this.containsPHI(newData)
    });
  }

  // Login exitoso
  logSuccessfulAccess(
    userId: string,
    userRole: string,
    ipAddress: string,
    userAgent: string,
    sessionId: string
  ): void {
    this.logEvent({
      userId,
      userRole,
      action: 'SUCCESSFUL_LOGIN',
      resource: 'authentication',
      ipAddress,
      userAgent,
      sessionId,
      success: true,
      riskLevel: 'low',
      phiAccessed: false
    });
  }

  // Intento de acceso fallido
  logFailedAccess(
    userId: string,
    ipAddress: string,
    userAgent: string,
    reason: string
  ): void {
    this.logEvent({
      userId,
      userRole: 'unknown',
      action: 'FAILED_LOGIN',
      resource: 'authentication',
      ipAddress,
      userAgent,
      sessionId: '',
      success: false,
      riskLevel: 'medium',
      phiAccessed: false,
      justification: reason
    });
  }

  // Obtener logs de auditoría con filtros
  getAuditLogs(filters: {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    riskLevel?: string;
    phiAccessed?: boolean;
  } = {}): AuditEvent[] {
    let filteredLogs = [...this.auditLog];

    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= filters.startDate!);
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= filters.endDate!);
    }

    if (filters.riskLevel) {
      filteredLogs = filteredLogs.filter(log => log.riskLevel === filters.riskLevel);
    }

    if (filters.phiAccessed !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.phiAccessed === filters.phiAccessed);
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Estadísticas de auditoría
  getAuditStatistics(days: number = 30): {
    totalEvents: number;
    phiAccessEvents: number;
    failedLogins: number;
    criticalEvents: number;
    uniqueUsers: number;
    riskDistribution: Record<string, number>;
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = this.auditLog.filter(log => log.timestamp >= cutoffDate);

    const stats = {
      totalEvents: recentLogs.length,
      phiAccessEvents: recentLogs.filter(log => log.phiAccessed).length,
      failedLogins: recentLogs.filter(log => log.action === 'FAILED_LOGIN').length,
      criticalEvents: recentLogs.filter(log => log.riskLevel === 'critical').length,
      uniqueUsers: new Set(recentLogs.map(log => log.userId)).size,
      riskDistribution: {
        low: recentLogs.filter(log => log.riskLevel === 'low').length,
        medium: recentLogs.filter(log => log.riskLevel === 'medium').length,
        high: recentLogs.filter(log => log.riskLevel === 'high').length,
        critical: recentLogs.filter(log => log.riskLevel === 'critical').length,
      }
    };

    return stats;
  }

  // Verificar integridad de logs
  verifyLogIntegrity(): { valid: boolean; corruptedEntries: string[] } {
    const corruptedEntries: string[] = [];

    for (const event of this.auditLog) {
      const expectedHash = hipaaCompliance.generateAuditHash({
        ...event,
        integrityHash: undefined
      });

      if (event.integrityHash !== expectedHash) {
        corruptedEntries.push(event.id);
      }
    }

    return {
      valid: corruptedEntries.length === 0,
      corruptedEntries
    };
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private triggerSecurityAlert(event: AuditEvent): void {
    console.warn(`🚨 SECURITY ALERT: ${event.action} by user ${event.userId} from ${event.ipAddress}`);
    // En producción, aquí se enviarían alertas por email, SMS, etc.
  }

  private calculateChanges(oldData: any, newData: any): Record<string, { old: any; new: any }> {
    const changes: Record<string, { old: any; new: any }> = {};

    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changes[key] = { old: oldData[key], new: newData[key] };
      }
    }

    return changes;
  }

  private containsPHI(data: any): boolean {
    const phiFields = ['patientName', 'email', 'phone', 'reason', 'reasonDetail', 'medicalHistory'];
    return phiFields.some(field => data.hasOwnProperty(field));
  }
}

export const auditLogger = new AuditLogger();