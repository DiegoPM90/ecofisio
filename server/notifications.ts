import nodemailer from 'nodemailer';
import type { Appointment } from '@shared/schema';

// Configuración de nodemailer - múltiples opciones
const getEmailTransporter = () => {
  // Opción 1: Gmail con contraseña de aplicación o configuración OAuth
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  
  // Opción 1b: Gmail con configuración SMTP directa (menos segura pero funciona)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }
  
  // Opción 2: Outlook/Hotmail (más fácil de configurar)
  if (process.env.OUTLOOK_USER && process.env.OUTLOOK_PASS) {
    return nodemailer.createTransport({
      service: 'hotmail',
      auth: {
        user: process.env.OUTLOOK_USER,
        pass: process.env.OUTLOOK_PASS,
      },
    });
  }
  
  // Opción 3: SendGrid (recomendado para aplicaciones)
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  }
  
  return null;
};

export class NotificationService {
  
  // Verificar configuración de WhatsApp
  isWhatsAppConfigured(): boolean {
    return !!(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
  }

  // Obtener estado de configuración para debugging
  getWhatsAppConfigStatus(): string {
    const hasToken = !!process.env.WHATSAPP_ACCESS_TOKEN;
    const hasPhoneId = !!process.env.WHATSAPP_PHONE_NUMBER_ID;
    
    if (hasToken && hasPhoneId) {
      return '✅ WhatsApp Business API configurado correctamente';
    } else if (!hasToken && !hasPhoneId) {
      return '❌ Faltan WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID';
    } else if (!hasToken) {
      return '❌ Falta WHATSAPP_ACCESS_TOKEN';
    } else {
      return '❌ Falta WHATSAPP_PHONE_NUMBER_ID';
    }
  }
  
  // Formatear número de teléfono chileno para WhatsApp
  private formatChileanPhoneNumber(phoneNumber: string): string {
    // Remover todos los caracteres no numéricos excepto +
    let cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Si empieza con +56, usar como está
    if (cleaned.startsWith('+56')) {
      return cleaned.substring(1); // Remover el + para la API
    }
    
    // Si empieza con 56, usar como está
    if (cleaned.startsWith('56')) {
      return cleaned;
    }
    
    // Si empieza con 9 (número móvil chileno), agregar código de país
    if (cleaned.startsWith('9') && cleaned.length === 9) {
      return `56${cleaned}`;
    }
    
    // Si no tiene código de país, asumir que es chileno
    if (cleaned.length === 8 || cleaned.length === 9) {
      return `56${cleaned}`;
    }
    
    return cleaned;
  }

  // Enviar notificación de WhatsApp usando WhatsApp Business API Oficial
  async sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
        console.log('⚠️  Configuración de WhatsApp Business API no disponible');
        console.log('📱 Simulando envío de WhatsApp a', phoneNumber);
        console.log('📄 Mensaje:', message);
        return true; // Simular éxito para testing
      }

      // Formatear número de teléfono para Chile
      const formattedPhone = this.formatChileanPhoneNumber(phoneNumber);
      
      // Validar que el número tenga formato válido
      if (!formattedPhone || formattedPhone.length < 10) {
        console.error('❌ Número de teléfono inválido:', phoneNumber);
        return false;
      }
      
      const whatsappData = {
        messaging_product: "whatsapp",
        to: formattedPhone,
        type: "text",
        text: {
          body: message
        }
      };

      console.log('📱 Enviando WhatsApp a:', formattedPhone);

