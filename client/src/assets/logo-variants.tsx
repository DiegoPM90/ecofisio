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

// Logo Opción 7: Figura humana con circuitos neuronales
export const EcofisioLogoTech1 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="techGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#10b981', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Círculo base tecnológico */}
    <circle cx="16" cy="16" r="15" fill="url(#techGradient1)" opacity="0.1"/>
    {/* Figura humana central */}
    <circle cx="16" cy="10" r="3" fill="url(#techGradient1)"/>
    <path d="M16 14 L13 20 L13 28 M16 14 L19 20 L19 28 M13 18 L19 18" 
          stroke="url(#techGradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    {/* Circuitos neuronales */}
    <circle cx="8" cy="8" r="1.5" fill="#3b82f6"/>
    <circle cx="24" cy="12" r="1.5" fill="#06b6d4"/>
    <circle cx="6" cy="20" r="1.5" fill="#10b981"/>
    <circle cx="26" cy="24" r="1.5" fill="#3b82f6"/>
    {/* Conexiones neuronales */}
    <path d="M8 8 Q12 6 16 10" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M24 12 Q20 8 16 10" stroke="#06b6d4" strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M6 20 Q10 16 13 18" stroke="#10b981" strokeWidth="1" fill="none" opacity="0.6"/>
    <path d="M26 24 Q22 20 19 18" stroke="#3b82f6" strokeWidth="1" fill="none" opacity="0.6"/>
  </svg>
);

// Logo Opción 8: Chip/CPU con cruz médica
export const EcofisioLogoTech2 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="chipGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1e40af', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Chip base */}
    <rect x="6" y="6" width="20" height="20" rx="2" fill="url(#chipGradient)"/>
    {/* Pines del chip */}
    <rect x="2" y="10" width="4" height="1" fill="#64748b"/>
    <rect x="2" y="13" width="4" height="1" fill="#64748b"/>
    <rect x="2" y="16" width="4" height="1" fill="#64748b"/>
    <rect x="2" y="19" width="4" height="1" fill="#64748b"/>
    <rect x="26" y="10" width="4" height="1" fill="#64748b"/>
    <rect x="26" y="13" width="4" height="1" fill="#64748b"/>
    <rect x="26" y="16" width="4" height="1" fill="#64748b"/>
    <rect x="26" y="19" width="4" height="1" fill="#64748b"/>
    {/* Cruz médica digital */}
    <rect x="14.5" y="11" width="3" height="10" rx="1" fill="white"/>
    <rect x="11" y="14.5" width="10" height="3" rx="1" fill="white"/>
    {/* Puntos de conexión */}
    <circle cx="10" cy="10" r="1" fill="#22c55e"/>
    <circle cx="22" cy="10" r="1" fill="#22c55e"/>
    <circle cx="10" cy="22" r="1" fill="#22c55e"/>
    <circle cx="22" cy="22" r="1" fill="#22c55e"/>
  </svg>
);

// Logo Opción 9: Corazón con ondas digitales
export const EcofisioLogoTech3 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="digitalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#ef4444', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Corazón base */}
    <path d="M16 26 C16 26 8 18 8 13 C8 10 10 8 12 8 C14 8 16 10 16 10 C16 10 18 8 20 8 C22 8 24 10 24 13 C24 18 16 26 16 26 Z" 
          fill="url(#digitalGradient)" opacity="0.9"/>
    {/* Ondas digitales */}
    <path d="M4 16 L6 16 L7 14 L8 18 L9 12 L10 20 L11 10 L12 16" 
          stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <path d="M20 16 L21 10 L22 20 L23 12 L24 18 L25 14 L26 16 L28 16" 
          stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    {/* Pixeles digitales */}
    <rect x="14" y="13" width="1" height="1" fill="white" opacity="0.8"/>
    <rect x="16" y="13" width="1" height="1" fill="white" opacity="0.8"/>
    <rect x="18" y="13" width="1" height="1" fill="white" opacity="0.8"/>
    <rect x="15" y="15" width="1" height="1" fill="white" opacity="0.6"/>
    <rect x="17" y="15" width="1" height="1" fill="white" opacity="0.6"/>
  </svg>
);

// Logo Opción 10: Esqueleto/articulación con sensores
export const EcofisioLogoTech4 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="boneGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#e2e8f0', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Fondo circular tecnológico */}
    <circle cx="16" cy="16" r="15" fill="#1e293b" opacity="0.05"/>
    {/* Hueso/articulación principal */}
    <ellipse cx="16" cy="12" rx="3" ry="2" fill="url(#boneGradient)" stroke="#64748b"/>
    <rect x="14.5" y="12" width="3" height="8" fill="url(#boneGradient)" stroke="#64748b"/>
    <ellipse cx="16" cy="20" rx="3" ry="2" fill="url(#boneGradient)" stroke="#64748b"/>
    {/* Sensores IoT */}
    <circle cx="10" cy="10" r="2" fill="#3b82f6"/>
    <circle cx="22" cy="14" r="2" fill="#06b6d4"/>
    <circle cx="10" cy="22" r="2" fill="#10b981"/>
    <circle cx="22" cy="22" r="2" fill="#8b5cf6"/>
    {/* Conexiones inalámbricas */}
    <path d="M10 8 Q13 6 16 10" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" fill="none"/>
    <path d="M22 12 Q19 10 16 12" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" fill="none"/>
    <path d="M10 20 Q13 18 16 20" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" fill="none"/>
    <path d="M22 20 Q19 18 16 20" stroke="#8b5cf6" strokeWidth="1" strokeDasharray="2,2" fill="none"/>
    {/* Indicadores de señal */}
    <circle cx="10" cy="10" r="1" fill="white"/>
    <circle cx="22" cy="14" r="1" fill="white"/>
    <circle cx="10" cy="22" r="1" fill="white"/>
    <circle cx="22" cy="22" r="1" fill="white"/>
  </svg>
);

