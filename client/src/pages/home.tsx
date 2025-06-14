import { useState } from "react";
import { HeartPulse, Calendar, Bot, Shield } from "lucide-react";
import { Link } from "wouter";
import BookingForm from "@/components/booking-form";
import CalendarView from "@/components/calendar-view";
import AppointmentSummary from "@/components/appointment-summary";
import AppointmentsList from "@/components/appointments-list";
import { useScrollIntoView } from "@/hooks/use-scroll-effects";


// Logo component inline
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
    {/* Persona 1: Levantando pesas */}
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
    {/* Persona 2: Corriendo */}
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
    {/* Conexiones */}
    <path d="M6 11 Q16 8 26 11" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6"/>
    <circle cx="4" cy="4" r="1" fill="#22c55e" opacity="0.8"/>
    <circle cx="28" cy="28" r="1" fill="#ef4444" opacity="0.8"/>
  </svg>
);

export default function Home() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [formData, setFormData] = useState({
    patientName: "",
    email: "",
    phone: "",
    specialty: "",
    sessions: 1,
    reason: "",
    reasonDetail: "",
  });

  // Scroll animation hooks for each section
  const heroRef = useScrollIntoView(0.2);
  const bookingRef = useScrollIntoView(0.3);
  const calendarRef = useScrollIntoView(0.3);
  const summaryRef = useScrollIntoView(0.3);
  const appointmentsRef = useScrollIntoView(0.3);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 opacity-0 animate-[slideInLeft_0.8s_ease-out_forwards]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 transition-all duration-300 hover:scale-110">
              <EcofisioLogo size={32} />
              <h1 className="text-xl font-semibold text-slate-900">Ecofisio</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <a href="#inicio" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1 transition-all duration-300 hover:scale-110 hover:text-blue-800">
                Inicio
              </a>
              <a href="#reservas" className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                Mis Reservas
              </a>
              <a href="#contacto" className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                Contacto
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section 
          ref={heroRef.ref}
          id="inicio" 
          className={`text-center mb-12 transition-all duration-1000 ${
            heroRef.isVisible 
              ? 'opacity-100 animate-[scrollBounceIn_1s_ease-out_forwards]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-3xl mx-auto">
            <h2 className={`text-4xl font-bold text-slate-900 mb-4 transition-all duration-700 delay-200 ${
              heroRef.isVisible 
                ? 'opacity-100 animate-[scrollFadeInUp_0.8s_ease-out_0.2s_forwards]' 
                : 'opacity-0 translate-y-10'
            }`}>
              Reserva tu Sesión de Kinesiología
            </h2>
            <p className={`text-xl text-slate-600 mb-8 transition-all duration-700 delay-400 ${
              heroRef.isVisible 
                ? 'opacity-100 animate-[scrollFadeInUp_0.8s_ease-out_0.4s_forwards]' 
                : 'opacity-0 translate-y-10'
            }`}>
              Sistema inteligente de reservas con asistencia de IA para orientación kinesiológica
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[scrollSlideInLeft_0.8s_ease-out_0.6s_forwards]' 
                  : 'opacity-0 -translate-x-20'
              }`}>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-[pulse_2s_ease-in-out_infinite]">
                  <Calendar className="text-blue-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Reserva Rápida</h3>
                <p className="text-sm text-slate-600">Agenda tu cita en minutos con nuestro calendario inteligente</p>
              </div>
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[scrollBounceIn_0.8s_ease-out_0.8s_forwards]' 
                  : 'opacity-0 translate-y-20'
              }`}>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-[pulse_2s_ease-in-out_infinite_0.5s]">
                  <Bot className="text-green-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Asistente IA</h3>
                <p className="text-sm text-slate-600">Recibe orientación inicial sobre tu sesión de kinesiología</p>
              </div>
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-700 hover:shadow-2xl hover:-translate-y-3 hover:scale-105 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[scrollSlideInRight_0.8s_ease-out_1s_forwards]' 
                  : 'opacity-0 translate-x-20'
              }`}>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4 animate-[pulse_2s_ease-in-out_infinite_1s]">
                  <Shield className="text-amber-600 w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Datos Seguros</h3>
                <p className="text-sm text-slate-600">Tu información de salud protegida y confidencial</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section 
          ref={bookingRef.ref}
          id="reservas" 
          className={`mb-12 transition-all duration-1000 ease-out transform hover:scale-105 hover:shadow-2xl ${
            bookingRef.isVisible 
              ? 'opacity-100 animate-[scrollSlideInLeft_1s_ease-out_forwards]' 
              : 'opacity-0 -translate-x-32 scale-95'
          }`}
        >
          <BookingForm 
            onFormDataChange={setFormData}
            formData={formData}
          />
        </section>

        {/* Calendar Section */}
        <section 
          ref={calendarRef.ref}
          className={`mb-12 transition-all duration-1000 ease-out transform hover:scale-105 hover:shadow-2xl ${
            calendarRef.isVisible 
              ? 'opacity-100 animate-[scrollSlideInRight_1s_ease-out_forwards]' 
              : 'opacity-0 translate-x-32 scale-95'
          }`}
        >
          <CalendarView 
            onDateSelect={setSelectedDate}
            onTimeSelect={setSelectedTime}
          />
        </section>

        {/* Appointment Summary */}
        <section 
          ref={summaryRef.ref}
          className={`mb-12 transition-all duration-1000 ease-out transform hover:scale-105 hover:shadow-2xl ${
            summaryRef.isVisible 
              ? 'opacity-100 animate-[scrollBounceIn_1s_ease-out_forwards]' 
              : 'opacity-0 translate-y-32 scale-90'
          }`}
        >
          <AppointmentSummary
            formData={formData}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />
        </section>

        {/* Appointments List */}
        <section 
          ref={appointmentsRef.ref}
          className={`transition-all duration-1000 ease-out transform hover:scale-105 hover:shadow-2xl ${
            appointmentsRef.isVisible 
              ? 'opacity-100 animate-[scrollFadeInUp_1s_ease-out_forwards]' 
              : 'opacity-0 translate-y-32 scale-95'
          }`}
        >
          <AppointmentsList />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <EcofisioLogo size={32} />
                <h1 className="text-xl font-semibold text-slate-900">Ecofisio</h1>
              </div>
              <p className="text-slate-600 mb-4">
                Sistema inteligente de reservas de kinesiología con asistencia de IA para una mejor atención fisioterapéutica.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Servicios</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Sesiones de Kinesiterapia y Fisioterapia</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Masaje Descontracturante</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Masaje de Relajación</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Contacto</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>canalmovimiento@gmail.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-200 mt-8 pt-8 text-center text-sm text-slate-600">
            <p>&copy; 2025 Ecofisio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
