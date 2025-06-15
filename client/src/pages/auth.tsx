import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/navigation";

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
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Acceso a tu cuenta
              </h1>
              <p className="text-slate-600">
                Inicia sesión o crea una nueva cuenta
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

            <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
              <div className="text-center text-sm text-blue-800">
                <p className="font-medium mb-1">¿Necesitas ayuda?</p>
                <p>Contacta con nuestro equipo para asistencia</p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}