// Configuración de ambiente para el frontend
export const config = {
  // En desarrollo, usar el servidor local
  // En producción, usar las funciones de Netlify
  apiBaseUrl: import.meta.env.PROD 
    ? '/.netlify/functions/api'
    : '/api',
  
  // URLs base para diferentes ambientes
  baseUrl: import.meta.env.PROD
    ? window.location.origin
    : 'http://localhost:5000',
    
  // Configuración de la aplicación
  appName: 'ECOFISIO',
  version: '1.0.0',
  environment: import.meta.env.MODE
};

// Helper para construir URLs de API
export function buildApiUrl(endpoint: string): string {
  // Remover slash inicial si existe
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  if (import.meta.env.PROD) {
    return `/.netlify/functions/api/${cleanEndpoint}`;
  }
  
  return `/api/${cleanEndpoint}`;
}