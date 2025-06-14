// Performance monitoring utilities
export const performanceMonitor = {
  // Measure and log page load times
  measurePageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
        
        // Report to analytics if needed
        if (loadTime > 3000) {
          console.warn('Slow page load detected:', loadTime);
        }
      });
    }
  },

  // Measure component render times
  measureComponentRender: (componentName: string) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${componentName} rendered in ${(end - start).toFixed(2)}ms`);
    };
  },

  // Image loading optimization
  optimizeImageLoading: () => {
    if ('loading' in HTMLImageElement.prototype) {
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img: any) => {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
    } else {
      // Fallback for browsers without native lazy loading
      const lazyImages = document.querySelectorAll('img[data-src]');
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        });
      });
      
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  performanceMonitor.measurePageLoad();
}