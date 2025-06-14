interface SecurityEvent {
  timestamp: Date;
  event: string;
  ip: string;
  userAgent?: string;
  username?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: any;
}

class SecurityLogger {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 10000; // Mantener últimos 10k eventos

  log(event: string, ip: string, severity: SecurityEvent['severity'], details?: any) {
    const securityEvent: SecurityEvent = {
      timestamp: new Date(),
      event,
      ip,
      severity,
      details
    };

    this.events.push(securityEvent);
    
    // Mantener solo los eventos más recientes
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log críticos a consola
    if (severity === 'critical' || severity === 'high') {
      console.warn(`[SECURITY ${severity.toUpperCase()}] ${event} from ${ip}`, details);
    }
  }

  logFailedLogin(ip: string, username: string, userAgent?: string) {
    this.log('FAILED_LOGIN_ATTEMPT', ip, 'medium', { username, userAgent });
  }

  logSuccessfulLogin(ip: string, username: string, userAgent?: string) {
    this.log('SUCCESSFUL_LOGIN', ip, 'low', { username, userAgent });
  }

  logSuspiciousActivity(ip: string, activity: string, details?: any) {
    this.log('SUSPICIOUS_ACTIVITY', ip, 'high', { activity, ...details });
  }

  logRateLimitExceeded(ip: string, endpoint: string) {
    this.log('RATE_LIMIT_EXCEEDED', ip, 'medium', { endpoint });
  }

  logUnauthorizedAccess(ip: string, endpoint: string, userAgent?: string) {
    this.log('UNAUTHORIZED_ACCESS_ATTEMPT', ip, 'high', { endpoint, userAgent });
  }

  // Detectar patrones sospechosos
  getFailedLoginsByIP(ip: string, timeWindowMinutes: number = 15): number {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    return this.events.filter(event => 
      event.ip === ip && 
      event.event === 'FAILED_LOGIN_ATTEMPT' && 
      event.timestamp > cutoff
    ).length;
  }

  getRecentEventsByIP(ip: string, timeWindowMinutes: number = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
    return this.events.filter(event => 
      event.ip === ip && 
      event.timestamp > cutoff
    );
  }

  // Obtener estadísticas de seguridad
  getSecurityStats() {
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = this.events.filter(event => event.timestamp > last24h);

    return {
      totalEvents: this.events.length,
      last24Hours: {
        total: recentEvents.length,
        failedLogins: recentEvents.filter(e => e.event === 'FAILED_LOGIN_ATTEMPT').length,
        rateLimitHits: recentEvents.filter(e => e.event === 'RATE_LIMIT_EXCEEDED').length,
        unauthorizedAccess: recentEvents.filter(e => e.event === 'UNAUTHORIZED_ACCESS_ATTEMPT').length,
        suspiciousActivity: recentEvents.filter(e => e.event === 'SUSPICIOUS_ACTIVITY').length,
      },
      topOffendingIPs: this.getTopOffendingIPs(recentEvents),
    };
  }

  private getTopOffendingIPs(events: SecurityEvent[]) {
    const ipCounts: { [ip: string]: number } = {};
    events.forEach(event => {
      if (event.severity === 'medium' || event.severity === 'high' || event.severity === 'critical') {
        ipCounts[event.ip] = (ipCounts[event.ip] || 0) + 1;
      }
    });

    return Object.entries(ipCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));
  }

  // Verificar si una IP está comportándose de manera sospechosa
  isSuspiciousIP(ip: string): boolean {
    const recentEvents = this.getRecentEventsByIP(ip, 60);
    const failedLogins = recentEvents.filter(e => e.event === 'FAILED_LOGIN_ATTEMPT').length;
    const rateLimitHits = recentEvents.filter(e => e.event === 'RATE_LIMIT_EXCEEDED').length;
    
    // Consideramos sospechosa una IP con más de 10 eventos negativos en la última hora
    return (failedLogins + rateLimitHits) > 10;
  }
}

export const securityLogger = new SecurityLogger();