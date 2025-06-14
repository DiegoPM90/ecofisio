import React from "react";
import { useState } from "react";
import { HeartPulse, Calendar, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <circle cx="28" cy="28" r="1" fill="#3b82f6" opacity="0.8"/>
  </svg>
);

export default function Home() {
  const [formData, setFormData] = useState({});
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentStep, setCurrentStep] = useState<'form' | 'calendar' | 'summary'>('form');
  const [showAppointments, setShowAppointments] = useState(false);

  const { ref: heroRef, isVisible: heroVisible } = useScrollIntoView();
  const { ref: servicesRef, isVisible: servicesVisible } = useScrollIntoView();
  const { ref: bookingRef, isVisible: bookingVisible } = useScrollIntoView();

  const handleFormDataChange = (data: any) => {
    setFormData(data);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('summary');
  };

  const handleFormSubmit = () => {
    setCurrentStep('calendar');
  };

  const handleBookingComplete = () => {
    setFormData({});
    setSelectedDate("");
    setSelectedTime("");
    setCurrentStep('form');
    setShowAppointments(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <EcofisioLogo size={40} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                EcoFisio
              </h1>
            </div>
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => setShowAppointments(!showAppointments)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                {showAppointments ? 'Reservar Cita' : 'Ver Citas'}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {showAppointments ? (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <AppointmentsList />
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section 
            ref={heroRef}
            className={`relative py-20 px-4 transition-all duration-1000 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-8">
                <EcofisioLogo size={80} />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Tu salud es nuestra
                <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  prioridad
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Fisioterapia profesional con enfoque personalizado. Reserva tu cita online 
                y comienza tu camino hacia una mejor calidad de vida.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 text-lg"
                onClick={() => document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Reservar Cita Ahora
              </Button>
            </div>
          </section>

          {/* Services Section */}
          <section 
            ref={servicesRef}
            className={`py-20 px-4 transition-all duration-1000 delay-300 ${
              servicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Nuestros Servicios
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { 
                    icon: HeartPulse, 
                    title: "Fisioterapia General", 
                    description: "Tratamiento integral para recuperación y prevención de lesiones" 
                  },
                  { 
                    icon: Bot, 
                    title: "Rehabilitación Deportiva", 
                    description: "Especializada en atletas y deportistas de alto rendimiento" 
                  },
                  { 
                    icon: Calendar, 
                    title: "Terapia Manual", 
                    description: "Técnicas especializadas para alivio del dolor y movilidad" 
                  }
                ].map((service, index) => (
                  <div 
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100"
                  >
                    <service.icon className="h-12 w-12 text-blue-600 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Booking Section */}
          <section 
            id="booking"
            ref={bookingRef}
            className={`py-20 px-4 bg-white transition-all duration-1000 delay-500 ${
              bookingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
                Reserva tu Cita
              </h2>
              
              {currentStep === 'form' && (
                <BookingForm 
                  onFormDataChange={handleFormDataChange}
                  formData={formData}
                  onSubmit={handleFormSubmit}
                />
              )}
              
              {currentStep === 'calendar' && (
                <CalendarView 
                  onDateSelect={handleDateSelect}
                  onTimeSelect={handleTimeSelect}
                  selectedDate={selectedDate}
                  specialty={formData.specialty}
                />
              )}
              
              {currentStep === 'summary' && (
                <AppointmentSummary 
                  formData={formData}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  onComplete={handleBookingComplete}
                />
              )}
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="mb-8">
            <EcofisioLogo size={60} />
          </div>
          <h3 className="text-2xl font-bold mb-4">EcoFisio</h3>
          <p className="text-gray-400 mb-6">Tu salud, nuestra pasión</p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-gray-500">&copy; 2024 EcoFisio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}