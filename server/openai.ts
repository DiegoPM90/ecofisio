import OpenAI from "openai";
import type { AIConsultationRequest } from "@shared/schema";

// Configuración para múltiples proveedores de IA
const getOpenAIKey = () => {
  // Intentar múltiples fuentes de variables de entorno
  const possibleKeys = [
    process.env.OPENAI_API_KEY,
    process.env.REPL_OPENAI_API_KEY, 
    process.env.SECRET_OPENAI_API_KEY,
    // Búsqueda dinámica en todas las variables que contengan 'OPENAI'
    ...Object.entries(process.env)
      .filter(([key]) => key.toUpperCase().includes('OPENAI'))
      .map(([, value]) => value)
  ].filter(Boolean);
  
  return possibleKeys[0] || "default_key";
};

// Inicializar cliente de forma lazy para capturar variables actualizadas
let openaiClient: OpenAI | null = null;
const getOpenAIClient = () => {
  if (!openaiClient) {
    openaiClient = new OpenAI({ 
      apiKey: getOpenAIKey()
    });
  }
  return openaiClient;
};

// Cliente para xAI (Grok) - más económico
const xaiClient = new OpenAI({
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY || "default_key"
});

// Sistema de recomendaciones kinesiológicas profesionales
function getKinesiologyRecommendation(consultation: AIConsultationRequest) {
  const { reason, reasonDetail, specialty } = consultation;
  
  const recommendations = {
    dolor_espalda: {
      recommendation: "Para dolor de espalda, se recomienda evaluación postural completa, análisis biomecánico y fortalecimiento del core. La kinesiología general es apropiada para abordar las causas estructurales del dolor mediante ejercicios terapéuticos específicos.",
      preparation: "Traer radiografías lumbares o resonancias recientes si las tiene, ropa cómoda para ejercicios, y anotar actividades o posturas que agravan el dolor.",
      urgency: "media",
      urgencyText: "Evaluación recomendada en 1-2 semanas",
      additionalNotes: "El dolor de espalda crónico requiere abordaje integral que incluye corrección postural, fortalecimiento muscular y técnicas de movilización articular."
    },
    lesion_deportiva: {
      recommendation: "Las lesiones deportivas requieren evaluación biomecánica específica del gesto deportivo afectado. La kinesiología de rehabilitación incluye rehabilitación funcional progresiva y estrategias de prevención de recidivas.",
      preparation: "Traer estudios médicos, descripción detallada del mecanismo de lesión, nivel de actividad deportiva y objetivos de retorno al deporte.",
      urgency: "alta", 
      urgencyText: "Evaluación dentro de 1 semana para prevenir complicaciones",
      additionalNotes: "La recuperación deportiva óptima requiere protocolo específico que progrese desde la fase aguda hasta el retorno completo a la actividad."
    },
    rehabilitacion_post_cirugia: {
      recommendation: "La rehabilitación post-quirúrgica requiere protocolo estricto según el tipo de cirugía realizada. Es fundamental respetar los tiempos de cicatrización y progresión gradual de la carga.",
      preparation: "Indispensable traer informe quirúrgico completo, indicaciones del cirujano, estudios post-operatorios y protocolo médico específico.",
      urgency: "alta",
      urgencyText: "Inicio según indicaciones médicas (generalmente 2-6 semanas post-cirugía)",
      additionalNotes: "El éxito de la rehabilitación post-quirúrgica depende del cumplimiento estricto del protocolo médico y la progresión supervisada."
    },
    dolor_cuello: {
      recommendation: "El dolor cervical requiere evaluación de la biomecánica cervical, análisis postural y fortalecimiento de la musculatura profunda del cuello. Se incluyen técnicas de movilización articular suave.",
      preparation: "Traer radiografías cervicales si las tiene, información sobre ergonomía laboral, y registro de actividades que aumentan o disminuyen el dolor.",
      urgency: "media",
      urgencyText: "Evaluación en 1-2 semanas, urgente si hay síntomas neurológicos",
      additionalNotes: "Es crucial evaluar factores ergonómicos y hábitos posturales que perpetúan el problema cervical."
    },
    dolor_rodilla: {
      recommendation: "El dolor de rodilla requiere análisis biomecánico de la marcha, evaluación de la alineación de miembros inferiores y fortalecimiento específico del cuádriceps y glúteos.",
      preparation: "Traer radiografías o resonancias de rodilla, calzado habitual, y descripción de actividades que provocan dolor.",
      urgency: "media",
      urgencyText: "Evaluación en 1-2 semanas",
      additionalNotes: "La rodilla es una articulación compleja que requiere abordaje integral incluyendo cadera y tobillo."
    },
    dolor_hombro: {
      recommendation: "El dolor de hombro necesita evaluación del rango articular, fuerza del manguito rotador y mecánica escapular. La kinesiología aborda tanto componentes articulares como musculares.",
      preparation: "Traer estudios de hombro si los tiene, describir movimientos que causan dolor y actividades laborales o deportivas relevantes.",
      urgency: "media", 
      urgencyText: "Evaluación en 1-2 semanas",
      additionalNotes: "El hombro requiere equilibrio entre movilidad y estabilidad, fundamental para la función del miembro superior."
    }
  };
  
  const defaultRecommendation = {
    recommendation: "Se recomienda evaluación kinesiológica integral para determinar el origen biomecánico de los síntomas y diseñar un plan de tratamiento personalizado.",
    preparation: "Traer estudios médicos relevantes, ropa cómoda para ejercicios, y descripción detallada de síntomas y limitaciones funcionales.",
    urgency: "media",
    urgencyText: "Evaluación profesional recomendada",
    additionalNotes: "La kinesiología utiliza enfoques basados en evidencia para optimizar la función del movimiento humano."
  };
  
  const recommendation = recommendations[reason as keyof typeof recommendations] || defaultRecommendation;
  
  return {
    success: true,
    data: recommendation
  };
}

// Función para determinar qué proveedor usar
function getAIProvider() {
  const apiKey = getOpenAIKey();
  console.log('🔍 Checking AI provider configuration...');
  console.log('API Key available:', apiKey !== "default_key");
  console.log('API Key length:', apiKey ? apiKey.length : 0);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.toUpperCase().includes('OPENAI')));
  
  // Usar OpenAI GPT-4o-mini (económico y de alta calidad)
  if (apiKey && apiKey !== "default_key") {
    console.log('✅ Using OpenAI provider');
    return { client: getOpenAIClient(), model: "gpt-4o-mini", provider: "openai" };
  }
  console.log('❌ No valid API key found');
  return null;
}

export async function getAIConsultationResponse(consultation: AIConsultationRequest) {
  const aiProvider = getAIProvider();
  
  if (!aiProvider) {
    console.log('❌ No AI provider available - using professional kinesiology recommendations');
    return getKinesiologyRecommendation(consultation);
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

    const response = await aiProvider.client!.chat.completions.create(requestConfig);

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
