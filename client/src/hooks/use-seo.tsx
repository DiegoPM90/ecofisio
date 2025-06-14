import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export function useSEO({
  title = 'Ecofisio - Reserva de Sesiones de Kinesiología',
  description = 'Sistema de reserva de sesiones de kinesiología y fisioterapia con consulta IA. Programa tus sesiones de rehabilitación, masajes terapéuticos y tratamientos personalizados.',
  keywords = 'kinesiología, fisioterapia, rehabilitación, masajes, terapia física, sesiones, reserva online, consulta IA',
  ogTitle,
  ogDescription,
  ogImage = '/og-image.jpg'
}: SEOProps = {}) {
  
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    updateMetaTag('description', description);
    
    // Update meta keywords
    updateMetaTag('keywords', keywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', ogTitle || title, 'property');
    updateMetaTag('og:description', ogDescription || description, 'property');
    updateMetaTag('og:image', ogImage, 'property');
    updateMetaTag('og:type', 'website', 'property');
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', ogTitle || title);
    updateMetaTag('twitter:description', ogDescription || description);
    updateMetaTag('twitter:image', ogImage);
    
    // Update canonical URL
    updateLinkTag('canonical', window.location.origin + window.location.pathname);
    
  }, [title, description, keywords, ogTitle, ogDescription, ogImage]);
}

function updateMetaTag(name: string, content: string, attribute: string = 'name') {
  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  
  element.content = content;
}

function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  
  element.href = href;
}