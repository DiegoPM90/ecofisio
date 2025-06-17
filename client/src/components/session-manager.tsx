import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { useAuth } from "@/contexts/auth-context";

export function SessionManager() {
  const { isAuthenticated } = useAuth();
  
  // Inicializar el sistema de timeout solo si está autenticado
  useSessionTimeout();

  // Este componente no renderiza nada, solo maneja la lógica de sesión
  return null;
}