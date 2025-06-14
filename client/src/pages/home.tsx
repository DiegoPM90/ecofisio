import { useState, lazy, Suspense } from "react";
import { HeartPulse, Calendar, Bot, Shield, Menu, X } from "lucide-react";
import { Link } from "wouter";
import { useScrollIntoView } from "@/hooks/use-scroll-effects";
import { useSEO } from "@/hooks/use-seo";

// Lazy load heavy components for better initial page load
const BookingForm = lazy(() => import("@/components/booking-form"));
const CalendarView = lazy(() => import("@/components/calendar-view"));
const AppointmentSummary = lazy(() => import("@/components/appointment-summary"));
const AppointmentsList = lazy(() => import("@/components/appointments-list"));

// Loading skeleton for form components
const ComponentLoader = ({ height = "h-96" }: { height?: string }) => (
  <div className={`${height} bg-white rounded-xl border border-slate-200 animate-pulse`}>
    <div className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-slate-300 rounded-lg"></div>
        <div className="h-5 bg-slate-300 rounded w-48"></div>
      </div>
      <div className="space-y-4">
        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);


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
  // SEO optimization for homepage
  useSEO({
    title: 'Ecofisio - Reserva tu Sesión de Kinesiología Online',
    description: 'Agenda sesiones de kinesiología y fisioterapia con profesionales certificados. Sistema inteligente con IA para orientación personalizada. Reserva fácil y rápida.',
    keywords: 'kinesiología online, fisioterapia, reserva cita, rehabilitación, masajes terapéuticos, consulta IA, profesionales certificados',
    ogTitle: 'Ecofisio - Tu Centro de Kinesiología Digital',
    ogDescription: 'Reserva sesiones de kinesiología con los mejores profesionales. Sistema inteligente y consulta IA incluida.'
  });

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <header className="bg-white shadow-sm border-b border-slate-200 opacity-0 animate-[slideInLeft_0.8s_ease-out_forwards] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-3 transition-all duration-300 hover:scale-110">
              <EcofisioLogo size={28} />
              <h1 className="text-lg sm:text-xl font-semibold text-slate-900">Ecofisio</h1>
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-md text-slate-600 hover:text-blue-600 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-4 lg:space-x-6 items-center">
              <a href="#inicio" className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1 transition-all duration-300 hover:scale-110 hover:text-blue-800 text-sm lg:text-base">
                Inicio
              </a>
              <a href="#reservas" className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 text-sm lg:text-base">
                Reservas
              </a>
              <Link href="/status" className="text-slate-600 hover:text-blue-600 transition-all duration-300 hover:scale-110 hover:-translate-y-1 text-sm lg:text-base">
                Estado de Citas
              </Link>
            </nav>
          </div>
        </div>
        
        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-200 shadow-lg">
            <nav className="px-3 py-4 space-y-3">
              <a 
                href="#inicio" 
                className="block px-3 py-2 text-blue-600 font-medium bg-blue-50 rounded-md text-sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </a>
              <a 
                href="#reservas" 
                className="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md text-sm transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Reservas
              </a>
              <Link 
                href="/status" 
                className="block px-3 py-2 text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-md text-sm transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Estado de Cita
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <section 
          ref={heroRef.ref}
          id="inicio" 
          className={`text-center mb-8 sm:mb-12 transition-all duration-1000 ${
            heroRef.isVisible 
              ? 'opacity-100 animate-[scrollBounceIn_1s_ease-out_forwards]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-3xl mx-auto px-2">
            <h2 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-3 sm:mb-4 transition-all duration-700 delay-200 ${
              heroRef.isVisible 
                ? 'opacity-100 animate-[scrollFadeInUp_0.8s_ease-out_0.2s_forwards]' 
                : 'opacity-0 translate-y-10'
            }`}>
              Reserva tu Sesión de Kinesiología
            </h2>
            <p className={`text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 px-2 transition-all duration-700 delay-400 ${
              heroRef.isVisible 
                ? 'opacity-100 animate-[scrollFadeInUp_0.8s_ease-out_0.4s_forwards]' 
                : 'opacity-0 translate-y-10'
            }`}>
              Sistema inteligente de reservas con asistencia de IA para orientación kinesiológica
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[cardFadeIn_1.5s_ease-out_0.8s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Calendar className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Reserva Rápida</h3>
                <p className="text-xs sm:text-sm text-slate-600">Agenda tu cita en minutos con nuestro calendario inteligente</p>
              </div>
              <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[cardSlideUp_1.5s_ease-out_1.2s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bot className="text-green-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Asistente IA</h3>
                <p className="text-xs sm:text-sm text-slate-600">Recibe orientación inicial sobre tu sesión de kinesiología</p>
              </div>
              <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] sm:col-span-2 lg:col-span-1 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[cardGentleScale_1.5s_ease-out_1.6s_forwards]' 
                  : 'opacity-0 scale-90'
              }`}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Shield className="text-amber-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Datos Seguros</h3>
                <p className="text-xs sm:text-sm text-slate-600">Tu información de salud protegida y confidencial</p>
              </div>
            </div>
          </div>
        </section>

        {/* Booking Section */}
        <section 
          ref={bookingRef.ref}
          id="reservas" 
          className={`mb-6 sm:mb-12 transition-all duration-1000 ease-out transform sm:hover:scale-105 sm:hover:shadow-2xl ${
            bookingRef.isVisible 
              ? 'opacity-100 animate-[scrollSlideInLeft_1s_ease-out_forwards]' 
              : 'opacity-0 -translate-x-32 scale-95'
          }`}
        >
          <Suspense fallback={<ComponentLoader />}>
            <BookingForm 
              onFormDataChange={setFormData}
              formData={formData}
            />
          </Suspense>
        </section>

        {/* Calendar Section */}
        <section 
          ref={calendarRef.ref}
          className={`mb-6 sm:mb-12 transition-all duration-1000 ease-out transform sm:hover:scale-105 sm:hover:shadow-2xl ${
            calendarRef.isVisible 
              ? 'opacity-100 animate-[scrollSlideInRight_1s_ease-out_forwards]' 
              : 'opacity-0 translate-x-32 scale-95'
          }`}
        >
          <Suspense fallback={<ComponentLoader height="h-[500px]" />}>
            <CalendarView 
              onDateSelect={setSelectedDate}
              onTimeSelect={setSelectedTime}
            />
          </Suspense>
        </section>

        {/* Appointment Summary */}
        <section 
          ref={summaryRef.ref}
          className={`mb-6 sm:mb-12 transition-all duration-500 ease-out transform sm:hover:scale-105 sm:hover:shadow-2xl ${
            summaryRef.isVisible 
              ? 'opacity-100 animate-[scrollBounceIn_0.5s_ease-out_forwards]' 
              : 'opacity-0 translate-y-16 scale-95'
          }`}
        >
          <Suspense fallback={<ComponentLoader height="h-80" />}>
            <AppointmentSummary
              formData={formData}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
            />
          </Suspense>
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
