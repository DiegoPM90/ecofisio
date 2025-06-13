import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListChecks, UserRound, RefreshCw, MoreVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment } from "@shared/schema";

export default function AppointmentsList() {
  const { data: appointments = [], isLoading, refetch } = useQuery<Appointment[]>({
    queryKey: ["/api/appointments"],
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][date.getDay()];
    const day = date.getDate();
    const monthNames = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day} de ${month} ${year}`;
  };

  const getSpecialtyLabel = (specialty: string) => {
    const labels = {
      "medicina-general": "Medicina General",
      "pediatria": "Pediatría",
      "cardiologia": "Cardiología",
      "dermatologia": "Dermatología",
      "ginecologia": "Ginecología"
    };
    return labels[specialty as keyof typeof labels] || specialty;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Confirmada</Badge>;
      case "pending":
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Pendiente</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Cancelada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <section>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-6 w-48" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-12 h-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <ListChecks className="text-white w-4 h-4" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Mis Citas Médicas</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </Button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <UserRound className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-slate-600 mb-2">No tienes citas programadas</h4>
              <p className="text-slate-500">Reserva tu primera consulta usando el formulario de arriba</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <UserRound className="text-blue-600 w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900">
                          {appointment.doctorName} - {getSpecialtyLabel(appointment.specialty)}
                        </h4>
                        <p className="text-sm text-slate-600">
                          {formatDate(appointment.date)} - {appointment.time}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Motivo: {appointment.reason}
                        </p>
                        {appointment.patientName && (
                          <p className="text-xs text-slate-500">
                            Paciente: {appointment.patientName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(appointment.status)}
                      <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
