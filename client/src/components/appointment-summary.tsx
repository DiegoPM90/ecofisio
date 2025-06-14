import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, CalendarDays, Clock, User, Phone, Mail, FileText, Activity, CheckCircle, CalendarX, Copy, Info } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { InsertAppointment, Appointment } from "@shared/schema";

interface AppointmentSummaryProps {
  formData: {
    patientName?: string;
    email?: string;
    phone?: string;
    specialty?: string;
    sessions?: number;
    reason?: string;
    reasonDetail?: string;
  };
  selectedDate?: string;
  selectedTime?: string;
}

export default function AppointmentSummary({ formData, selectedDate, selectedTime }: AppointmentSummaryProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Error creating appointment: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (data: Appointment) => {
      setBookedAppointment(data);
      toast({
        title: "¡Cita confirmada!",
        description: "Tu sesión de kinesiología ha sido reservada exitosamente. Recibirás notificaciones por WhatsApp y correo.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      toast({
        title: "Error al reservar",
        description: "No se pudo confirmar tu cita. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    },
  });

  const getServiceLabel = (specialty?: string) => {
    const labels = {
      "sesiones-kinesiterapia-fisioterapia": "Sesiones de Kinesiterapia y Fisioterapia",
      "masaje-descontracturante": "Masaje Descontracturante",
      "masaje-relajacion": "Masaje de Relajación"
    };
    return labels[specialty as keyof typeof labels] || specialty || "No seleccionado";
  };

  const handleConfirmAppointment = () => {
    if (!selectedDate || !selectedTime || !formData.patientName || !formData.email || !formData.specialty || !formData.reason) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    createAppointmentMutation.mutate({
      patientName: formData.patientName,
      email: formData.email,
      phone: formData.phone || "",
      date: selectedDate,
      time: selectedTime,
      specialty: formData.specialty,
      sessions: formData.sessions || 1,
      reason: formData.reason,
      reasonDetail: formData.reasonDetail || "",
    });
  };

  const isComplete = selectedDate && selectedTime && formData.patientName && formData.email && formData.specialty && formData.reason;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Token de cancelación copiado al portapapeles.",
    });
  };

  if (bookedAppointment) {
    return (
      <Card className="opacity-100 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            ¡Cita Confirmada!
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Detalles de tu Cita
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-600">Fecha:</span>
                  <p className="font-medium">{bookedAppointment.date}</p>
                </div>
                <div>
                  <span className="text-slate-600">Hora:</span>
                  <p className="font-medium">{bookedAppointment.time}</p>
                </div>
                <div>
                  <span className="text-slate-600">Servicio:</span>
                  <p className="font-medium">{getServiceLabel(bookedAppointment.specialty)}</p>
                </div>
                <div>
                  <span className="text-slate-600">Kinesiólogo:</span>
                  <p className="font-medium">{bookedAppointment.kinesiologistName}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" />
                Información Importante
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Recibirás confirmación por WhatsApp y email</li>
                <li>• Te enviaremos un recordatorio 24 horas antes</li>
                <li>• Por favor llega 10 minutos antes de tu cita</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                <CalendarX className="h-4 w-4" />
                ¿Necesitas cancelar?
              </h4>
              <p className="text-sm text-orange-800 mb-3">
                Guarda este código para cancelar tu cita si es necesario:
              </p>
              <div className="flex items-center gap-2 bg-white p-3 rounded border">
                <code className="flex-1 font-mono text-sm text-slate-700">
                  {bookedAppointment.cancelToken}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(bookedAppointment.cancelToken)}
                  className="shrink-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="mt-3">
                <Link href="/cancel">
                  <Button variant="outline" size="sm" className="text-orange-700 border-orange-300 hover:bg-orange-100">
                    Cancelar Cita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="opacity-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Resumen de la Cita</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Fecha:</span>
            <span className="font-medium">{selectedDate || "No seleccionada"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Hora:</span>
            <span className="font-medium">{selectedTime || "No seleccionada"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Servicio:</span>
            <span className="font-medium">{getServiceLabel(formData.specialty)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Sesiones:</span>
            <span className="font-medium">{formData.sessions || 1}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Paciente:</span>
            <span className="font-medium">{formData.patientName || "No especificado"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Email:</span>
            <span className="font-medium">{formData.email || "No especificado"}</span>
          </div>
        </div>

        <Button
          onClick={handleConfirmAppointment}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
          disabled={createAppointmentMutation.isPending || !isComplete}
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          {createAppointmentMutation.isPending ? "Confirmando..." : "Confirmar Reserva"}
        </Button>
        
        {!isComplete && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Completa todos los campos del formulario para confirmar tu cita
          </p>
        )}
      </CardContent>
    </Card>
  );
}