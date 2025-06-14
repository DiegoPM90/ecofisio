import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { LogOut, Users, Calendar, Shield, Activity } from "lucide-react";
import type { User, Appointment } from "@shared/schema";

export default function Admin() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => apiRequest("GET", "/api/admin/users"),
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => apiRequest("GET", "/api/appointments"),
  });

  // Mutations
  const updateUserRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario ha sido actualizado exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    },
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId: number) => {
      return apiRequest("DELETE", `/api/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = async () => {
    await logout();
  };

  const handleRoleUpdate = (userId: number, newRole: string) => {
    updateUserRoleMutation.mutate({ userId, role: newRole });
  };

  const handleDeleteAppointment = (appointmentId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta cita?")) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">No tienes permisos para acceder a esta página.</p>
            <Link href="/">
              <Button>Volver al Inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administrador</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {user.name || user.username}
              </span>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Ir a App
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Administradores: {users.filter((u: User) => u.role === 'admin').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{appointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Confirmadas: {appointments.filter((a: Appointment) => a.status === 'confirmed').length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado del Sistema</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Activo</div>
                <p className="text-xs text-muted-foreground">
                  Funcionando correctamente
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Gestión de Usuarios</TabsTrigger>
              <TabsTrigger value="appointments">Gestión de Citas</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usuarios del Sistema</CardTitle>
                  <CardDescription>
                    Gestiona los usuarios y sus roles en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="text-center py-4">Cargando usuarios...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuario</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((userData: User) => (
                          <TableRow key={userData.id}>
                            <TableCell className="font-medium">{userData.username}</TableCell>
                            <TableCell>{userData.email || 'No especificado'}</TableCell>
                            <TableCell>{userData.name || 'No especificado'}</TableCell>
                            <TableCell>
                              <Badge variant={userData.role === 'admin' ? 'default' : 'secondary'}>
                                {userData.role === 'admin' ? 'Administrador' : 'Usuario'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={userData.isActive ? 'default' : 'destructive'}>
                                {userData.isActive ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userData.id !== user.id && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRoleUpdate(
                                      userData.id,
                                      userData.role === 'admin' ? 'user' : 'admin'
                                    )}
                                    disabled={updateUserRoleMutation.isPending}
                                  >
                                    {userData.role === 'admin' ? 'Quitar Admin' : 'Hacer Admin'}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Appointments Tab */}
            <TabsContent value="appointments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Citas del Sistema</CardTitle>
                  <CardDescription>
                    Gestiona todas las citas programadas en el sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {appointmentsLoading ? (
                    <div className="text-center py-4">Cargando citas...</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Hora</TableHead>
                          <TableHead>Especialidad</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment: Appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">{appointment.patientName}</TableCell>
                            <TableCell>{appointment.date}</TableCell>
                            <TableCell>{appointment.time}</TableCell>
                            <TableCell>{appointment.specialty}</TableCell>
                            <TableCell>
                              <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteAppointment(appointment.id)}
                                disabled={deleteAppointmentMutation.isPending}
                              >
                                Eliminar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}