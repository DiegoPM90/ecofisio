// Multi-Factor Authentication Manager para cumplimiento HIPAA
import crypto from 'crypto';
import { auditLogger } from './auditLogger';

interface MFASecret {
  userId: string;
  secret: string;
  backupCodes: string[];
  isEnabled: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

interface MFAAttempt {
  userId: string;
  timestamp: Date;
  success: boolean;
  ipAddress: string;
  userAgent: string;
}

class MFAManager {
  private mfaSecrets: Map<string, MFASecret> = new Map();
  private mfaAttempts: MFAAttempt[] = [];
  private readonly TOTP_WINDOW = 30; // seconds
  private readonly BACKUP_CODE_COUNT = 10;

  // Generar secreto TOTP para un usuario
  generateTOTPSecret(userId: string): { secret: string; qrCodeUrl: string; backupCodes: string[] } {
    const secret = crypto.randomBytes(20).toString('base32');
    const backupCodes = this.generateBackupCodes();
    
    const mfaSecret: MFASecret = {
      userId,
      secret,
      backupCodes,
      isEnabled: false,
      createdAt: new Date()
    };

    this.mfaSecrets.set(userId, mfaSecret);

    // Generar URL para QR code (compatible con Google Authenticator)
    const qrCodeUrl = `otpauth://totp/Ecofisio:${userId}?secret=${secret}&issuer=Ecofisio&algorithm=SHA1&digits=6&period=30`;

    // Log la generación de MFA
    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: 'MFA_SECRET_GENERATED',
      resource: 'mfa_settings',
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
      success: true,
      riskLevel: 'medium',
      phiAccessed: false,
      justification: 'MFA setup for enhanced security'
    });

