import nodemailer from 'nodemailer';
import type { Appointment } from '@shared/schema';

// Configuración de nodemailer para Gmail
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class NotificationService {
  
  // Enviar notificación de WhatsApp usando WhatsApp Business API Oficial
  async sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
        console.log('⚠️  Configuración de WhatsApp Business API no disponible');
        console.log('📱 Simulando envío de WhatsApp a', phoneNumber);
        console.log('📄 Mensaje:', message);
        return true; // Simular éxito para testing
      }

      // Formatear número de teléfono (remover caracteres no numéricos excepto +)
      const formattedPhone = phoneNumber.replace(/[^\d+]/g, '');
      const cleanPhone = formattedPhone.startsWith('+') ? formattedPhone.slice(1) : formattedPhone;
      
      const whatsappData = {
        messaging_product: "whatsapp",
        to: cleanPhone,
        type: "text",
        text: {
          body: message
        }
      };

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
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('⚠️  Configuración de email no disponible');
        console.log('📧 Simulando envío de email a:', to);
        console.log('📋 Asunto:', subject);
        return true;
      }

      await emailTransporter.sendMail({
        from: process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: html,
      });

      console.log(`✅ Email enviado exitosamente a: ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return false;
    }
  }

  // Enviar confirmación de cita por WhatsApp y Email
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
• Token de cancelación: ${appointment.cancelToken}

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

    // Enviar notificaciones
    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, whatsappMessage),
      this.sendEmail(appointment.email, `Confirmación de Cita - ECOFISIO`, emailHtml)
    ]);
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

    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, reminderMessage),
      this.sendEmail(appointment.email, `Recordatorio: Su cita es mañana - ECOFISIO`, reminderEmailHtml)
    ]);
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

    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, cancellationMessage),
      this.sendEmail(appointment.email, `Cita Cancelada - ECOFISIO`, cancellationEmailHtml)
    ]);
  }

  // Obtener nombre de especialidad
  private getSpecialtyName(specialty: string): string {
    const specialties: Record<string, string> = {
      'sports': 'Kinesiología Deportiva',
      'respiratory': 'Kinesiología Respiratoria',
      'neurological': 'Kinesiología Neurológica',
      'traumatological': 'Kinesiología Traumatológica'
    };
    return specialties[specialty] || specialty;
  }
}

export const notificationService = new NotificationService();