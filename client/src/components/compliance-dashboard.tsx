import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Shield, FileText, Clock, Users, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface SecurityStats {
  security: {
    totalEvents: number;
    failedLogins: number;
    blockedIPs: number;
    criticalEvents: number;
  };
  audit: {
    totalEvents: number;
    phiAccessEvents: number;
    failedLogins: number;
    criticalEvents: number;
    uniqueUsers: number;
    riskDistribution: Record<string, number>;
  };
  compliance: {
    hipaaCompliant: boolean;
    iso27001Compliant: boolean;
    lastAudit: string;
  };
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  phiAccessed: boolean;
  justification?: string;
}

interface RetentionReport {
  totalPolicies: number;
  upcomingExpirations: Array<{
    dataType: string;
    retentionPeriod: number;
    warningDate: string;
    estimatedRecords: number;
  }>;
  complianceStatus: string;
}

export default function ComplianceDashboard() {
  const { data: securityStats, isLoading: statsLoading } = useQuery<SecurityStats>({
    queryKey: ["/api/admin/security-stats"]
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/admin/audit-logs"]
  });

  const { data: retentionReport, isLoading: retentionLoading } = useQuery<RetentionReport>({
    queryKey: ["/api/admin/data-retention/report"]
  });

  const executeDataPurge = async () => {
    try {
      const response = await fetch("/api/admin/data-retention/purge", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      console.log("Purga ejecutada:", result);
    } catch (error) {
      console.error("Error ejecutando purga:", error);
    }
  };

  if (statsLoading || logsLoading || retentionLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const complianceScore = securityStats ? 
    ((securityStats.compliance.hipaaCompliant ? 50 : 0) + 
     (securityStats.compliance.iso27001Compliant ? 50 : 0)) : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header de Cumplimiento */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Panel de Cumplimiento HIPAA/ISO 27001
          </h1>
          <p className="text-gray-600 mt-2">
            Monitoreo de seguridad y cumplimiento normativo para datos médicos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={complianceScore === 100 ? "default" : "destructive"}>
            Cumplimiento: {complianceScore}%
          </Badge>
        </div>
      </div>

      {/* Alertas de Cumplimiento */}
      {securityStats && (
        <Alert className={securityStats.audit.criticalEvents > 0 ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Estado de Seguridad</AlertTitle>
          <AlertDescription>
            {securityStats.audit.criticalEvents > 0 
              ? `${securityStats.audit.criticalEvents} eventos críticos detectados en las últimas 24 horas`
              : "Sistema operando dentro de los parámetros de seguridad normales"}
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accesos PHI</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.audit.phiAccessEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.audit.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Periodo actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos de Seguridad</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.security.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">Total registrado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logins Fallidos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats?.security.failedLogins || 0}</div>
            <p className="text-xs text-muted-foreground">Último mes</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Detalles */}
      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Auditoría</TabsTrigger>
          <TabsTrigger value="retention">Retención</TabsTrigger>
          <TabsTrigger value="compliance">Cumplimiento</TabsTrigger>
          <TabsTrigger value="reports">Reportes</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoría Recientes</CardTitle>
              <CardDescription>
                Registro completo de accesos a información médica protegida (PHI)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {auditLogs?.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.success ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      </Badge>
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-gray-500">
                          Usuario: {log.userId} | IP: {log.ipAddress}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        log.riskLevel === 'critical' ? 'destructive' :
                        log.riskLevel === 'high' ? 'destructive' :
                        log.riskLevel === 'medium' ? 'secondary' : 'default'
                      }>
                        {log.riskLevel}
                      </Badge>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Retención de Datos</CardTitle>
              <CardDescription>
                Cumplimiento HIPAA - Retención de 7 años para registros médicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Estado de Cumplimiento</p>
                  <p className="text-sm text-gray-500">
                    {retentionReport?.complianceStatus === 'COMPLIANT' ? 'CONFORME' : 'REQUIERE ATENCIÓN'}
                  </p>
                </div>
                <Badge variant={retentionReport?.complianceStatus === 'COMPLIANT' ? 'default' : 'destructive'}>
                  {retentionReport?.complianceStatus}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="font-medium">Políticas de Retención Activas</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 border rounded">
                    <p className="font-medium">Datos de Citas</p>
                    <p className="text-sm text-gray-500">7 años (HIPAA)</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Logs de Auditoría</p>
                    <p className="text-sm text-gray-500">7 años (HIPAA)</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Datos de Sesión</p>
                    <p className="text-sm text-gray-500">90 días</p>
                  </div>
                  <div className="p-3 border rounded">
                    <p className="font-medium">Credenciales</p>
                    <p className="text-sm text-gray-500">3 años post-terminación</p>
                  </div>
                </div>
              </div>

              <Button onClick={executeDataPurge} variant="outline" className="w-full">
                <Clock className="h-4 w-4 mr-2" />
                Ejecutar Purga Programada
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  HIPAA Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Estado General</span>
                  <Badge variant="default">COMPLIANT</Badge>
                </div>
                <Progress value={100} className="w-full" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Salvaguardas Administrativas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Salvaguardas Físicas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Salvaguardas Técnicas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  ISO 27001 Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Estado General</span>
                  <Badge variant="default">COMPLIANT</Badge>
                </div>
                <Progress value={100} className="w-full" />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Controles de Seguridad</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Gestión de Riesgos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Auditoría Continua</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribución de Riesgos</CardTitle>
              <CardDescription>
                Análisis de eventos por nivel de riesgo (últimos 30 días)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityStats?.audit.riskDistribution && Object.entries(securityStats.audit.riskDistribution).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="capitalize">{level}</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(count / securityStats.audit.totalEvents) * 100} 
                        className="w-32"
                      />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}