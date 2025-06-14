import nodemailer from 'nodemailer';
import twilio from 'twilio';
import type { Appointment } from '@shared/schema';

// Configuración de Twilio para WhatsApp
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Configuración de nodemailer
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export class NotificationService {
  
  // Enviar notificación de WhatsApp
  async sendWhatsAppNotification(phoneNumber: string, message: string): Promise<boolean> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
        console.log('Configuración de Twilio no disponible');
        return false;
      }

      // Formatear número de teléfono (asegurar que empiece con +56 para Chile)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+56${phoneNumber}`;
      
      await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${formattedPhone}`,
      });

      console.log(`WhatsApp enviado a ${formattedPhone}`);
      return true;
    } catch (error) {
      console.error('Error enviando WhatsApp:', error);
      return false;
    }
  }

  // Enviar email
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('Configuración de email no disponible');
        return false;
      }

      await emailTransporter.sendMail({
        from: `"EcoFisio" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      console.log(`Email enviado a ${to}`);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  // Notificación de nueva cita (confirmación)
  async sendAppointmentConfirmation(appointment: Appointment): Promise<void> {
    const whatsAppMessage = `
🏥 *EcoFisio - Cita Confirmada*

¡Hola ${appointment.patientName}!

Tu cita ha sido confirmada:
📅 Fecha: ${appointment.date}
🕐 Hora: ${appointment.time}
👨‍⚕️ Especialidad: ${appointment.specialty}
👩‍⚕️ Kinesiólogo: ${appointment.kinesiologistName}

Para cancelar tu cita, usa este enlace:
${process.env.FRONTEND_URL || 'http://localhost:5000'}/cancel/${appointment.id}

¡Te esperamos! 💪
    `.trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">🏥 EcoFisio</h1>
          <p style="color: white; margin: 10px 0 0 0;">Centro de Kinesiología</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333;">¡Cita Confirmada!</h2>
          <p>Hola <strong>${appointment.patientName}</strong>,</p>
          <p>Tu cita ha sido confirmada exitosamente:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>📅 Fecha:</strong> ${appointment.date}</p>
            <p><strong>🕐 Hora:</strong> ${appointment.time}</p>
            <p><strong>👨‍⚕️ Especialidad:</strong> ${appointment.specialty}</p>
            <p><strong>👩‍⚕️ Kinesiólogo:</strong> ${appointment.kinesiologistName}</p>
            <p><strong>📋 Motivo:</strong> ${appointment.reason}</p>
            ${appointment.reasonDetail ? `<p><strong>Detalles:</strong> ${appointment.reasonDetail}</p>` : ''}
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>💡 Importante:</strong></p>
            <p style="margin: 5px 0;">• Llega 10 minutos antes de tu cita</p>
            <p style="margin: 5px 0;">• Trae ropa cómoda para el tratamiento</p>
            <p style="margin: 5px 0;">• Si necesitas cancelar, hazlo con 24 horas de anticipación</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/cancel/${appointment.id}" 
               style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Cancelar Cita
            </a>
          </div>
          
          <p style="text-align: center; color: #666; font-size: 14px;">
            ¡Te esperamos! 💪<br>
            Equipo EcoFisio
          </p>
        </div>
      </div>
    `;

    // Enviar WhatsApp y Email en paralelo
    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, whatsAppMessage),
      this.sendEmail(appointment.email, '🏥 EcoFisio - Cita Confirmada', emailHtml)
    ]);
  }

  // Recordatorio 24 horas antes
  async sendAppointmentReminder(appointment: Appointment): Promise<void> {
    const whatsAppMessage = `
🔔 *Recordatorio EcoFisio*

¡Hola ${appointment.patientName}!

Te recordamos tu cita para mañana:
📅 ${appointment.date}
🕐 ${appointment.time}
👩‍⚕️ ${appointment.kinesiologistName}

Si necesitas cancelar:
${process.env.FRONTEND_URL || 'http://localhost:5000'}/cancel/${appointment.id}

¡Te esperamos! 🏥
    `.trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #ffc107; padding: 20px; text-align: center;">
          <h1 style="color: #333; margin: 0;">🔔 Recordatorio de Cita</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hola <strong>${appointment.patientName}</strong>,</p>
          <p>Te recordamos que tienes una cita mañana:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>📅 Fecha:</strong> ${appointment.date}</p>
            <p><strong>🕐 Hora:</strong> ${appointment.time}</p>
            <p><strong>👩‍⚕️ Kinesiólogo:</strong> ${appointment.kinesiologistName}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/cancel/${appointment.id}" 
               style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Cancelar si es necesario
            </a>
          </div>
          
          <p style="text-align: center; color: #666;">
            ¡Te esperamos! 🏥<br>
            Equipo EcoFisio
          </p>
        </div>
      </div>
    `;

    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, whatsAppMessage),
      this.sendEmail(appointment.email, '🔔 EcoFisio - Recordatorio de Cita', emailHtml)
    ]);
  }

  // Notificación de cancelación
  async sendCancellationNotification(appointment: Appointment): Promise<void> {
    const whatsAppMessage = `
❌ *EcoFisio - Cita Cancelada*

Hola ${appointment.patientName},

Tu cita del ${appointment.date} a las ${appointment.time} ha sido cancelada exitosamente.

Puedes agendar una nueva cita cuando gustes en:
${process.env.FRONTEND_URL || 'http://localhost:5000'}

¡Esperamos verte pronto! 🏥
    `.trim();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #dc3545; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">❌ Cita Cancelada</h1>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <p>Hola <strong>${appointment.patientName}</strong>,</p>
          <p>Tu cita ha sido cancelada exitosamente:</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <p><strong>📅 Fecha:</strong> ${appointment.date}</p>
            <p><strong>🕐 Hora:</strong> ${appointment.time}</p>
            <p><strong>👩‍⚕️ Kinesiólogo:</strong> ${appointment.kinesiologistName}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
               style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Agendar Nueva Cita
            </a>
          </div>
          
          <p style="text-align: center; color: #666;">
            ¡Esperamos verte pronto! 🏥<br>
            Equipo EcoFisio
          </p>
        </div>
      </div>
    `;

    await Promise.all([
      this.sendWhatsAppNotification(appointment.phone, whatsAppMessage),
      this.sendEmail(appointment.email, '❌ EcoFisio - Cita Cancelada', emailHtml)
    ]);
  }
}

export const notificationService = new NotificationService();