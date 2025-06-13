import OpenAI from "openai";
import type { AIConsultationRequest } from "@shared/schema";

// Configuración para múltiples proveedores de IA
const openaiClient = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "default_key"
});

// Cliente para xAI (Grok) - más económico
const xaiClient = new OpenAI({
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "default_key"
});

// Función para determinar qué proveedor usar
function getAIProvider() {
  // Prioridad: xAI (más económico) > OpenAI
  if (process.env.XAI_API_KEY && process.env.XAI_API_KEY !== "default_key") {
    return { client: xaiClient, model: "grok-2-1212", provider: "xai" };
  }
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "default_key") {
    return { client: openaiClient, model: "gpt-4o-mini", provider: "openai" }; // gpt-4o-mini es más económico
  }
  return null;
}

export async function getAIConsultationResponse(consultation: AIConsultationRequest) {
  const aiProvider = getAIProvider();
  
  if (!aiProvider) {
    return {
      success: false,
      data: {
        recommendation: "Para usar el asistente de IA necesitas configurar una clave API de OpenAI o xAI.",
        preparation: "Traer ropa cómoda para ejercicios, estudios médicos relevantes (radiografías, resonancias) y descripción detallada de síntomas.",
        urgency: "media",
        urgencyText: "Sesión programada recomendada",
        additionalNotes: "Un kinesiólogo profesional podrá proporcionar la evaluación más precisa de su condición física."
      }
    };
  }

  try {
    const prompt = `
Eres un asistente de kinesiología especializado en orientación inicial para consultas fisioterapéuticas.
Basándote en la siguiente información del paciente, proporciona una respuesta estructurada en JSON.

Información del paciente:
- Motivo de consulta: ${consultation.reason}
- Detalles adicionales: ${consultation.reasonDetail || "No especificado"}
- Especialidad seleccionada: ${consultation.specialty || "No especificada"}

Proporciona una respuesta en formato JSON con la siguiente estructura:
{
  "recommendation": "Recomendación kinesiológica inicial y si la especialidad seleccionada es apropiada",
  "preparation": "Qué debe preparar el paciente para la sesión (ropa cómoda, estudios médicos, etc.)",
  "urgency": "Nivel de urgencia: 'baja', 'media', 'alta'",
  "urgencyText": "Explicación del nivel de urgencia",
  "additionalNotes": "Ejercicios preventivos o consejos generales de kinesiología"
}

IMPORTANTE: Esta es solo orientación inicial. Siempre recomienda consultar con un kinesiólogo profesional.
`;

    const requestConfig: any = {
      model: aiProvider.model,
      messages: [
        {
          role: "system",
          content: "Eres un asistente de kinesiología profesional que proporciona orientación inicial responsable para pacientes."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
    };

    // Solo agregar response_format para OpenAI (xAI no lo soporta igual)
    if (aiProvider.provider === "openai") {
      requestConfig.response_format = { type: "json_object" };
    }

    const response = await aiProvider.client.chat.completions.create(requestConfig);

    let aiResponse;
    try {
      aiResponse = JSON.parse(response.choices[0].message.content || "{}");
    } catch {
      // Si no es JSON válido, crear respuesta estructurada
      const content = response.choices[0].message.content || "";
      aiResponse = {
        recommendation: content.substring(0, 200) + "...",
        preparation: "Traer ropa cómoda para ejercicios y estudios médicos relevantes.",
        urgency: "media",
        urgencyText: "Sesión programada recomendada",
        additionalNotes: "Consulta con un kinesiólogo profesional."
      };
    }
    
    return {
      success: true,
      data: aiResponse,
      provider: aiProvider.provider
    };

  } catch (error) {
    console.error(`${aiProvider.provider} API error:`, error);
    
    return {
      success: false,
      data: {
        recommendation: "Recomendamos proceder con la sesión de kinesiología programada para una evaluación profesional completa.",
        preparation: "Traer ropa cómoda para ejercicios, estudios médicos relevantes (radiografías, resonancias) y descripción detallada de síntomas.",
        urgency: "media",
        urgencyText: "Sesión programada recomendada",
        additionalNotes: "Un kinesiólogo profesional podrá proporcionar la evaluación más precisa de su condición física."
      }
    };
  }
}