// Logo Opción 11: Cerebro neural con código
export const EcofisioLogoTech5 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="brainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Silueta de cerebro */}
    <path d="M8 12 Q8 8 12 8 Q16 6 20 8 Q24 8 24 12 Q26 14 24 18 Q24 22 20 24 Q16 26 12 24 Q8 22 8 18 Q6 14 8 12 Z" 
          fill="url(#brainGradient)" opacity="0.9"/>
    {/* División cerebral */}
    <path d="M16 8 Q16 12 16 24" stroke="white" strokeWidth="1" opacity="0.3"/>
    {/* Código binario */}
    <text x="10" y="14" fontSize="3" fill="white" opacity="0.8">01</text>
    <text x="18" y="14" fontSize="3" fill="white" opacity="0.8">10</text>
    <text x="10" y="20" fontSize="3" fill="white" opacity="0.8">11</text>
    <text x="18" y="20" fontSize="3" fill="white" opacity="0.8">01</text>
    {/* Conexiones neuronales externas */}
    <circle cx="6" cy="16" r="1.5" fill="#22c55e"/>
    <circle cx="26" cy="16" r="1.5" fill="#22c55e"/>
    <line x1="7.5" y1="16" x2="8" y2="16" stroke="#22c55e" strokeWidth="1"/>
    <line x1="24" y1="16" x2="24.5" y2="16" stroke="#22c55e" strokeWidth="1"/>
  </svg>
);

// Logo Opción 12: Robot/IA asistente
export const EcofisioLogoTech6 = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#64748b', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    {/* Cabeza del robot */}
    <rect x="10" y="8" width="12" height="10" rx="2" fill="url(#robotGradient)"/>
    {/* Ojos */}
    <circle cx="13" cy="12" r="1.5" fill="#22c55e"/>
    <circle cx="19" cy="12" r="1.5" fill="#22c55e"/>
    {/* Antena/sensor */}
    <line x1="16" y1="8" x2="16" y2="6" stroke="#3b82f6" strokeWidth="2"/>
    <circle cx="16" cy="5" r="1" fill="#3b82f6"/>
    {/* Cuerpo */}
    <rect x="12" y="18" width="8" height="8" rx="1" fill="url(#robotGradient)"/>
    {/* Brazos extendidos (cuidando) */}
    <rect x="8" y="20" width="4" height="2" rx="1" fill="url(#robotGradient)"/>
    <rect x="20" y="20" width="4" height="2" rx="1" fill="url(#robotGradient)"/>
    {/* Cruz médica en el pecho */}
    <rect x="15" y="20" width="2" height="4" rx="0.5" fill="#22c55e"/>
    <rect x="14" y="21" width="4" height="2" rx="0.5" fill="#22c55e"/>
    {/* Líneas de conexión/datos */}
    <path d="M6 14 L8 14 M24 14 L26 14" stroke="#3b82f6" strokeWidth="1" strokeDasharray="1,1"/>
    <path d="M6 18 L8 18 M24 18 L26 18" stroke="#06b6d4" strokeWidth="1" strokeDasharray="1,1"/>
  </svg>
);

