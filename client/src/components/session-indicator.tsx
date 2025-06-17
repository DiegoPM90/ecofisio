import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useSessionTimeout } from "@/hooks/use-session-timeout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Shield } from "lucide-react";

export function SessionIndicator() {
  const { isAuthenticated } = useAuth();
  const { extendSession, timeRemaining } = useSessionTimeout();
  const [remainingTime, setRemainingTime] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      const remaining = timeRemaining();
      setRemainingTime(remaining);
      
      // Mostrar advertencia cuando quedan menos de 2 minutos
      setShowWarning(remaining > 0 && remaining <= 120);
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, timeRemaining]);

  if (!isAuthenticated || !showWarning) return null;

  const minutes = Math.floor(remainingTime / 60);
  const seconds = remainingTime % 60;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="border-orange-200 bg-orange-50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            Sesión por expirar
          </CardTitle>
          <CardDescription className="text-orange-700">
            Tu sesión se cerrará automáticamente por seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-orange-800">
            <Clock className="h-4 w-4" />
            <span className="font-mono text-lg">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={extendSession}
              size="sm"
              className="flex-1 bg-orange-600 hover:bg-orange-700"
            >
              <Shield className="h-4 w-4 mr-1" />
              Extender sesión
            </Button>
          </div>
          
          <p className="text-xs text-orange-600">
            Cualquier actividad en la página extenderá automáticamente tu sesión
          </p>
        </CardContent>
      </Card>
    </div>
  );
}