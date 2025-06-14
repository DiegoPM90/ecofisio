import { useNetworkStatus } from "@/hooks/use-network-status";
import { AlertCircle, Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function NetworkStatus() {
  const { isOnline, connectionType } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Alert className="fixed top-4 left-4 right-4 z-50 bg-red-50 border-red-200 max-w-md mx-auto">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="text-red-800">
        Sin conexión a internet. Algunas funciones pueden no estar disponibles.
      </AlertDescription>
    </Alert>
  );
}