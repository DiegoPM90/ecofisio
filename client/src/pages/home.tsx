import { HeartPulse, Calendar, Bot, Shield } from "lucide-react";
import BookingForm from "@/components/booking-form";
import CalendarView from "@/components/calendar-view";
import AppointmentsList from "@/components/appointments-list";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <HeartPulse className="text-white w-4 h-4" />
              </div>
              <h1 className="text-xl font-semibold text-slate-900">KinesioReservas</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#inicio" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
                Inicio
              </a>
              <a href="#reservas" className="text-slate-600 hover:text-blue-600 transition-colors">
                Mis Reservas
              </a>
              <a href="#contacto" className="text-slate-600 hover:text-blue-600 transition-colors">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section id="inicio" className="text-center mb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Reserva tu Sesión de Kinesiología
            </h2>
            <p className="text-xl text-slate-600 mb-8">
              Sistema inteligente de reservas con asistencia de IA para orientación kinesiológica
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Reserva Rápida</h3>
                <p className="text-sm text-slate-600">Agenda tu cita en minutos con nuestro calendario inteligente</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Bot className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Asistente IA</h3>
                <p className="text-sm text-slate-600">Recibe orientación inicial sobre tu sesión de kinesiología</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="text-amber-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Datos Seguros</h3>
                <p className="text-sm text-slate-600">Tu información de salud protegida y confidencial</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section id="reservas" className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <BookingForm />
          </div>
          <div>
            <CalendarView />
          </div>
        </section>

        {/* Appointments List */}
        <AppointmentsList />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <HeartPulse className="text-white w-4 h-4" />
                </div>
                <h1 className="text-xl font-semibold text-slate-900">KinesioReservas</h1>
              </div>
              <p className="text-slate-600 mb-4">
                Sistema inteligente de reservas de kinesiología con asistencia de IA para una mejor atención fisioterapéutica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Rehabilitación Deportiva</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terapia Manual</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Neurorehabilitación</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Kinesiología Respiratoria</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>+34 900 123 456</li>
                <li>info@kinesioreservas.com</li>
                <li>Calle Rehabilitación 123, Madrid</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2024 KinesioReservas. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
