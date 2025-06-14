import { useEffect, useRef, useState } from 'react';

export function useScrollEffects() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  useEffect(() => {
    let lastScrollY = window.pageYOffset;
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.pageYOffset;
      
      if (Math.abs(currentScrollY - lastScrollY) > 10) {
        setHasScrolled(true);
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          setHasScrolled(false);
        }, 150);
      }
      
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, []);

  return { ref, isVisible, hasScrolled };
}