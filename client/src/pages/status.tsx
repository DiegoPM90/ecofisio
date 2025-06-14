import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { appointmentApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, User, Stethoscope, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Appointment } from "@shared/schema";

export default function Status() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchToken, setSearchToken] = useState("");
  const [foundAppointment, setFoundAppointment] = useState<Appointment | null>(null);

  const searchAppointmentMutation = useMutation({
    mutationFn: async (token: string) => {
      if (!token.trim()) {
        throw new Error("Por favor ingresa tu código de cita");
      }
      return await appointmentApi.getAppointmentStatus(token);
    },
    onSuccess: (data) => {
      setFoundAppointment(data.appointment);
      setSearchToken("");
    },
    onError: (error) => {
      toast({
        title: "Cita no encontrada",
        description: error.message || "No se encontró ninguna cita con ese código. Verifica que sea correcto.",
        variant: "destructive",
      });
    },
  });

  const handleSearchAppointment = () => {
    searchAppointmentMutation.mutate(searchToken);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge variant="default" className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" />Confirmada</Badge>;
      case 'cancelada':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
      case 'completada':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Completada</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Desconocido</Badge>;
    }
  };

  const formatSpecialty = (specialty: string) => {
    const specialties: Record<string, string> = {
      'sports': 'Kinesiología Deportiva',
      'respiratory': 'Kinesiología Respiratoria', 
      'neurological': 'Kinesiología Neurológica',
      'traumatological': 'Kinesiología Traumatológica'
    };
    return specialties[specialty] || specialty;
  };

  if (foundAppointment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-xl text-gray-800">Estado de tu Cita</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">Información de la Cita</h3>
                {getStatusBadge(foundAppointment.status)}
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span><strong>Paciente:</strong> {foundAppointment.patientName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span><strong>Fecha:</strong> {new Date(foundAppointment.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span><strong>Hora:</strong> {foundAppointment.time}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <span><strong>Kinesiólogo:</strong> {foundAppointment.kinesiologistName}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4 text-gray-500" />
                  <span><strong>Especialidad:</strong> {formatSpecialty(foundAppointment.specialty)}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span><strong>Sesiones:</strong> {foundAppointment.sessions}</span>
                </div>
              </div>
            </div>
            
            {foundAppointment.status === 'pendiente' && (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-medium text-green-800 mb-2">Tu cita está confirmada</h4>
                <p className="text-sm text-green-700">
                  Recuerda llegar 10 minutos antes de tu cita. Si necesitas cancelar, puedes usar tu código de cancelación.
                </p>
              </div>
            )}
            
            {foundAppointment.status === 'cancelada' && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">Esta cita fue cancelada</h4>
                <p className="text-sm text-red-700">
                  Puedes programar una nueva cita cuando gustes desde nuestra página principal.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              {foundAppointment.status === 'pendiente' && (
                <Button 
                  onClick={() => setLocation("/cancel")}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                >
                  Cancelar Cita
                </Button>
              )}
              <Button 
                onClick={() => setLocation("/")}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                {foundAppointment.status === 'cancelada' ? 'Nueva Cita' : 'Ir al Inicio'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFoundAppointment(null);
                  setSearchToken("");
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
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl text-gray-800">Consultar Estado de Cita</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Ingresa tu código para ver el estado de tu cita
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="searchToken" className="text-sm font-medium text-gray-700">
              Código de Cita
            </Label>
            <Input
              id="searchToken"
              type="text"
              placeholder="Ingresa tu código de cita o cancelación"
              value={searchToken}
              onChange={(e) => setSearchToken(e.target.value)}
              className="w-full"
              disabled={searchAppointmentMutation.isPending}
            />
            <p className="text-xs text-gray-500">
              Este código te fue enviado por WhatsApp y correo cuando confirmaste tu cita
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">¿Cómo encontrar tu código?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Revisa el WhatsApp de confirmación</li>
                  <li>Busca en tu correo electrónico</li>
                  <li>Es el mismo código para consultar y cancelar</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleSearchAppointment}
              disabled={!searchToken.trim() || searchAppointmentMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {searchAppointmentMutation.isPending ? "Buscando..." : "Consultar Estado"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation("/")}
              disabled={searchAppointmentMutation.isPending}
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