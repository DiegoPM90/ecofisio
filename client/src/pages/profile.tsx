import { useAuth } from "@/contexts/auth-context";
import { useLocation } from "wouter";
import UserProfile from "@/components/user-profile";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirigir si no está autenticado
  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UserProfile />
    </div>
  );
}