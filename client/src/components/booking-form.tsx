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
import { UserRound } from "lucide-react";
import AIAssistant from "./ai-assistant";

interface BookingFormProps {
  onFormDataChange: (data: any) => void;
  formData: any;
}

export default function BookingForm({ onFormDataChange, formData }: BookingFormProps) {
  const form = useForm<InsertAppointment>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: formData,
  });

  // Watch form values and update parent state
  const watchedValues = form.watch();
  
  useEffect(() => {
    onFormDataChange(watchedValues);
  }, [watchedValues, onFormDataChange]);

  const commonReasons = [
    { value: "dolor-muscular", label: "Dolor muscular" },
    { value: "lesion-deportiva", label: "Lesión deportiva" },
    { value: "rehabilitacion-postoperatoria", label: "Rehabilitación post-operatoria" },
    { value: "problemas-respiratorios", label: "Problemas respiratorios" },
    { value: "contracturas", label: "Contracturas" },
    { value: "mejora-movilidad", label: "Mejora de movilidad" },
    { value: "otro", label: "Otro motivo" },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <UserRound className="text-white w-4 h-4" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900">Información de la Reserva</h3>
        </div>

        <Form {...form}>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
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

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de la Consulta *</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                      {commonReasons.map((reason) => (
                        <div key={reason.value} className="flex items-center space-x-3 p-3 border border-slate-200 rounded-lg">
                          <RadioGroupItem value={reason.value} id={reason.value} />
                          <label
                            htmlFor={reason.value}
                            className="text-sm text-slate-700 cursor-pointer flex-1"
                          >
                            {reason.label}
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reasonDetail"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Describe brevemente tus síntomas o motivo de consulta..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <AIAssistant
              reason={form.watch("reason")}
              reasonDetail={form.watch("reasonDetail") ?? undefined}
              specialty={form.watch("specialty")}
            />
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}
