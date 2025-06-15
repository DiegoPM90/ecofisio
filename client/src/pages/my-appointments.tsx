import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, Mail, MapPin, ArrowLeft, Info } from "lucide-react";
import { useSEO } from "@/hooks/use-seo";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState, lazy, Suspense } from "react";
import { useLocation } from "wouter";

// Lazy load components for calendar and summary
const CalendarView = lazy(() => import("@/components/calendar-view"));
const AppointmentSummary = lazy(() => import("@/components/appointment-summary"));
const BookingForm = lazy(() => import("@/components/booking-form"));
const AIAssistant = lazy(() => import("@/components/ai-assistant"));

interface Appointment {
  id: string;
  patientName: string;
  email: string;
  phone: string;
  specialty: string;
  reason: string;
  reasonDetail?: string;
  date: string;
  time: string;
  sessions: number;
  status: string;
  kinesiologist: string;
  createdAt: string;
}

// Loading skeleton for components
const ComponentLoader = ({ height = "h-96" }: { height?: string }) => (
  <div className={`${height} bg-white rounded-xl border border-slate-200 animate-pulse`}>
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
        <div className="h-5 bg-slate-300 rounded w-48"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

interface FormData {
  patientName: string;
  email: string;
  phone: string;
  specialty: string;
  sessions: number;
  reason: string;
  reasonDetail: string;
  selectedServices: string[];
}

export default function MyAppointments() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  // State for new appointment creation
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [currentStep, setCurrentStep] = useState<"ai" | "form" | "calendar" | "summary">("ai");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    patientName: "",
    email: "",
    phone: "",
    specialty: "",
    sessions: 1,
    reason: "",
    reasonDetail: "",
    selectedServices: [],
  });

  // Reset flow when starting new appointment
  const handleNewAppointment = () => {
    setShowNewAppointment(!showNewAppointment);
    if (!showNewAppointment) {
      setCurrentStep("ai");
      setSelectedDate("");
      setSelectedTime("");
      setFormData({
        patientName: user?.name || "",
        email: user?.email || "",
        phone: "",
        specialty: "",
        sessions: 1,
        reason: "",
        reasonDetail: "",
        selectedServices: [],
      });
    }
  };
  
  useSEO({
    title: "Mis Citas - EcoFisio Centro",
    description: "Gestiona tus citas de kinesiología y fisioterapia",
  });

  const { data: appointments, isLoading, error } = useQuery<Appointment[]>({
    queryKey: ['/api/user/appointments'],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Acceso Requerido
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Necesitas iniciar sesión para ver tus citas
              </p>
              <Button onClick={() => window.location.href = '/auth'}>
                Iniciar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-red-500 text-sm">
                  Error al cargar las citas. Por favor intenta nuevamente.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getSpecialtyName = (specialty: string) => {
    const specialties: Record<string, string> = {
      'sesiones-kinesiterapia-fisioterapia': 'Rehabilitación',
      'kinesiterapia-respiratoria': 'Kinesiterapia Respiratoria',
      'estimulacion-temprana': 'Estimulación Temprana',
      'kinesiterapia-neurologia': 'Kinesiterapia Neurológica',
      'kinesiterapia-traumatologia': 'Kinesiterapia Traumatológica'
    };
    return specialties[specialty] || specialty;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'confirmada': 'default',
      'pendiente': 'secondary',
      'cancelada': 'destructive',
      'completada': 'outline'
    };
    
    const colors: Record<string, string> = {
      'confirmada': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'cancelada': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'completada': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };

    return (
      <Badge variant={variants[status] || 'secondary'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="mr-3 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Página Principal
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mis Citas de Kinesiología
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona y revisa todas tus citas programadas
          </p>
        </div>

        {/* Usuario actual */}
        <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  {user?.name}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {user?.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botón para nueva cita */}
        <div className="mb-6">
          <Button 
            onClick={handleNewAppointment}
            className="w-full sm:w-auto"
          >
            {showNewAppointment ? (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Mis Citas
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Nueva Cita
              </>
            )}
          </Button>
        </div>

        {showNewAppointment ? (
          <>
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">Progreso de tu cita</span>
                <span className="text-sm text-gray-500">
                  {currentStep === "ai" && "Paso 1 de 4"}
                  {currentStep === "form" && "Paso 2 de 4"}
                  {currentStep === "calendar" && "Paso 3 de 4"}
                  {currentStep === "summary" && "Paso 4 de 4"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: 
                      currentStep === "ai" ? "25%" :
                      currentStep === "form" ? "50%" :
                      currentStep === "calendar" ? "75%" :
                      currentStep === "summary" ? "100%" : "0%"
                  }}
                ></div>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span className={currentStep === "ai" ? "font-medium text-blue-600" : ""}>Consulta IA</span>
                <span className={currentStep === "form" ? "font-medium text-blue-600" : ""}>Información</span>
                <span className={currentStep === "calendar" ? "font-medium text-blue-600" : ""}>Calendario</span>
                <span className={currentStep === "summary" ? "font-medium text-blue-600" : ""}>Resumen</span>
              </div>
            </div>

            {/* Paso 1: Pregúntale a la IA */}
            {currentStep === "ai" && (
              <div className="space-y-6">
                {/* Client consultation text box */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Cuéntanos sobre tu consulta
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Describe brevemente tu lesión o consulta
                        </label>
                        <textarea
                          value={formData.reasonDetail}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 400) {
                              setFormData({...formData, reasonDetail: value});
                            }
                          }}
                          placeholder="Ejemplo: Tengo dolor en la espalda baja desde hace una semana, empeora al estar sentado mucho tiempo..."
                          className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-gray-500">
                            Comparte los detalles que consideres importantes para tu evaluación
                          </p>
                          <span className={`text-xs ${formData.reasonDetail?.length > 350 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {formData.reasonDetail?.length || 0}/400
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">Importante recordar</p>
                            <p>Esta orientación de IA es solo informativa. Siempre es necesario consultar con un kinesiólogo profesional para un diagnóstico y tratamiento adecuado.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Show AI consultation - always available */}
                <Suspense fallback={<ComponentLoader height="h-[400px]" />}>
                  <AIAssistant
                    reason={formData.reason || "consulta-general"}
                    reasonDetail={formData.reasonDetail || ""}
                    specialty={formData.specialty || "sesiones-kinesiterapia-fisioterapia"}
                  />
                </Suspense>

                {/* Service Classification */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <User className="h-5 w-5 mr-2 text-blue-600" />
                      Clasificación de Servicios
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                      Selecciona uno o más servicios que necesitas (puedes elegir varios)
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { id: 'rehabilitacion-kinesica', label: 'Rehabilitación Kinésica y Fisioterapia' },
                          { id: 'masajes-descontracturantes', label: 'Masajes Descontracturantes' },
                          { id: 'masajes-relajantes', label: 'Masajes Relajantes' },
                          { id: 'psicomotricidad-adulto-mayor', label: 'Psicomotricidad Adulto Mayor' }
                        ].map((service) => (
                          <div key={service.id} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                            <input
                              type="checkbox"
                              id={service.id}
                              checked={formData.selectedServices?.includes(service.id) || false}
                              onChange={(e) => {
                                const currentServices = formData.selectedServices || [];
                                const newServices = e.target.checked
                                  ? [...currentServices, service.id]
                                  : currentServices.filter(s => s !== service.id);
                                setFormData({...formData, selectedServices: newServices});
                              }}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label
                              htmlFor={service.id}
                              className="text-sm text-slate-700 cursor-pointer flex-1"
                            >
                              {service.label}
                            </label>
                          </div>
                        ))}
                      </div>
                      
                      {formData.selectedServices?.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Describe tu situación específica
                          </label>
                          <textarea
                            value={formData.reasonDetail}
                            onChange={(e) => setFormData({...formData, reasonDetail: e.target.value})}
                            placeholder="Explica con más detalle tu molestia, necesidad o lo que esperas del tratamiento..."
                            className="w-full p-3 border border-gray-300 rounded-md h-24 resize-none"
                            maxLength={400}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            {formData.reasonDetail?.length || 0}/400 caracteres
                          </div>
                        </div>
                      )}

                      {formData.selectedServices?.length > 0 && (
                        <Button
                          onClick={() => setCurrentStep("calendar")}
                          className="w-full"
                        >
                          Continuar al Calendario
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}



            {/* Paso 3: Selección de fecha (después de completar formulario) */}
            {currentStep === "calendar" && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    Selecciona Fecha y Hora
                  </CardTitle>
                </CardHeader>
                <CardContent>

                  <Suspense fallback={<ComponentLoader height="h-[500px]" />}>
                    <CalendarView 
                      onDateSelect={(date) => {
                        setSelectedDate(date);
                        // No auto-advance - let user control navigation
                      }}
                      onTimeSelect={(time) => {
                        setSelectedTime(time);
                        // No auto-advance - let user control navigation
                      }}
                    />
                  </Suspense>
                  
                  {/* Navigation controls for calendar step */}
                  <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("form")}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Volver a Información
                    </Button>
                    
                    <Button
                      onClick={() => setCurrentStep("summary")}
                      disabled={!selectedDate || !selectedTime}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      Ver Resumen de Cita
                      <ArrowLeft className="h-4 w-4 ml-1 rotate-180" />
                    </Button>
                  </div>
                  
                  {/* Calendar completion feedback */}
                  {(!selectedDate || !selectedTime) && (
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-amber-800">
                          <p className="font-medium mb-1">Selecciona fecha y hora para continuar:</p>
                          <ul className="space-y-0.5 ml-2 text-xs">
                            {!selectedDate && <li>• Escoge una fecha disponible</li>}
                            {!selectedTime && <li>• Selecciona un horario</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Paso 4: Resumen de la cita */}
            {currentStep === "summary" && selectedDate && selectedTime && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-green-600" />
                    Resumen de tu Cita
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Navigation control for summary step */}
                  <div className="mb-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep("calendar")}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Volver al Calendario
                    </Button>
                  </div>

                  <Suspense fallback={<ComponentLoader height="h-80" />}>
                    <AppointmentSummary
                      formData={formData}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                    />
                  </Suspense>
                </CardContent>
              </Card>
            )}


          </>
        ) : (
          <>
            {/* Lista de citas existentes */}
            {!appointments || (Array.isArray(appointments) && appointments.length === 0) ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No tienes citas programadas
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      Agenda tu primera cita de kinesiología
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
          <div className="space-y-4">
            {(appointments || []).map((appointment: Appointment) => (
              <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {getSpecialtyName(appointment.specialty)}
                      </CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {appointment.reason}
                      </p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{appointment.time}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{appointment.kinesiologist}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{appointment.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{appointment.email}</span>
                      </div>
                      {appointment.sessions > 1 && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                          <span>{appointment.sessions} sesiones programadas</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {appointment.reasonDetail && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Detalles:</strong> {appointment.reasonDetail}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              ))}
            </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}