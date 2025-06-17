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
    selectedServices?: string[];
    age?: number;
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
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 409 || response.status === 400) {
          throw new Error(errorData.error || "UNKNOWN_ERROR");
        }
        throw new Error(`Error creating appointment: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (data: Appointment) => {
      setBookedAppointment(data);
      toast({
        title: "¡Cita confirmada!",
        description: "Tu sesión de kinesiología ha sido reservada exitosamente. Recibirás confirmación por email.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
    },
    onError: (error) => {
      const errorMessage = error.message;
      
      if (errorMessage === "SLOT_TAKEN") {
        toast({
          title: "Horario ocupado",
          description: "Este horario ya está reservado. Por favor selecciona otro disponible.",
          variant: "destructive",
        });
      } else if (errorMessage === "DUPLICATE_EMAIL") {
        toast({
          title: "Cita duplicada",
          description: "Ya tienes una cita agendada para esta fecha. Verifica tus reservas existentes.",
          variant: "destructive",
        });
      } else if (errorMessage === "INVALID_DAY") {
        toast({
          title: "Día no válido",
          description: "Solo se pueden agendar citas los días sábados.",
          variant: "destructive",
        });
      } else if (errorMessage === "INVALID_TIME") {
        toast({
          title: "Hora no válida",
          description: "Solo disponible de 10:00 a 13:00 los sábados.",
          variant: "destructive",
        });
      } else if (errorMessage === "PAST_DATE") {
        toast({
          title: "Fecha no válida",
          description: "No se pueden agendar citas en fechas pasadas.",
          variant: "destructive",
        });
      } else if (errorMessage === "DATE_FULL") {
        toast({
          title: "Fecha completa",
          description: "No hay más horarios disponibles para esta fecha. Selecciona otro sábado.",
          variant: "destructive",
        });
      } else if (errorMessage === "DUPLICATE_ENTRY") {
        toast({
          title: "Cita duplicada",
          description: "Esta cita ya existe en el sistema. Verifica tus reservas.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error al reservar",
          description: "No se pudo confirmar tu cita. Por favor intenta nuevamente.",
          variant: "destructive",
        });
      }
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
    if (!selectedDate || !selectedTime || !formData.selectedServices?.length || !formData.patientName || !formData.email || !formData.phone || !formData.age) {
      toast({
        title: "Información incompleta",
        description: "Por favor completa todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    // Use the first selected service as the primary specialty for booking
    const primaryService = formData.selectedServices[0];
    const servicesDescription = formData.selectedServices.map(service => {
      switch(service) {
        case 'rehabilitacion-fisioterapia': return 'Rehabilitación y Fisioterapia';
        case 'masajes-descontracturantes': return 'Masajes Descontracturantes';
        case 'masajes-relajantes': return 'Masajes Relajantes';
        case 'intervencion-kinesica-adulto-mayor': return 'Intervención Kinésica para el Adulto Mayor';
        default: return service;
      }
    }).join(', ');

    createAppointmentMutation.mutate({
      patientName: formData.patientName,
      email: formData.email,
      phone: formData.phone,
      date: selectedDate,
      time: selectedTime,
      specialty: primaryService,
      sessions: formData.sessions || 1,
      reason: servicesDescription,
      reasonDetail: `Edad: ${formData.age} años. Servicios solicitados: ${servicesDescription}`,
    });
  };

  const isComplete = selectedDate && selectedTime && formData.selectedServices?.length && formData.patientName && formData.email && formData.phone && formData.age;

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
              <div className="mt-3 flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-orange-700 border-orange-300 hover:bg-orange-100"
                  onClick={() => {
                    // Store the cancellation code for easy access on cancel page
                    localStorage.setItem('pendingCancelCode', bookedAppointment.cancelToken);
                    window.location.href = '/cancel';
                  }}
                >
                  Cancelar Cita
                </Button>
                <Link href="/status">
                  <Button variant="outline" size="sm" className="text-blue-700 border-blue-300 hover:bg-blue-100">
                    Ver Estado
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
    <Card className="opacity-100 w-full">
      <CardContent className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-3 sm:mb-4">Resumen de la Cita</h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Fecha:</span>
            <span className="font-medium text-right">{selectedDate || "No seleccionada"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Hora:</span>
            <span className="font-medium text-right">{selectedTime || "No seleccionada"}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-slate-600">Servicios:</span>
            <div className="font-medium text-right flex-1 ml-2">
              {formData.selectedServices?.length ? (
                <ul className="space-y-1">
                  {formData.selectedServices.map(service => (
                    <li key={service} className="text-sm">
                      {service === 'rehabilitacion-fisioterapia' && '• Rehabilitación y Fisioterapia'}
                      {service === 'masajes-descontracturantes' && '• Masajes Descontracturantes'}
                      {service === 'masajes-relajantes' && '• Masajes Relajantes'}
                      {service === 'intervencion-kinesica-adulto-mayor' && '• Intervención Kinésica para el Adulto Mayor'}
                    </li>
                  ))}
                </ul>
              ) : (
                "No seleccionados"
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Paciente:</span>
            <span className="font-medium text-right">{formData.patientName || "No especificado"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Edad:</span>
            <span className="font-medium text-right">{formData.age ? `${formData.age} años` : "No especificada"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Teléfono:</span>
            <span className="font-medium text-right">{formData.phone || "No especificado"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Email:</span>
            <span className="font-medium text-right text-sm break-all">{formData.email || "No especificado"}</span>
          </div>
        </div>

        <Button
          onClick={handleConfirmAppointment}
          className="w-full mt-4 sm:mt-6 bg-blue-600 hover:bg-blue-700 h-10 sm:h-11"
          disabled={createAppointmentMutation.isPending || !isComplete}
        >
          <CalendarCheck className="w-4 h-4 mr-2" />
          <span className="text-sm sm:text-base">
            {createAppointmentMutation.isPending ? "Confirmando..." : "Confirmar Reserva"}
          </span>
        </Button>
        
        {!isComplete && (
          <p className="text-xs text-slate-500 mt-2 text-center">
            Completa todos los campos requeridos para confirmar tu cita
          </p>
        )}
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-800">
              <p className="font-medium mb-1">Notificación automática por WhatsApp</p>
              <p>Al confirmar tu cita, recibirás automáticamente por WhatsApp:</p>
              <ul className="mt-1 space-y-0.5 ml-2">
                <li>• Código de confirmación de tu cita</li>
                <li>• Código de cancelación (por si necesitas cancelar)</li>
                <li>• Detalles completos de tu sesión</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}