import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirigir si ya está autenticado
  if (isAuthenticated) {
    setLocation("/");
    return null;
  }

  const handleAuthSuccess = () => {
    setLocation("/");
  };

  const handleSwitchToLogin = () => {
    setActiveTab("login");
  };

  const handleSwitchToRegister = () => {
    setActiveTab("register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            EcoFisio Centro
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Sistema de reservas de kinesiología
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm 
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={handleSwitchToRegister}
            />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={handleSwitchToLogin}
            />
          </TabsContent>
        </Tabs>

        <Card className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="text-center text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">¿Necesitas ayuda?</p>
            <p>Contacta con nuestro equipo para asistencia</p>
          </div>
        </Card>
      </div>
    </div>
  );
}