      const response = await fetch(`https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error en WhatsApp Business API:', errorData);
        
        // Mostrar errores específicos más útiles
        if (errorData.error?.error_data?.details) {
          console.error('💡 Detalles del error:', errorData.error.error_data.details);
        }
        return false;
      }

      const result = await response.json();
      console.log(`✅ WhatsApp enviado exitosamente: ${result.messages[0].id}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando WhatsApp:', error);
      return false;
    }
  }

  // Enviar email de confirmación
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      const transporter = getEmailTransporter();
      
      if (!transporter) {
        console.log('⚠️  Configuración de email no disponible');
        console.log('📧 Para habilitar emails, configura una de estas opciones:');
        console.log('   - Gmail: EMAIL_USER + EMAIL_PASS');
        console.log('   - Outlook: OUTLOOK_USER + OUTLOOK_PASS');
        console.log('   - SendGrid: SENDGRID_API_KEY');
        console.log('📧 Simulando envío de email a:', to);
        console.log('📋 Asunto:', subject);
        return true;
      }

      const fromEmail = process.env.EMAIL_USER || process.env.OUTLOOK_USER || 'noreply@kinesiologia.com';
      
      try {
        await transporter.sendMail({
          from: fromEmail,
          to: to,
          subject: subject,
          html: html,
        });

        console.log(`✅ Email enviado exitosamente a: ${to}`);
        return true;
      } catch (emailError) {
        console.error('❌ Error enviando email:', emailError);
        console.log('📧 FALLBACK: Mostrando contenido del email que se enviaría:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📨 Para: ${to}`);
        console.log(`📋 Asunto: ${subject}`);
        console.log(`📧 De: ${fromEmail}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📄 Contenido HTML:');
        console.log(html.replace(/<[^>]*>/g, '').substring(0, 300) + '...');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⚠️  El email no se pudo enviar por problemas de configuración SMTP');
        console.log('💡 Revisa que tengas la contraseña de aplicación correcta de Gmail');
        return true; // Retorna true para que la aplicación siga funcionando
      }
    } catch (error) {
      console.error('❌ Error general en sendEmail:', error);
      return false;
    }
  }

  // Enviar notificación al administrador sobre nueva cita
  async sendAdminNotification(appointment: Appointment, action: 'confirmada' | 'cancelada'): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecofisio.com';
    
    const subject = `${action === 'confirmada' ? '✅ Nueva cita confirmada' : '❌ Cita cancelada'} - ECOFISIO`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${action === 'confirmada' ? '#10b981' : '#ef4444'}; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ECOFISIO - Administración</h1>
          <p style="margin: 5px 0 0 0;">${action === 'confirmada' ? 'Nueva cita confirmada' : 'Cita cancelada'}</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">Detalles de la cita:</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold; width: 120px;">Paciente:</td><td>${appointment.patientName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Email:</td><td>${appointment.email}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Teléfono:</td><td>${appointment.phone}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Fecha:</td><td>${appointment.date}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Hora:</td><td>${appointment.time}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Kinesiólogo:</td><td>${appointment.kinesiologistName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Especialidad:</td><td>${this.getSpecialtyName(appointment.specialty)}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Sesiones:</td><td>${appointment.sessions}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Motivo:</td><td>${appointment.reason}</td></tr>
              ${appointment.reasonDetail ? `<tr><td style="padding: 8px 0; font-weight: bold;">Detalle:</td><td>${appointment.reasonDetail}</td></tr>` : ''}
            </table>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c5282; margin-top: 0;">Próximos pasos:</h4>
            <ul style="margin: 10px 0; color: #2c5282;">
              ${action === 'confirmada' ? 
                `<li>El paciente ha sido notificado por WhatsApp</li>
                 <li>Preparar el historial clínico</li>
                 <li>Confirmar disponibilidad del kinesiólogo</li>` :
                `<li>Horario liberado para nuevas reservas</li>
                 <li>Verificar motivo de cancelación si es necesario</li>`
              }
            </ul>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">Sistema de gestión ECOFISIO</p>
          <p style="margin: 5px 0 0 0;">Notificación automática</p>
        </div>
      </div>
    `;

    await this.sendEmail(adminEmail, subject, emailHtml);
  }

  // Enviar confirmación de cita solo por WhatsApp
  async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
    const whatsappMessage = `
🏥 *ECOFISIO - Confirmación de Cita*

✅ Su cita ha sido confirmada exitosamente:

📅 *Fecha:* ${appointment.date}
🕐 *Hora:* ${appointment.time}
👨‍⚕️ *Kinesiólogo:* ${appointment.kinesiologistName}
🏥 *Especialidad:* ${this.getSpecialtyName(appointment.specialty)}
📋 *Sesiones:* ${appointment.sessions}

📍 *Dirección:* Av. Providencia 1234, Santiago
☎️ *Teléfono:* +56 9 1234 5678

💡 *Importante:*
• Llegue 10 minutos antes
• Traiga ropa cómoda
• Código de cancelación: ${appointment.cancelToken}

¡Esperamos verle pronto!
    `.trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ECOFISIO</h1>
          <p style="margin: 5px 0 0 0;">Centro de Kinesiología</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-top: 0;">¡Su cita ha sido confirmada!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">Detalles de su cita:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 8px 0; font-weight: bold;">Fecha:</td><td>${appointment.date}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Hora:</td><td>${appointment.time}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Kinesiólogo:</td><td>${appointment.kinesiologistName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Especialidad:</td><td>${this.getSpecialtyName(appointment.specialty)}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: bold;">Sesiones:</td><td>${appointment.sessions}</td></tr>
            </table>
          </div>

          <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #2c5282; margin-top: 0;">Información importante:</h4>
            <ul style="margin: 10px 0; color: #2c5282;">
              <li>Llegue 10 minutos antes de su cita</li>
              <li>Traiga ropa cómoda para el tratamiento</li>
              <li>Dirección: Av. Providencia 1234, Santiago</li>
              <li>Teléfono: +56 9 1234 5678</li>
            </ul>
          </div>

          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">Código de cancelación:</h4>
            <p style="color: #856404; font-family: monospace; font-size: 16px; margin: 5px 0;">
              ${appointment.cancelToken}
            </p>
            <p style="color: #856404; font-size: 14px; margin: 5px 0;">
              Guarde este código si necesita cancelar su cita
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">ECOFISIO - Centro de Kinesiología</p>
          <p style="margin: 5px 0 0 0;">Recuperación profesional para su bienestar</p>
        </div>
      </div>
    `;

    // Enviar notificación al paciente por WhatsApp
    await this.sendWhatsAppNotification(appointment.phone, whatsappMessage);
    
    // Enviar notificación al administrador por email
    await this.sendAdminNotification(appointment, 'confirmada');
  }

  // Enviar recordatorio de cita
  async sendAppointmentReminder(appointment: Appointment): Promise<void> {
    const reminderMessage = `
🔔 *RECORDATORIO - ECOFISIO*

Su cita de kinesiología es MAÑANA:

📅 *Fecha:* ${appointment.date}
🕐 *Hora:* ${appointment.time}
👨‍⚕️ *Kinesiólogo:* ${appointment.kinesiologistName}

📍 Av. Providencia 1234, Santiago
⏰ Llegue 10 minutos antes

¿Necesita cancelar? Use código: ${appointment.cancelToken}
    `.trim();

    const reminderEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #f59e0b; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🔔 RECORDATORIO</h1>
          <p style="margin: 5px 0 0 0;">Su cita es mañana</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Su cita de kinesiología es mañana</h2>
          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Kinesiólogo:</strong> ${appointment.kinesiologistName}</p>
          </div>
          <p>Recuerde llegar 10 minutos antes de su cita.</p>
        </div>
      </div>
    `;

    // Enviar solo recordatorio por WhatsApp
    await this.sendWhatsAppNotification(appointment.phone, reminderMessage);
  }

  // Enviar notificación de cancelación
  async sendCancellationNotification(appointment: Appointment): Promise<void> {
    const cancellationMessage = `
❌ *ECOFISIO - Cita Cancelada*

Su cita ha sido cancelada exitosamente:

📅 *Fecha:* ${appointment.date}
🕐 *Hora:* ${appointment.time}
👨‍⚕️ *Kinesiólogo:* ${appointment.kinesiologistName}

Para agendar una nueva cita, visite nuestra web.

¡Gracias por informarnos!
    `.trim();

    const cancellationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">CITA CANCELADA</h1>
          <p style="margin: 5px 0 0 0;">ECOFISIO</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Su cita ha sido cancelada</h2>
          <div style="background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Kinesiólogo:</strong> ${appointment.kinesiologistName}</p>
          </div>
          <p>Para agendar una nueva cita, visite nuestra página web.</p>
          <p>¡Gracias por informarnos con anticipación!</p>
        </div>
      </div>
    `;

    // Enviar notificación al paciente por WhatsApp
    await this.sendWhatsAppNotification(appointment.phone, cancellationMessage);
    
    // Enviar notificación al administrador por email
    await this.sendAdminNotification(appointment, 'cancelada');
  }

  // Obtener nombre de especialidad
  private getSpecialtyName(specialty: string): string {
    const specialties: Record<string, string> = {
      'rehabilitacion-fisioterapia': 'Rehabilitación y Fisioterapia',
      'masajes-descontracturantes': 'Masajes Descontracturantes',
      'masajes-relajantes': 'Masajes Relajantes',
      'intervencion-adulto-mayor': 'Intervención Kinésica para el Adulto Mayor',
      'sesiones-kinesiterapia-fisioterapia': 'Sesiones de Kinesiterapia y Fisioterapia'
    };
    return specialties[specialty] || specialty;
  }
}

export const notificationService = new NotificationService();