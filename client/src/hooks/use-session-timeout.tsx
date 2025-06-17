import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

const TIMEOUT_DURATION = 5 * 60 * 1000; // 5 minutos en milisegundos
const WARNING_DURATION = 60 * 1000; // Advertir 1 minuto antes

export function useSessionTimeout() {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    lastActivityRef.current = Date.now();

    // Limpiar timers existentes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
    }

    // Timer de advertencia (4 minutos)
    warningRef.current = setTimeout(() => {
      toast({
        title: "Sesión por expirar",
        description: "Tu sesión se cerrará en 1 minuto por inactividad. Haz clic en cualquier lugar para mantenerla activa.",
        variant: "destructive",
        duration: 10000,
      });
    }, TIMEOUT_DURATION - WARNING_DURATION);

    // Timer de cierre de sesión (5 minutos)
    timeoutRef.current = setTimeout(() => {
      toast({
        title: "Sesión cerrada",
        description: "Tu sesión se cerró automáticamente por seguridad debido a inactividad.",
        variant: "destructive",
      });
      logout();
    }, TIMEOUT_DURATION);
  }, [isAuthenticated, logout, toast]);

  const handleActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimer();
    }
  }, [isAuthenticated, resetTimer]);

  useEffect(() => {
    if (!isAuthenticated) {
      // Limpiar timers si no está autenticado
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
      return;
    }

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove', 
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    // Agregar listeners de actividad
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Inicializar timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningRef.current) {
        clearTimeout(warningRef.current);
      }
    };
  }, [isAuthenticated, handleActivity, resetTimer]);

  // Exponer función para extender sesión manualmente
  const extendSession = useCallback(() => {
    if (isAuthenticated) {
      resetTimer();
      toast({
        title: "Sesión extendida",
        description: "Tu sesión se ha extendido por 5 minutos más.",
      });
    }
  }, [isAuthenticated, resetTimer, toast]);

  return {
    extendSession,
    timeRemaining: () => {
      if (!isAuthenticated) return 0;
      const elapsed = Date.now() - lastActivityRef.current;
      const remaining = Math.max(0, TIMEOUT_DURATION - elapsed);
      return Math.floor(remaining / 1000); // Retorna segundos
    }
  };
}