import React from 'react';

// Logo Opción 1: Hoja con figura humana
export const EcofisioLogo1 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="leafGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Hoja de fondo */}
    <path d="M16 2C10 2 6 8 6 16c0 8 4 12 10 14 6-2 10-6 10-14 0-8-4-14-10-14z" 
          fill="url(#leafGradient1)" opacity="0.9"/>
    {/* Nervadura central de la hoja */}
    <line x1="16" y1="4" x2="16" y2="28" stroke="#059669" strokeWidth="1" opacity="0.6"/>
    {/* Figura humana estilizada */}
    <circle cx="16" cy="12" r="2.5" fill="white"/>
    <path d="M16 15 L14 20 L14 26 M16 15 L18 20 L18 26 M14 18 L18 18" 
          stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

// Logo Opción 2: Círculo ecológico con cruz médica
export const EcofisioLogo2 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Círculo base */}
    <circle cx="16" cy="16" r="14" fill="url(#circleGradient)"/>
    {/* Hojas decorativas */}
    <path d="M8 12 Q10 8 14 10 Q12 12 8 12" fill="white" opacity="0.3"/>
    <path d="M24 20 Q22 24 18 22 Q20 20 24 20" fill="white" opacity="0.3"/>
    {/* Cruz médica moderna */}
    <rect x="14.5" y="10" width="3" height="12" rx="1.5" fill="white"/>
    <rect x="10" y="14.5" width="12" height="3" rx="1.5" fill="white"/>
  </svg>
);

// Logo Opción 3: Espiral de ADN con hojas
export const EcofisioLogo3 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Fondo circular suave */}
    <circle cx="16" cy="16" r="15" fill="#f0fdf4" stroke="#dcfce7" strokeWidth="1"/>
    {/* Espiral de ADN estilizada */}
    <path d="M12 6 Q8 10 12 14 Q20 18 12 22 Q8 26 12 30" 
          stroke="url(#spiralGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M20 6 Q24 10 20 14 Q12 18 20 22 Q24 26 20 30" 
          stroke="url(#spiralGradient)" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    {/* Conexiones transversales */}
    <line x1="12" y1="10" x2="20" y2="10" stroke="#22c55e" strokeWidth="1.5"/>
    <line x1="16" y1="16" x2="16" y2="16" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
    <line x1="12" y1="22" x2="20" y2="22" stroke="#22c55e" strokeWidth="1.5"/>
    {/* Pequeñas hojas */}
    <ellipse cx="10" cy="8" rx="2" ry="3" fill="#22c55e" opacity="0.6" transform="rotate(-20 10 8)"/>
    <ellipse cx="22" cy="24" rx="2" ry="3" fill="#22c55e" opacity="0.6" transform="rotate(20 22 24)"/>
  </svg>
);

// Logo Opción 4: Manos protectoras con hoja
export const EcofisioLogo4 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="handsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1d4ed8', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Mano izquierda */}
    <path d="M6 20 Q6 16 8 14 Q10 12 12 14 L14 16 Q16 14 16 16 L16 24 Q14 26 10 26 Q6 24 6 20" 
          fill="url(#handsGradient)" opacity="0.8"/>
    {/* Mano derecha */}
    <path d="M26 20 Q26 16 24 14 Q22 12 20 14 L18 16 Q16 14 16 16 L16 24 Q18 26 22 26 Q26 24 26 20" 
          fill="url(#handsGradient)" opacity="0.8"/>
    {/* Hoja central */}
    <ellipse cx="16" cy="16" rx="4" ry="6" fill="#22c55e"/>
    <line x1="16" y1="10" x2="16" y2="22" stroke="#16a34a" strokeWidth="1"/>
    {/* Pequeñas nervaduras */}
    <path d="M14 13 Q16 14 18 13" stroke="#16a34a" strokeWidth="0.5" fill="none"/>
    <path d="M14 19 Q16 18 18 19" stroke="#16a34a" strokeWidth="0.5" fill="none"/>
  </svg>
);

// Logo Opción 5: Corazón ecológico con pulso
export const EcofisioLogo5 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#22c55e', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Forma de corazón */}
    <path d="M16 28 C16 28 6 18 6 12 C6 8 9 6 12 6 C14 6 16 8 16 8 C16 8 18 6 20 6 C23 6 26 8 26 12 C26 18 16 28 16 28 Z" 
          fill="url(#heartGradient)"/>
    {/* Línea de pulso */}
    <path d="M4 16 L8 16 L10 12 L12 20 L14 8 L16 24 L18 4 L20 16 L22 12 L24 16 L28 16" 
          stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    {/* Pequeña hoja en el corazón */}
    <ellipse cx="16" cy="14" rx="2" ry="3" fill="white" opacity="0.8"/>
    <line x1="16" y1="12" x2="16" y2="17" stroke="#16a34a" strokeWidth="1"/>
  </svg>
);

// Logo Opción 6: Hexágono molecular
export const EcofisioLogo6 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="hexGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0891b2', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Hexágono principal */}
    <polygon points="16,4 24,9 24,19 16,24 8,19 8,9" 
             fill="url(#hexGradient)" stroke="white" strokeWidth="1"/>
    {/* Moléculas internas */}
    <circle cx="16" cy="11" r="2" fill="white"/>
    <circle cx="12" cy="16" r="1.5" fill="#22c55e"/>
    <circle cx="20" cy="16" r="1.5" fill="#22c55e"/>
    <circle cx="16" cy="21" r="2" fill="white"/>
    {/* Conexiones */}
    <line x1="16" y1="13" x2="14" y2="15" stroke="white" strokeWidth="1"/>
    <line x1="16" y1="13" x2="18" y2="15" stroke="white" strokeWidth="1"/>
    <line x1="14" y1="17" x2="16" y2="19" stroke="white" strokeWidth="1"/>
    <line x1="18" y1="17" x2="16" y2="19" stroke="white" strokeWidth="1"/>
  </svg>
);

export const LogoShowcase = () => {
  const logos = [
    { component: EcofisioLogo1, name: "Hoja con Figura Humana", desc: "Combina naturaleza con el cuerpo humano" },
    { component: EcofisioLogo2, name: "Círculo Ecológico Médico", desc: "Cruz médica en círculo degradado verde-azul" },
    { component: EcofisioLogo3, name: "Espiral de ADN Natural", desc: "Doble hélice con elementos vegetales" },
    { component: EcofisioLogo4, name: "Manos Protectoras", desc: "Cuidado humano protegiendo la naturaleza" },
    { component: EcofisioLogo5, name: "Corazón Ecológico", desc: "Salud cardiovascular y sostenibilidad" },
    { component: EcofisioLogo6, name: "Hexágono Molecular", desc: "Estructura molecular con elementos naturales" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-6 bg-gray-50 rounded-lg">
      {logos.map((logo, index) => {
        const LogoComponent = logo.component;
        return (
          <div key={index} className="text-center space-y-3">
            <div className="flex justify-center items-center h-20 bg-white rounded-lg shadow-sm">
              <LogoComponent size={48} />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{logo.name}</h3>
              <p className="text-xs text-gray-600">{logo.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};