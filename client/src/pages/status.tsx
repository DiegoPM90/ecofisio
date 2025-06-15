import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { appointmentApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Search, Calendar, Clock, User, Stethoscope, ArrowLeft, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import RobustNavigation from "@/components/robust-navigation";
import type { Appointment } from "@shared/schema";

// Logo component
const EcofisioLogo = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <defs>
      <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="16" cy="16" r="15" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1"/>
    <g transform="translate(8, 8)">
      <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradient)"/>
      <rect x="-0.5" y="1.5" width="1" height="3" fill="url(#exerciseGradient)"/>
      <line x1="-2" y1="2.5" x2="2" y2="2.5" stroke="url(#exerciseGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="-2.5" y="2" width="1" height="1" fill="#64748b"/>
      <rect x="1.5" y="2" width="1" height="1" fill="#64748b"/>
      <line x1="-0.5" y1="4.5" x2="-1" y2="6" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.5" y1="4.5" x2="1" y2="6" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <circle cx="-2" cy="2.5" r="0.3" fill="#22c55e"/>
      <circle cx="2" cy="2.5" r="0.3" fill="#22c55e"/>
    </g>
    <g transform="translate(16, 20)">
      <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradient)"/>
      <line x1="0" y1="1.5" x2="0.5" y2="3.5" stroke="url(#exerciseGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="0" y1="2" x2="-1.5" y2="1.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0" y1="2" x2="1.5" y2="2.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.5" y1="3.5" x2="0" y2="5.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.5" y1="3.5" x2="1.5" y2="4.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <rect x="-1.7" y="1.3" width="0.4" height="0.4" fill="#8b5cf6"/>
      <circle cx="0" cy="2.5" r="0.3" fill="#ef4444"/>
    </g>
    <path d="M6 11 Q16 8 26 11" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6"/>
    <circle cx="4" cy="4" r="1" fill="#22c55e" opacity="0.8"/>
    <circle cx="28" cy="28" r="1" fill="#ef4444" opacity="0.8"/>
  </svg>
);

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
      'sports': 'Kinesiología de Rehabilitación',
      'respiratory': 'Kinesiología Respiratoria', 
      'neurological': 'Kinesiología Neurológica',
      'traumatological': 'Kinesiología Traumatológica'
    };
    return specialties[specialty] || specialty;
  };

  if (foundAppointment) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />

        <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="w-full max-w-lg mx-2 shadow-lg">
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
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Card className="w-full max-w-lg mx-2 shadow-lg">
          <CardHeader className="text-center p-4 sm:p-6 pb-2 sm:pb-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg sm:text-xl text-gray-800">Consultar Estado de Cita</CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">
              Ingresa tu código para ver el estado de tu cita
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0">
            <div className="space-y-2">
              <Label htmlFor="searchToken" className="text-xs sm:text-sm font-medium text-gray-700">
                Código de Cita
              </Label>
              <Input
                id="searchToken"
                type="text"
                placeholder="Ingresa tu código de cita o cancelación"
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full h-12 text-base"
                disabled={searchAppointmentMutation.isPending}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchToken.trim()) {
                    handleSearchAppointment();
                  }
                }}
              />
              <p className="text-xs text-gray-500">
                Este código te fue enviado por WhatsApp y correo cuando confirmaste tu cita
              </p>
            </div>

            <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-blue-700">
                  <p className="font-medium mb-1">¿Cómo encontrar tu código?</p>
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 text-xs">
                    <li>Revisa el WhatsApp de confirmación</li>
                    <li>Busca en tu correo electrónico</li>
                    <li>Es el mismo código para consultar y cancelar</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 sm:space-x-3">
              <Button
                onClick={handleSearchAppointment}
                disabled={!searchToken.trim() || searchAppointmentMutation.isPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-12 text-sm sm:text-base"
              >
                {searchAppointmentMutation.isPending ? "Buscando..." : "Consultar Estado"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation("/")}
                disabled={searchAppointmentMutation.isPending}
                className="px-3 sm:px-4 h-12"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}