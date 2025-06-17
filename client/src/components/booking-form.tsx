import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAppointmentSchema, type InsertAppointment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { UserRound, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";

interface BookingFormProps {
  onFormDataChange: (data: any) => void;
  formData: any;
  showNavigationButton?: boolean;
}

export default function BookingForm({ onFormDataChange, formData, showNavigationButton = true }: BookingFormProps) {
  const { isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  
  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: formData,
  });

  // Watch form values and update parent state
  const watchedValues = form.watch();
  
  useEffect(() => {
    onFormDataChange(watchedValues);
  }, [watchedValues, onFormDataChange]);

  const isFormComplete = () => {
    const values = form.getValues();
    return values.patientName && values.email && values.phone && 
           values.specialty;
  };

  const handleContinueToBooking = () => {
    if (!isAuthenticated) {
      setLocation('/auth');
      return;
    }
    
    if (isFormComplete()) {
      setLocation('/my-appointments');
    }
  };

  const commonReasons = [
    { value: "dolor-muscular", label: "Dolor muscular" },
    { value: "lesion-deportiva", label: "Lesión de rehabilitación" },
    { value: "rehabilitacion-postoperatoria", label: "Rehabilitación post-operatoria" },
    { value: "problemas-respiratorios", label: "Problemas respiratorios" },
    { value: "contracturas", label: "Contracturas" },
    { value: "mejora-movilidad", label: "Mejora de movilidad" },
    { value: "otro", label: "Otro motivo" },
  ];

  return (
    <Card className="w-full shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/20 to-purple-50/20 backdrop-blur-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex items-center space-x-4 mb-6 sm:mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
            <UserRound className="text-white w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Información de la Reserva
            </h3>
            <p className="text-slate-600 mt-1">Complete sus datos para agendar la cita</p>
          </div>
        </div>

        <Form {...form}>
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-slate-700 font-semibold group-focus-within:text-blue-600 transition-colors">
                      Nombre Completo *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ingresa tu nombre completo" 
                        {...field} 
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="group">
                    <FormLabel className="text-slate-700 font-semibold group-focus-within:text-blue-600 transition-colors">
                      Correo Electrónico *
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="tu@email.com" 
                        {...field} 
                        className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-300"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono *</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 XXX XXX XXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="specialty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Servicio *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar servicio" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sesiones-kinesiterapia-fisioterapia">Sesiones de Kinesiterapia y Fisioterapia</SelectItem>
                        <SelectItem value="masaje-descontracturante">Masaje Descontracturante</SelectItem>
                        <SelectItem value="masaje-relajacion">Masaje de Relajación</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sessions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Sesiones *</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cantidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">1 sesión</SelectItem>
                      <SelectItem value="2">2 sesiones</SelectItem>
                      <SelectItem value="3">3 sesiones</SelectItem>
                      <SelectItem value="4">4 sesiones</SelectItem>
                      <SelectItem value="5">5 sesiones</SelectItem>
                      <SelectItem value="6">6 sesiones</SelectItem>
                      <SelectItem value="8">8 sesiones</SelectItem>
                      <SelectItem value="10">10 sesiones</SelectItem>
                      <SelectItem value="12">12 sesiones</SelectItem>
                      <SelectItem value="15">15 sesiones</SelectItem>
                      <SelectItem value="20">20 sesiones</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />





            {/* Botón para continuar con la reserva - solo en página principal */}
            {showNavigationButton && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <Button
                  onClick={handleContinueToBooking}
                  disabled={!isFormComplete()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {!isAuthenticated 
                    ? "Iniciar Sesión para Continuar" 
                    : "Seleccionar Fecha y Hora"
                  }
                </Button>
                {!isFormComplete() && (
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Completa todos los campos requeridos para continuar
                  </p>
                )}
              </div>
            )}

            {/* Estado de progreso cuando está en Mis Citas */}
            {!showNavigationButton && isFormComplete() && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="text-center">
                  <div className="inline-flex items-center px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
                    <span className="text-sm text-green-700 dark:text-green-300">
                      Formulario completado - Continuando a selección de fecha...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
