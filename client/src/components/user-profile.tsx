import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Clock, User, Shield, LogOut, Phone, Mail } from "lucide-react";
import type { Appointment } from "@shared/schema";

export default function UserProfile() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Consultar las citas del usuario
  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["/api/appointments"],
    queryFn: async () => {
      const response = await fetch("/api/appointments", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Error al cargar las citas");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No hay usuario autenticado</p>
      </div>
    );
  }

  const appointments: Appointment[] = Array.isArray(appointmentsData) ? appointmentsData : [];
  const userInitials = user.name
    .split(" ")
    .map(name => name.charAt(0))
    .join("")
    .toUpperCase();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "completada":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "cancelada":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Información del usuario */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="text-lg font-semibold bg-primary text-primary-foreground">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  {user.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 mt-1">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rol:</span>
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role === "admin" ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Administrador
                  </>
                ) : (
                  "Cliente"
                )}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estado:</span>
              <Badge variant={(user.isActive !== false) ? "default" : "destructive"}>
                {(user.isActive !== false) ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Miembro desde:</span>
              <span className="text-sm">
                {user.createdAt 
                  ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "Fecha no disponible"
                }
              </span>
            </div>

            <Separator />

            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="w-full"
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
            </Button>
          </CardContent>
        </Card>

        {/* Citas del usuario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mis Citas
            </CardTitle>
            <CardDescription>
              {appointments.length > 0 
                ? `Tienes ${appointments.length} cita${appointments.length > 1 ? 's' : ''} registrada${appointments.length > 1 ? 's' : ''}`
                : "No tienes citas registradas"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">Cargando citas...</p>
              </div>
            ) : appointments.length > 0 ? (
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{appointment.specialty}</h4>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(appointment.date)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </div>
                        {appointment.kinesiologistName && (
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {appointment.kinesiologistName}
                          </div>
                        )}
                      </div>
                      
                      <p className="text-sm">
                        <strong>Motivo:</strong> {appointment.reason}
                      </p>
                      
                      {appointment.reasonDetail && (
                        <p className="text-xs text-muted-foreground">
                          {appointment.reasonDetail}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No tienes citas programadas
                </p>
                <Button variant="outline" size="sm">
                  Agendar nueva cita
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}