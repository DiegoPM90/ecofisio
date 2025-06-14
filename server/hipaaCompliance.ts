import crypto from 'crypto';

// HIPAA Compliance Module - Manejo seguro de información médica protegida (PHI)
class HIPAACompliance {
  private encryptionKey: string;
  private algorithm = 'aes-256-gcm';
  
  constructor() {
    // Generar clave de cifrado o usar una del entorno
    this.encryptionKey = process.env.ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Cifrar datos PHI (Protected Health Information)
  encryptPHI(data: string): { encrypted: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: crypto.createHash('sha256').update(encrypted + iv.toString('hex')).digest('hex')
    };
  }

  // Descifrar datos PHI
  decryptPHI(encryptedData: { encrypted: string; iv: string; tag: string }): string {
    // Verificar integridad
    const expectedTag = crypto.createHash('sha256').update(encryptedData.encrypted + encryptedData.iv).digest('hex');
    if (expectedTag !== encryptedData.tag) {
      throw new Error('Data integrity check failed');
    }

    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Anonimizar datos para reportes
  anonymizeData(data: any): any {
    const anonymized = { ...data };
    
    // Eliminar identificadores directos
    delete anonymized.email;
    delete anonymized.phone;
    delete anonymized.patientName;
    
    // Generalizar fechas (solo mes/año)
    if (anonymized.appointmentDate) {
      const date = new Date(anonymized.appointmentDate);
      anonymized.appointmentDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }
    
    return anonymized;
  }

  // Validar que el acceso cumple con el principio de mínimo necesario
  validateMinimumNecessary(userRole: string, requestedData: string[]): boolean {
    const allowedData: Record<string, string[]> = {
      'admin': ['patientName', 'email', 'phone', 'specialty', 'reason', 'reasonDetail', 'appointmentDate'],
      'healthcare_provider': ['patientName', 'specialty', 'reason', 'reasonDetail', 'appointmentDate'],
      'scheduler': ['patientName', 'appointmentDate', 'specialty'],
      'auditor': ['appointmentDate', 'specialty', 'accessLog']
    };

    const allowed = allowedData[userRole] || [];
    return requestedData.every(field => allowed.includes(field));
  }

  // Generar hash irreversible para auditoría
  generateAuditHash(data: any): string {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
}

export const hipaaCompliance = new HIPAACompliance();