// Logo Opción 13: Personas haciendo ejercicio con tecnología
export const EcofisioLogoExerciseTech = ({ size = 32, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className}>
    <defs>
      <linearGradient id="exerciseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
        <stop offset="50%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
      </linearGradient>
      <linearGradient id="techBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 0.05 }} />
        <stop offset="100%" style={{ stopColor: '#475569', stopOpacity: 0.1 }} />
      </linearGradient>
    </defs>
    
    {/* Fondo tecnológico circular */}
    <circle cx="16" cy="16" r="15" fill="url(#techBg)" stroke="#e2e8f0" strokeWidth="1"/>
    
    {/* Persona 1: Levantando pesas con sensores */}
    <g transform="translate(8, 8)">
      {/* Cabeza */}
      <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradient)"/>
      {/* Cuerpo */}
      <rect x="-0.5" y="1.5" width="1" height="3" fill="url(#exerciseGradient)"/>
      {/* Brazos con pesas */}
      <line x1="-2" y1="2.5" x2="2" y2="2.5" stroke="url(#exerciseGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Pesas */}
      <rect x="-2.5" y="2" width="1" height="1" fill="#64748b"/>
      <rect x="1.5" y="2" width="1" height="1" fill="#64748b"/>
      {/* Piernas */}
      <line x1="-0.5" y1="4.5" x2="-1" y2="6" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.5" y1="4.5" x2="1" y2="6" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      {/* Sensores en muñecas */}
      <circle cx="-2" cy="2.5" r="0.3" fill="#22c55e"/>
      <circle cx="2" cy="2.5" r="0.3" fill="#22c55e"/>
    </g>
    
    {/* Persona 2: Haciendo estiramiento con monitoreo */}
    <g transform="translate(24, 8)">
      {/* Cabeza */}
      <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradient)"/>
      {/* Cuerpo inclinado (estiramiento) */}
      <line x1="0" y1="1.5" x2="1.5" y2="3" stroke="url(#exerciseGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Brazo extendido */}
      <line x1="0" y1="2" x2="-1.5" y2="1" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      {/* Piernas */}
      <line x1="1.5" y1="3" x2="1" y2="5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="1.5" y1="3" x2="2" y2="5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      {/* Sensor de postura */}
      <circle cx="0.5" cy="2.5" r="0.3" fill="#06b6d4"/>
    </g>
    
    {/* Persona 3: Corriendo con wearables */}
    <g transform="translate(16, 20)">
      {/* Cabeza */}
      <circle cx="0" cy="0" r="1.5" fill="url(#exerciseGradient)"/>
      {/* Cuerpo en movimiento */}
      <line x1="0" y1="1.5" x2="0.5" y2="3.5" stroke="url(#exerciseGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      {/* Brazos en movimiento */}
      <line x1="0" y1="2" x2="-1.5" y2="1.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0" y1="2" x2="1.5" y2="2.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      {/* Piernas corriendo */}
      <line x1="0.5" y1="3.5" x2="0" y2="5.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      <line x1="0.5" y1="3.5" x2="1.5" y2="4.5" stroke="url(#exerciseGradient)" strokeWidth="1"/>
      {/* Smartwatch */}
      <rect x="-1.7" y="1.3" width="0.4" height="0.4" fill="#8b5cf6"/>
      {/* Sensor de frecuencia cardíaca */}
      <circle cx="0" cy="2.5" r="0.3" fill="#ef4444"/>
    </g>
    
    {/* Conexiones de datos entre sensores */}
    <path d="M6 11 Q16 8 26 11" stroke="#06b6d4" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6"/>
    <path d="M8 18 Q16 15 24 18" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2,2" fill="none" opacity="0.6"/>
    
    {/* Indicadores de datos en tiempo real */}
    <circle cx="4" cy="4" r="1" fill="#22c55e" opacity="0.8"/>
    <circle cx="28" cy="4" r="1" fill="#06b6d4" opacity="0.8"/>
    <circle cx="4" cy="28" r="1" fill="#8b5cf6" opacity="0.8"/>
    <circle cx="28" cy="28" r="1" fill="#ef4444" opacity="0.8"/>
    
    {/* Pequeñas ondas de señal */}
    <path d="M4 6 Q5 5 6 6" stroke="#22c55e" strokeWidth="0.5" fill="none"/>
    <path d="M28 6 Q29 5 30 6" stroke="#06b6d4" strokeWidth="0.5" fill="none"/>
    <path d="M4 26 Q5 25 6 26" stroke="#8b5cf6" strokeWidth="0.5" fill="none"/>
    <path d="M28 26 Q29 25 30 26" stroke="#ef4444" strokeWidth="0.5" fill="none"/>
  </svg>
);

export const LogoShowcase = () => {
  const logos = [
    { component: EcofisioLogo1, name: "Hoja con Figura Humana", desc: "Combina naturaleza con el cuerpo humano" },
    { component: EcofisioLogo2, name: "Círculo Ecológico Médico", desc: "Cruz médica en círculo degradado verde-azul" },
    { component: EcofisioLogo3, name: "Espiral de ADN Natural", desc: "Doble hélice con elementos vegetales" },
    { component: EcofisioLogo4, name: "Manos Protectoras", desc: "Cuidado humano protegiendo la naturaleza" },
    { component: EcofisioLogo5, name: "Corazón Ecológico", desc: "Salud cardiovascular y sostenibilidad" },
    { component: EcofisioLogo6, name: "Hexágono Molecular", desc: "Estructura molecular con elementos naturales" },
    { component: EcofisioLogoTech1, name: "Kinesiología Neural", desc: "Figura humana con circuitos neuronales" },
    { component: EcofisioLogoTech2, name: "Chip Médico", desc: "Procesador con cruz médica integrada" },
    { component: EcofisioLogoTech3, name: "Corazón Digital", desc: "Latido cardíaco con ondas digitales" },
    { component: EcofisioLogoTech4, name: "Sensores Biomédicos", desc: "Articulación con sensores IoT" },
    { component: EcofisioLogoTech5, name: "Cerebro IA", desc: "Red neuronal con código binario" },
    { component: EcofisioLogoTech6, name: "Asistente Robot", desc: "IA cuidadora con cruz médica" },
    { component: EcofisioLogoExerciseTech, name: "Ejercicio Conectado", desc: "Personas ejercitándose con tecnología wearable" }
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