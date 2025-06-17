import { useState } from "react";
import { HeartPulse, Calendar, Bot, Shield, Clock, Users, Award, Phone, Mail, MapPin } from "lucide-react";
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

// Enhanced ECOFISIO Logo component
const EcofisioLogo = ({ size = 48 }: { size?: number }) => (
  <div className="flex items-center space-x-3">
    <div className={`bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-3 shadow-lg`} style={{ width: size, height: size }}>
      <HeartPulse className="text-white w-full h-full" />
    </div>
    <div className="text-left">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        ECOFISIO
      </h1>
      <p className="text-sm text-slate-600">Centro de Kinesiología</p>
    </div>
  </div>
);

export default function HomePage() {
  useSEO({
    title: "ECOFISIO - Centro de Kinesiología Profesional | Reserva tu Cita",
    description: "Centro especializado en kinesiología con sistema inteligente de reservas y asistencia de IA. Profesionales certificados para tu recuperación y bienestar.",
    keywords: "kinesiología, fisioterapia, rehabilitación, citas médicas, reservas, IA, salud"
  });

  // Animation refs
  const heroRef = useScrollIntoView(0.2);
  const featuresRef = useScrollIntoView(0.3);
  const servicesRef = useScrollIntoView(0.3);
  const ctaRef = useScrollIntoView(0.3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      <Navigation />
      
      <main className="pt-16 pb-8">
        {/* Enhanced Hero Section */}
        <section 
          ref={heroRef.ref}
          className={`relative px-4 py-16 sm:py-24 transition-all duration-1000 ${
            heroRef.isVisible 
              ? 'opacity-100 animate-[fadeInUp_1s_ease-out]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 via-purple-400/5 to-blue-400/5 rounded-3xl"></div>
            
            <div className="relative z-10 text-center">
              {/* Logo and Branding */}
              <div className="flex justify-center mb-8">
                <EcofisioLogo size={64} />
              </div>

              {/* Main Headline */}
              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-200 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[slideInUp_0.8s_ease-out_0.2s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                  Recuperación
                </span>
                <br />
                <span className="text-slate-800">
                  Profesional
                </span>
              </h1>

              {/* Subtitle */}
              <p className={`text-xl sm:text-2xl lg:text-3xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-700 delay-400 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[slideInUp_0.8s_ease-out_0.4s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                Centro especializado en kinesiología con tecnología avanzada y atención personalizada
              </p>

              {/* CTA Buttons */}
              <div className={`flex flex-col sm:flex-row gap-6 justify-center mb-16 transition-all duration-700 delay-600 ${
                heroRef.isVisible 
                  ? 'opacity-100 animate-[slideInUp_0.8s_ease-out_0.6s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                <Link href="/my-appointments">
                  <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1">
                    <span className="flex items-center justify-center">
                      <Calendar className="w-6 h-6 mr-3 group-hover:rotate-12 transition-transform duration-300" />
                      Reservar Cita
                    </span>
                  </button>
                </Link>
                
                <Link href="/ai-consultation">
                  <button className="group border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105">
                    <span className="flex items-center justify-center">
                      <Bot className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                      Consulta IA
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section 
          ref={featuresRef.ref}
          className={`px-4 py-16 transition-all duration-1000 ${
            featuresRef.isVisible 
              ? 'opacity-100 animate-[fadeInUp_1s_ease-out]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-16">
              ¿Por qué elegir ECOFISIO?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className={`group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 ${
                featuresRef.isVisible 
                  ? 'opacity-100 animate-[slideInLeft_1s_ease-out_0.2s_forwards]' 
                  : 'opacity-0 -translate-x-10'
              }`}>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="text-white w-10 h-10" />
                </div>
                <h3 className="font-bold text-2xl text-slate-900 mb-4 text-center">Sistema Inteligente</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Reserva tu cita de forma rápida y eficiente con nuestro sistema de calendario avanzado que se adapta a tus necesidades.
                </p>
              </div>

              {/* Feature 2 */}
              <div className={`group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 ${
                featuresRef.isVisible 
                  ? 'opacity-100 animate-[slideInUp_1s_ease-out_0.4s_forwards]' 
                  : 'opacity-0 translate-y-10'
              }`}>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Bot className="text-white w-10 h-10" />
                </div>
                <h3 className="font-bold text-2xl text-slate-900 mb-4 text-center">Asistencia IA</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Recibe orientación personalizada con inteligencia artificial antes de tu sesión para optimizar tu tratamiento.
                </p>
              </div>

              {/* Feature 3 */}
              <div className={`group bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg border border-white/50 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 ${
                featuresRef.isVisible 
                  ? 'opacity-100 animate-[slideInRight_1s_ease-out_0.6s_forwards]' 
                  : 'opacity-0 translate-x-10'
              }`}>
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-white w-10 h-10" />
                </div>
                <h3 className="font-bold text-2xl text-slate-900 mb-4 text-center">Datos Protegidos</h3>
                <p className="text-slate-600 leading-relaxed text-center">
                  Tu información médica está completamente segura con nuestros protocolos de seguridad certificados.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section 
          ref={servicesRef.ref}
          className={`px-4 py-16 bg-white/50 transition-all duration-1000 ${
            servicesRef.isVisible 
              ? 'opacity-100 animate-[fadeInUp_1s_ease-out]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-16">
              Nuestros Servicios
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: HeartPulse, title: "Kinesiología Deportiva", desc: "Recuperación especializada para atletas" },
                { icon: Users, title: "Rehabilitación", desc: "Tratamientos post-operatorios y lesiones" },
                { icon: Clock, title: "Terapia Manual", desc: "Técnicas especializadas de recuperación" },
                { icon: Award, title: "Prevención", desc: "Programas preventivos personalizados" }
              ].map((service, index) => (
                <div 
                  key={index}
                  className={`bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                    servicesRef.isVisible 
                      ? `opacity-100 animate-[slideInUp_1s_ease-out_${index * 0.2}s_forwards]` 
                      : 'opacity-0 translate-y-10'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mb-4">
                    <service.icon className="text-white w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">{service.title}</h3>
                  <p className="text-slate-600 text-sm">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section 
          ref={ctaRef.ref}
          className={`px-4 py-16 transition-all duration-1000 ${
            ctaRef.isVisible 
              ? 'opacity-100 animate-[fadeInUp_1s_ease-out]' 
              : 'opacity-0 translate-y-20'
          }`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-2xl">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                ¿Listo para tu recuperación?
              </h2>
              <p className="text-blue-100 mb-8 text-xl">
                Agenda tu cita ahora y comienza tu camino hacia una mejor calidad de vida
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/my-appointments">
                  <button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105 shadow-lg">
                    <Calendar className="inline w-6 h-6 mr-2" />
                    Agendar Cita
                  </button>
                </Link>
                <Link href="/auth">
                  <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-200 hover:scale-105">
                    Iniciar Sesión
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <EcofisioLogo size={40} />
              </div>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Centro especializado en kinesiología con más de 10 años de experiencia. 
                Comprometidos con tu bienestar y recuperación integral.
              </p>
              <div className="flex space-x-4">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="bg-purple-600 p-2 rounded-lg">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="bg-emerald-600 p-2 rounded-lg">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-lg mb-4">Servicios</h3>
              <ul className="space-y-2 text-slate-300">
                <li>Kinesiología Deportiva</li>
                <li>Rehabilitación</li>
                <li>Terapia Manual</li>
                <li>Prevención</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4">Contacto</h3>
              <div className="space-y-2 text-slate-300">
                <p>Sábados: 10:00 - 13:00</p>
                <p>info@ecofisio.com</p>
                <p>+56 9 XXXX XXXX</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 ECOFISIO Centro de Kinesiología. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}