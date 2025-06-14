import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { 
  Calendar, 
  Users, 
  Clock, 
  Settings, 
  LogOut, 
  Trash2, 
  Edit, 
  Shield,
  Activity,
  BarChart3
} from 'lucide-react';

export default function AdminPanel() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('appointments');

  useEffect(() => {
    // Verificar autenticación
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (!savedToken || !savedUser) {
      setLocation('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role !== 'admin') {
        setLocation('/login');
        return;
      }
      
      setUser(parsedUser);
      setToken(savedToken);
      loadAppointments(savedToken);
    } catch (error) {
      setLocation('/login');
    }
  }, [setLocation]);

  const loadAppointments = async (authToken: string) => {
    try {
      const response = await fetch('/api/admin/appointments', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setLocation('/');
  };

  const deleteAppointment = async (id: number) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/appointments/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setAppointments(appointments.filter(apt => apt.id !== id));
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Cargando panel de administración...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {status === 'confirmed' ? 'Confirmada' : status === 'pending' ? 'Pendiente' : 'Cancelada'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Estadísticas básicas
  const totalAppointments = appointments.length;
  const confirmedAppointments = appointments.filter((apt: any) => apt.status === 'confirmed').length;
  const todayAppointments = appointments.filter((apt: any) => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Panel de Administración</h1>
                <p className="text-sm text-slate-600">EcoFisio - Sistema de Gestión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user?.name || user?.username}</p>
                <p className="text-xs text-slate-500">Administrador</p>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-1 border border-slate-300 rounded-md text-sm hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Total de Citas</h3>
              <Calendar className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalAppointments}</div>
            <p className="text-xs text-slate-500">Todas las citas registradas</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Citas Confirmadas</h3>
              <Activity className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{confirmedAppointments}</div>
            <p className="text-xs text-slate-500">Citas activas y confirmadas</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-slate-600">Citas Hoy</h3>
              <Clock className="h-4 w-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{todayAppointments}</div>
            <p className="text-xs text-slate-500">Programadas para hoy</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'appointments' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Gestión de Citas
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Usuarios
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              Configuración
            </button>
          </nav>
        </div>

        {/* Content Area */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Todas las Citas</h2>
              <p className="text-sm text-slate-600">Gestiona y supervisa todas las citas programadas en el sistema</p>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8 text-slate-600">Cargando citas...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No hay citas programadas</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Paciente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Servicio</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Hora</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Estado</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contacto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {appointments.map((appointment: any) => (
                        <tr key={appointment.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                            {appointment.patientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div>
                              <div className="font-medium text-slate-900">{appointment.specialty}</div>
                              <div>{appointment.sessions} sesión(es)</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {formatDate(appointment.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {appointment.time}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(appointment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            <div>
                              <div>{appointment.email}</div>
                              <div className="text-slate-400">{appointment.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => alert('Función en desarrollo')}
                                className="text-blue-600 hover:text-blue-900 p-1"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteAppointment(appointment.id)}
                                className="text-red-600 hover:text-red-900 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Gestión de Usuarios</h2>
              <p className="text-sm text-slate-600">Administra roles y permisos de usuarios del sistema</p>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-slate-600">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Gestión de usuarios estará disponible pronto</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">Configuración del Sistema</h2>
              <p className="text-sm text-slate-600">Ajustes y configuraciones generales de la plataforma</p>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-slate-600">
                <Settings className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <p>Panel de configuración estará disponible pronto</p>
              </div>
            </div>
          </div>
        )}

        {/* Botón para volver al sitio principal */}
        <div className="mt-8 text-center">
          <button 
            onClick={() => setLocation('/')}
            className="inline-flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-md text-sm text-slate-700 hover:bg-slate-50"
          >
            <Calendar className="w-4 h-4" />
            <span>Volver al Sitio Principal</span>
          </button>
        </div>
      </main>
    </div>
  );
}