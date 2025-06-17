import { useState } from "react";
import { HeartPulse, Calendar, Bot, Shield } from "lucide-react";
import { Link } from "wouter";
import { useScrollIntoView } from "@/hooks/use-scroll-effects";
import { useSEO } from "@/hooks/use-seo";
import Navigation from "@/components/navigation";

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
    <g transform="translate(20, 8)">
      <circle cx="0" cy="0" r="1.2" fill="url(#exerciseGradient)"/>
      <rect x="-0.4" y="1.2" width="0.8" height="2.5" fill="url(#exerciseGradient)"/>
      <line x1="-0.8" y1="2" x2="-1.5" y2="3.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.8" y1="2" x2="1.5" y2="3.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="-0.4" y1="3.7" x2="-1.2" y2="5.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.4" y1="3.7" x2="1.2" y2="5.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <circle cx="-0.8" cy="1.5" r="0.2" fill="#ef4444"/>
      <circle cx="0.8" cy="1.5" r="0.2" fill="#ef4444"/>
    </g>
    <text x="16" y="28" textAnchor="middle" fontSize="3" fill="#3b82f6" fontWeight="bold">KINESIO</text>
  </svg>
);

export default function HomePage() {
  useSEO({
    title: "ECOFISIO - Centro de Kinesiología | Reserva tu Cita",
    description: "Centro de kinesiología especializado con sistema de reservas inteligente y asistencia de IA. Profesionales certificados para tu bienestar.",
    keywords: "kinesiología, fisioterapia, rehabilitación, citas médicas, reservas, IA"
  });

  // Animation refs
  const heroRef = useScrollIntoView(0.2);
  const ctaRef = useScrollIntoView(0.3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation />
      
      <main className="pt-16 pb-8 px-4">
        {/* Main CTA Section */}
        <section 
          ref={ctaRef.ref}
          className={`px-4 py-8 sm:py-12 transition-all duration-1000 ${
            ctaRef.isVisible 
              ? 'opacity-100 animate-[fadeInUp_1s_ease-out]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 sm:p-12 text-white text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                ¿Listo para tu sesión de kinesiología?
              </h2>
              <p className="text-blue-100 mb-8 text-lg">
                Accede a tu cuenta para agendar citas con recomendaciones personalizadas de IA
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/my-appointments">
                  <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all duration-200 hover:scale-105">
                    <Calendar className="inline w-5 h-5 mr-2" />
                    Agendar Nueva Cita
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-200">
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section 
          ref={heroRef.ref}
          id="inicio" 
          className={`text-center mb-6 sm:mb-12 transition-all duration-1000 ${
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
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <Bot className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2 text-sm sm:text-base">Orientación IA</h3>
                <p className="text-xs sm:text-sm text-slate-600">Consulta inteligente personalizada antes de tu sesión</p>
              </div>
              <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-slate-200 transition-all duration-1000 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02] ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[cardZoomIn_1.5s_ease-out_1.6s_forwards]' 
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

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <EcofisioLogo size={40} />
                <div className="ml-3">
                  <h3 className="font-bold text-lg text-gray-900">ECOFISIO</h3>
                  <p className="text-sm text-gray-600">Kinesiología</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Centro especializado en kinesiología con más de 10 años de experiencia. 
                Comprometidos con tu bienestar y recuperación.
              </p>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Servicios</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Rehabilitación física y fisioterapia</li>
                <li>Educación</li>
                <li>Masajes Descontracturantes</li>
                <li>Masajes Relajantes</li>
                <li>Kinesiterapia Adulto Mayor</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-600">
                <p>Sábados: 10:00 - 13:00</p>
                <p>canalmovimiento@gmail.com</p>
                <p>+56 9 XXXX XXXX</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 ECOFISIO Centro de Kinesiología. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}