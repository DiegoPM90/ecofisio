import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import type { AIConsultationRequest } from "@shared/schema";

interface AIAssistantProps {
  reason: string;
  reasonDetail?: string;
  specialty?: string;
}

interface AIResponse {
  recommendation: string;
  preparation: string;
  urgency: string;
  urgencyText: string;
  additionalNotes: string;
}

interface AIServerResponse {
  success: boolean;
  data: AIResponse;
  consultationsRemaining?: number;
}

export default function AIAssistant({ reason, reasonDetail, specialty }: AIAssistantProps) {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [consultationsRemaining, setConsultationsRemaining] = useState<number | null>(null);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const generateAIMutation = useMutation({
    mutationFn: async (data: AIConsultationRequest) => {
      const response = await fetch("/api/ai-consultation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: (response: AIServerResponse) => {
      console.log("AI Response received:", response);
      if (response.success && response.data) {
        setAiResponse(response.data);
        setConsultationsRemaining(response.consultationsRemaining ?? null);
        setIsLimitReached(false);
      } else {
        console.error("AI response format error:", response);
        if (response.data) {
          setAiResponse(response.data);
        }
      }
    },
    onError: (error: any) => {
      console.error("AI consultation error:", error);
      if (error.message && error.message.includes("429")) {
        setIsLimitReached(true);
        setAiResponse(null);
      }
    },
  });

  const handleGenerateAI = () => {
    if (!reason) {
      console.log("No reason provided for AI consultation");
      return;
    }
    
    console.log("Generating AI consultation with data:", {
      reason,
      reasonDetail,
      specialty,
    });
    
    // Reset previous response
    setAiResponse(null);
    
    generateAIMutation.mutate({
      reason,
      reasonDetail: reasonDetail || "",
      specialty: specialty || "kinesiologia_general",
    });
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "alta":
        return "text-red-600";
      case "media":
        return "text-amber-600";
      case "baja":
        return "text-green-600";
      default:
        return "text-slate-600";
    }
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="text-white w-4 h-4" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-900 mb-2">Pregúntale a la IA</h4>
            
            {generateAIMutation.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : isLimitReached ? (
              <div className="text-sm text-red-600 space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <strong className="text-red-900">Límite de consultas alcanzado</strong>
                  <p className="mt-1">Has utilizado tu consulta gratuita de IA disponible.</p>
                  <p className="mt-1 text-xs">Para más consultas, contacta con soporte.</p>
                </div>
              </div>
            ) : aiResponse ? (
              <div className="text-sm text-slate-600 space-y-3">
                <div>
                  <strong className="text-slate-900">Recomendación:</strong>
                  <p className="mt-1">{aiResponse.recommendation}</p>
                </div>
                
                <div>
                  <strong className="text-slate-900">Preparación:</strong>
                  <p className="mt-1">{aiResponse.preparation}</p>
                </div>
                
                <div>
                  <strong className="text-slate-900">Urgencia:</strong>
                  <span className={`ml-2 font-medium ${getUrgencyColor(aiResponse.urgency)}`}>
                    {aiResponse.urgencyText}
                  </span>
                </div>
                
                {aiResponse.additionalNotes && (
                  <div>
                    <strong className="text-slate-900">Notas adicionales:</strong>
                    <p className="mt-1">{aiResponse.additionalNotes}</p>
                  </div>
                )}

                {consultationsRemaining !== null && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    <strong>Consultas restantes:</strong> {consultationsRemaining} de 1
                  </div>
                )}
                

              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Completa el motivo de la sesión para recibir orientación personalizada de nuestro asistente IA.
              </p>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateAI}
              disabled={!reason || generateAIMutation.isPending || isLimitReached}
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2 border-blue-200"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${generateAIMutation.isPending ? 'animate-spin' : ''}`} />
              {isLimitReached 
                ? 'Límite alcanzado' 
                : aiResponse 
                  ? 'Actualizar recomendación' 
                  : 'Generar recomendación'
              }
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
