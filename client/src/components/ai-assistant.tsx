import React from "react";
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

export default function AIAssistant({ reason, reasonDetail, specialty }: AIAssistantProps) {
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);

  const generateAIMutation = useMutation({
    mutationFn: async (data: AIConsultationRequest) => {
      const response = await apiRequest("POST", "/api/ai-consultation", data);
      return response.json();
    },
    onSuccess: (response) => {
      if (response.success) {
        setAiResponse(response.data);
      }
    },
  });

  const handleGenerateAI = () => {
    if (!reason) return;
    
    generateAIMutation.mutate({
      reason,
      reasonDetail,
      specialty,
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
            <h4 className="font-medium text-slate-900 mb-2">Asistente de Kinesiología IA</h4>
            
            {generateAIMutation.isPending ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
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
                
                <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                  <strong>Aviso:</strong> Esta es solo orientación inicial. Consulta siempre con un kinesiólogo profesional.
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-600">
                Completa el motivo de la sesión para recibir orientación personalizada de nuestro asistente IA.
              </p>
            )}
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGenerateAI}
              disabled={!reason || generateAIMutation.isPending}
              className="text-xs text-blue-600 hover:text-blue-700 mt-2 p-0 h-auto font-medium"
            >
              <RefreshCw className={`w-3 h-3 mr-1 ${generateAIMutation.isPending ? 'animate-spin' : ''}`} />
              {aiResponse ? 'Actualizar recomendación' : 'Generar recomendación'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
