import { LogoShowcase, EcofisioLogo1, EcofisioLogo2, EcofisioLogo3, EcofisioLogo4, EcofisioLogo5, EcofisioLogo6, EcofisioLogoTech1, EcofisioLogoTech2, EcofisioLogoTech3, EcofisioLogoTech4, EcofisioLogoTech5, EcofisioLogoTech6, EcofisioLogoExerciseTech } from '../assets/logo-variants';
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
            Aquí tienes 13 alternativas de logo: 6 que combinan fisioterapia con conceptos ecológicos y 7 nuevas opciones que fusionan kinesiología con tecnología moderna.
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
              { component: EcofisioLogo1, name: "Opción 1: Hoja con Figura Humana", category: "Ecológico" },
              { component: EcofisioLogo2, name: "Opción 2: Círculo Ecológico Médico", category: "Ecológico" },
              { component: EcofisioLogo3, name: "Opción 3: Espiral de ADN Natural", category: "Ecológico" },
              { component: EcofisioLogo4, name: "Opción 4: Manos Protectoras", category: "Ecológico" },
              { component: EcofisioLogo5, name: "Opción 5: Corazón Ecológico", category: "Ecológico" },
              { component: EcofisioLogo6, name: "Opción 6: Hexágono Molecular", category: "Ecológico" },
              { component: EcofisioLogoTech1, name: "Opción 7: Kinesiología Neural", category: "Tecnológico" },
              { component: EcofisioLogoTech2, name: "Opción 8: Chip Médico", category: "Tecnológico" },
              { component: EcofisioLogoTech3, name: "Opción 9: Corazón Digital", category: "Tecnológico" },
              { component: EcofisioLogoTech4, name: "Opción 10: Sensores Biomédicos", category: "Tecnológico" },
              { component: EcofisioLogoTech5, name: "Opción 11: Cerebro IA", category: "Tecnológico" },
              { component: EcofisioLogoTech6, name: "Opción 12: Asistente Robot", category: "Tecnológico" },
              { component: EcofisioLogoExerciseTech, name: "Opción 13: Ejercicio Conectado", category: "Tecnológico" }
            ].map((logo, index) => {
              const LogoComponent = logo.component;
              return (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="font-semibold text-lg">{logo.name}</h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      logo.category === 'Tecnológico' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {logo.category}
                    </span>
                  </div>
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
        <div className="mt-12 space-y-6">
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-3">🌱 Línea Ecológica (Opciones 1-6):</h3>
            <ul className="space-y-2 text-green-800 text-sm">
              <li>• <strong>Enfoque:</strong> Sostenibilidad y conexión con la naturaleza</li>
              <li>• <strong>Colores:</strong> Verdes naturales con acentos azules</li>
              <li>• <strong>Mensaje:</strong> Fisioterapia respetuosa con el medio ambiente</li>
              <li>• <strong>Ideal para:</strong> Clínicas que priorizan prácticas ecológicas</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">🤖 Línea Tecnológica (Opciones 7-12):</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>• <strong>Enfoque:</strong> Innovación y tecnología médica avanzada</li>
              <li>• <strong>Colores:</strong> Azules tecnológicos con acentos cian y violeta</li>
              <li>• <strong>Mensaje:</strong> Fisioterapia del futuro con IA y monitoreo digital</li>
              <li>• <strong>Ideal para:</strong> Centros que integran wearables, apps y telemedicina</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Características técnicas:</h3>
            <ul className="space-y-2 text-gray-800 text-sm">
              <li>• <strong>Formato SVG:</strong> Escalables sin pérdida de calidad</li>
              <li>• <strong>Optimizados:</strong> Funcionan desde 16px hasta tamaños grandes</li>
              <li>• <strong>Compatibles:</strong> Se adaptan a fondos claros y oscuros</li>
              <li>• <strong>Versátiles:</strong> Perfectos para web, impresión y redes sociales</li>
            </ul>
          </div>
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