    return { secret, qrCodeUrl, backupCodes };
  }

  // Verificar código TOTP
  verifyTOTP(userId: string, token: string, ipAddress: string, userAgent: string): boolean {
    const mfaSecret = this.mfaSecrets.get(userId);
    if (!mfaSecret || !mfaSecret.isEnabled) {
      return false;
    }

    const isValid = this.validateTOTPToken(mfaSecret.secret, token);
    
    this.logMFAAttempt(userId, isValid, ipAddress, userAgent);

    if (isValid) {
      mfaSecret.lastUsed = new Date();
      this.mfaSecrets.set(userId, mfaSecret);
    }

    return isValid;
  }

  // Verificar código de respaldo
  verifyBackupCode(userId: string, code: string, ipAddress: string, userAgent: string): boolean {
    const mfaSecret = this.mfaSecrets.get(userId);
    if (!mfaSecret || !mfaSecret.isEnabled) {
      return false;
    }

    const codeIndex = mfaSecret.backupCodes.indexOf(code);
    if (codeIndex === -1) {
      this.logMFAAttempt(userId, false, ipAddress, userAgent);
      return false;
    }

    // Remover el código usado
    mfaSecret.backupCodes.splice(codeIndex, 1);
    mfaSecret.lastUsed = new Date();
    this.mfaSecrets.set(userId, mfaSecret);

    this.logMFAAttempt(userId, true, ipAddress, userAgent);

    // Log uso de código de respaldo
    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: 'MFA_BACKUP_CODE_USED',
      resource: 'mfa_settings',
      ipAddress,
      userAgent,
      sessionId: 'unknown',
      success: true,
      riskLevel: 'medium',
      phiAccessed: false,
      justification: 'Backup code authentication'
    });

    return true;
  }

  // Habilitar MFA para un usuario
  enableMFA(userId: string, verificationToken: string): boolean {
    const mfaSecret = this.mfaSecrets.get(userId);
    if (!mfaSecret) {
      return false;
    }

    if (!this.validateTOTPToken(mfaSecret.secret, verificationToken)) {
      return false;
    }

    mfaSecret.isEnabled = true;
    this.mfaSecrets.set(userId, mfaSecret);

    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: 'MFA_ENABLED',
      resource: 'mfa_settings',
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
      success: true,
      riskLevel: 'low',
      phiAccessed: false,
      justification: 'MFA activation for security compliance'
    });

    return true;
  }

  // Deshabilitar MFA para un usuario
  disableMFA(userId: string): boolean {
    const mfaSecret = this.mfaSecrets.get(userId);
    if (!mfaSecret) {
      return false;
    }

    mfaSecret.isEnabled = false;
    this.mfaSecrets.set(userId, mfaSecret);

    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: 'MFA_DISABLED',
      resource: 'mfa_settings',
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
      success: true,
      riskLevel: 'high',
      phiAccessed: false,
      justification: 'MFA deactivation - security level reduced'
    });

    return true;
  }

  // Verificar si un usuario tiene MFA habilitado
  isMFAEnabled(userId: string): boolean {
    const mfaSecret = this.mfaSecrets.get(userId);
    return mfaSecret ? mfaSecret.isEnabled : false;
  }

  // Obtener códigos de respaldo restantes
  getRemainingBackupCodes(userId: string): string[] {
    const mfaSecret = this.mfaSecrets.get(userId);
    return mfaSecret ? [...mfaSecret.backupCodes] : [];
  }

  // Generar nuevos códigos de respaldo
  regenerateBackupCodes(userId: string): string[] {
    const mfaSecret = this.mfaSecrets.get(userId);
    if (!mfaSecret) {
      return [];
    }

    const newBackupCodes = this.generateBackupCodes();
    mfaSecret.backupCodes = newBackupCodes;
    this.mfaSecrets.set(userId, mfaSecret);

    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: 'MFA_BACKUP_CODES_REGENERATED',
      resource: 'mfa_settings',
      ipAddress: 'system',
      userAgent: 'system',
      sessionId: 'system',
      success: true,
      riskLevel: 'medium',
      phiAccessed: false,
      justification: 'Security maintenance - backup codes refresh'
    });

    return [...newBackupCodes];
  }

  // Validar token TOTP
  private validateTOTPToken(secret: string, token: string): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(currentTime / this.TOTP_WINDOW);

    // Verificar ventana de tiempo actual y ±1 para compensar drift del reloj
    for (let i = -1; i <= 1; i++) {
      const testTime = timeStep + i;
      const expectedToken = this.generateTOTPToken(secret, testTime);
      if (expectedToken === token) {
        return true;
      }
    }

    return false;
  }

  // Generar token TOTP
  private generateTOTPToken(secret: string, timeStep: number): string {
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeUInt32BE(Math.floor(timeStep / 0x100000000), 0);
    timeBuffer.writeUInt32BE(timeStep & 0xffffffff, 4);

    const secretBuffer = Buffer.from(secret, 'base32');
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(timeBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0xf;
    const code = ((digest[offset] & 0x7f) << 24) |
                 ((digest[offset + 1] & 0xff) << 16) |
                 ((digest[offset + 2] & 0xff) << 8) |
                 (digest[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, '0');
  }

  // Generar códigos de respaldo
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
    }
    return codes;
  }

  // Registrar intento de MFA
  private logMFAAttempt(userId: string, success: boolean, ipAddress: string, userAgent: string): void {
    const attempt: MFAAttempt = {
      userId,
      timestamp: new Date(),
      success,
      ipAddress,
      userAgent
    };

    this.mfaAttempts.push(attempt);

    // Mantener solo los últimos 1000 intentos
    if (this.mfaAttempts.length > 1000) {
      this.mfaAttempts.shift();
    }

    auditLogger.logEvent({
      userId,
      userRole: 'unknown',
      action: success ? 'MFA_SUCCESS' : 'MFA_FAILURE',
      resource: 'authentication',
      ipAddress,
      userAgent,
      sessionId: 'unknown',
      success,
      riskLevel: success ? 'low' : 'high',
      phiAccessed: false,
      justification: 'Multi-factor authentication attempt'
    });
  }

  // Obtener estadísticas de MFA
  getMFAStatistics(): {
    totalUsers: number;
    enabledUsers: number;
    recentAttempts: number;
    successRate: number;
  } {
    const totalUsers = this.mfaSecrets.size;
    const enabledUsers = Array.from(this.mfaSecrets.values()).filter(s => s.isEnabled).length;
    
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);
    
    const recentAttempts = this.mfaAttempts.filter(a => a.timestamp >= last24Hours);
    const successfulAttempts = recentAttempts.filter(a => a.success);
    
    const successRate = recentAttempts.length > 0 ? 
      (successfulAttempts.length / recentAttempts.length) * 100 : 100;

    return {
      totalUsers,
      enabledUsers,
      recentAttempts: recentAttempts.length,
      successRate: Math.round(successRate * 100) / 100
    };
  }
}

export const mfaManager = new MFAManager();