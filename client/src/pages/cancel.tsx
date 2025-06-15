import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { appointmentApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CalendarX, CheckCircle, AlertTriangle, ArrowLeft } from "lucide-react";
import type { Appointment } from "@shared/schema";

export default function Cancel() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [cancellationToken, setCancellationToken] = useState("");
  const [cancelledAppointment, setCancelledAppointment] = useState<Appointment | null>(null);

  // Check if there's a cancellation code in the URL or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    const codeFromStorage = localStorage.getItem('pendingCancelCode');
    
    if (codeFromUrl) {
      setCancellationToken(codeFromUrl);
      // Clear the URL parameter but keep the code visible
      window.history.replaceState({}, '', '/cancel');
    } else if (codeFromStorage) {
      setCancellationToken(codeFromStorage);
      localStorage.removeItem('pendingCancelCode');
    }
  }, []);

  const cancelAppointmentMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!token.trim()) {
        throw new Error("Por favor ingresa tu código de cancelación");
      }
      return await appointmentApi.cancelAppointment(token);
    },
    onSuccess: (data) => {
      setCancelledAppointment(data.appointment);
      toast({
        title: "Cita cancelada exitosamente",
        description: "Tu sesión de kinesiología ha sido cancelada y se han enviado las notificaciones correspondientes.",
      });
      setCancellationToken("");
    },
    onError: (error) => {
      toast({
        title: "Error al cancelar la cita",
        description: error.message || "No se pudo cancelar la cita. Verifica tu código de cancelación.",
        variant: "destructive",
      });
    },
  });

  const handleCancelAppointment = () => {
    cancelAppointmentMutation.mutate(cancellationToken);
  };

  if (cancelledAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Cita Cancelada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="font-semibold text-red-800 mb-2">Detalles de la cita cancelada:</h3>
              <div className="space-y-2 text-sm text-red-700">
                <p><strong>Paciente:</strong> {cancelledAppointment.patientName}</p>
                <p><strong>Fecha:</strong> {new Date(cancelledAppointment.date).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p><strong>Hora:</strong> {cancelledAppointment.time}</p>
                <p><strong>Especialidad:</strong> {cancelledAppointment.specialty}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">¿Necesitas reagendar?</p>
                  <p>Puedes programar una nueva cita en cualquier momento desde nuestra página principal.</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button 
                onClick={() => setLocation("/")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                Programar Nueva Cita
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setCancelledAppointment(null);
                  setCancellationToken("");
                }}
                className="px-4"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <CalendarX className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl text-gray-800">Cancelar Cita</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ingresa tu código de cancelación para proceder
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Highlight when code is pre-filled */}
          {cancellationToken && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Código de cancelación cargado automáticamente
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cancellationToken" className="text-sm font-medium text-gray-700">
              Código de Cancelación
            </Label>
            <div className="relative">
              <Input
                id="cancellationToken"
                type="text"
                placeholder="Ingresa tu código de cancelación"
                value={cancellationToken}
                onChange={(e) => setCancellationToken(e.target.value)}
                className={`w-full font-mono text-sm ${cancellationToken ? 'bg-blue-50 border-blue-300' : ''}`}
                disabled={cancelAppointmentMutation.isPending}
              />
              {cancellationToken && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Este código fue enviado por WhatsApp cuando confirmaste tu cita
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-700">
                <p className="font-medium mb-1">Política de Cancelación</p>
                <p>Las cancelaciones deben realizarse con al menos 24 horas de anticipación para evitar cargos adicionales.</p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleCancelAppointment}
              disabled={!cancellationToken.trim() || cancelAppointmentMutation.isPending}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {cancelAppointmentMutation.isPending ? "Cancelando..." : "Cancelar Cita"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              disabled={cancelAppointmentMutation.isPending}
              className="px-4"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}