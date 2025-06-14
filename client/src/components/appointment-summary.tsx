import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertAppointment } from "@shared/schema";

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

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: InsertAppointment) => {
      return await appointmentApi.createAppointment(data);
    },
    onSuccess: () => {
      toast({
        title: "¡Cita confirmada!",
        description: "Tu sesión de kinesiología ha sido reservada exitosamente.",
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