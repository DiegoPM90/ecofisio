import { LogoShowcase, EcofisioLogo1, EcofisioLogo2, EcofisioLogo3, EcofisioLogo4, EcofisioLogo5, EcofisioLogo6 } from '../assets/logo-variants';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

export default function LogosPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
            <h1 className="text-xl font-semibold text-slate-900">Alternativas de Logo - Ecofisio</h1>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Opciones de Logo para Ecofisio</h2>
          <p className="text-gray-600 mb-6">
            Aquí tienes 6 alternativas de logo que combinan elementos de fisioterapia con conceptos ecológicos y sostenibles.
            Cada diseño está optimizado para verse bien tanto en tamaños pequeños como grandes.
          </p>
        </div>

        {/* Showcase de logos */}
        <LogoShowcase />

        {/* Ejemplos individuales con diferentes tamaños */}
        <div className="mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Vista de cada logo en diferentes tamaños</h3>
          
          <div className="space-y-8">
            {[
              { component: EcofisioLogo1, name: "Opción 1: Hoja con Figura Humana" },
              { component: EcofisioLogo2, name: "Opción 2: Círculo Ecológico Médico" },
              { component: EcofisioLogo3, name: "Opción 3: Espiral de ADN Natural" },
              { component: EcofisioLogo4, name: "Opción 4: Manos Protectoras" },
              { component: EcofisioLogo5, name: "Opción 5: Corazón Ecológico" },
              { component: EcofisioLogo6, name: "Opción 6: Hexágono Molecular" }
            ].map((logo, index) => {
              const LogoComponent = logo.component;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <h4 className="font-semibold text-lg mb-4">{logo.name}</h4>
                  <div className="flex items-center space-x-8">
                    <div className="text-center">
                      <LogoComponent size={24} />
                      <p className="text-xs text-gray-500 mt-2">24px (móvil)</p>
                    </div>
                    <div className="text-center">
                      <LogoComponent size={32} />
                      <p className="text-xs text-gray-500 mt-2">32px (estándar)</p>
                    </div>
                    <div className="text-center">
                      <LogoComponent size={48} />
                      <p className="text-xs text-gray-500 mt-2">48px (grande)</p>
                    </div>
                    <div className="text-center">
                      <LogoComponent size={64} />
                      <p className="text-xs text-gray-500 mt-2">64px (muy grande)</p>
                    </div>
                    
                    {/* Ejemplo con el nombre */}
                    <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg">
                      <LogoComponent size={32} />
                      <span className="font-semibold text-slate-900">Ecofisio</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-12 bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Características de los diseños:</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• <strong>Escalables:</strong> Todos los logos están en formato SVG y se ven perfectos en cualquier tamaño</li>
            <li>• <strong>Colores coherentes:</strong> Utilizan paletas de verde (naturaleza) y azul (salud/confianza)</li>
            <li>• <strong>Simbología clara:</strong> Combinan elementos médicos/fisioterapéuticos con conceptos ecológicos</li>
            <li>• <strong>Versátiles:</strong> Funcionan bien en fondos claros y oscuros</li>
            <li>• <strong>Memorables:</strong> Cada diseño tiene elementos distintivos que facilitan el reconocimiento de marca</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al sistema de reservas
          </Link>
        </div>
      </main>
    </div>
  );
}