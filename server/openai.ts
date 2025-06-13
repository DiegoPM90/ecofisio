import OpenAI from "openai";
import type { AIConsultationRequest } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export async function getAIConsultationResponse(consultation: AIConsultationRequest) {
  try {
    const prompt = `
Eres un asistente médico de IA que ayuda con orientación inicial para consultas médicas.
Basándote en la siguiente información del paciente, proporciona una respuesta estructurada en JSON.

Información del paciente:
- Motivo de consulta: ${consultation.reason}
- Detalles adicionales: ${consultation.reasonDetail || "No especificado"}
- Especialidad seleccionada: ${consultation.specialty || "No especificada"}

Proporciona una respuesta en formato JSON con la siguiente estructura:
{
  "recommendation": "Recomendación médica inicial y si la especialidad seleccionada es apropiada",
  "preparation": "Qué debe preparar el paciente para la consulta (documentos, medicamentos, etc.)",
  "urgency": "Nivel de urgencia: 'baja', 'media', 'alta'",
  "urgencyText": "Explicación del nivel de urgencia",
  "additionalNotes": "Notas adicionales o consejos generales"
}

IMPORTANTE: Esta es solo orientación inicial. Siempre recomienda consultar con un médico profesional.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Eres un asistente médico profesional que proporciona orientación inicial responsable."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const aiResponse = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      success: true,
      data: aiResponse
    };

  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Fallback response if OpenAI fails
    return {
      success: false,
      data: {
        recommendation: "Recomendamos proceder con la consulta médica programada para una evaluación profesional completa.",
        preparation: "Traer lista de medicamentos actuales, historial médico relevante y descripción detallada de síntomas.",
        urgency: "media",
        urgencyText: "Consulta programada recomendada",
        additionalNotes: "Un profesional médico podrá proporcionar la evaluación más precisa de su condición."
      }
    };
  }
}
