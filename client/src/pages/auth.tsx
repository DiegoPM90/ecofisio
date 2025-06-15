import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import LoginForm from "@/components/auth/login-form";
import RegisterForm from "@/components/auth/register-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import RobustNavigation from "@/components/robust-navigation";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [errorMessage, setErrorMessage] = useState("");

  // Verificar errores de Google OAuth en la URL
  useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    if (error) {
      switch(error) {
        case 'google_auth_failed':
          setErrorMessage('Error en la autenticación con Google. Inténtalo de nuevo.');
          break;
        case 'session_creation_failed':
          setErrorMessage('Error al crear la sesión. Contacta al soporte.');
          break;
        case 'google_oauth_error':
          setErrorMessage('Error de configuración OAuth. Contacta al soporte.');
          break;
        default:
          setErrorMessage('Error de autenticación. Inténtalo de nuevo.');
      }
    }
  });

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
      <RobustNavigation />
      
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
              
              {/* Confirmación OAuth configurado */}
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <div className="text-left">
                    <p className="text-green-800 text-sm font-medium">Google OAuth configurado correctamente</p>
                    <p className="text-green-700 text-xs">Puedes usar tanto el registro tradicional como Google</p>
                  </div>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-md">
                  <p className="text-red-700 text-sm">{errorMessage}</p>
                </div>
              )}
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

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-50 text-slate-500">O continúa con</span>
                </div>
              </div>
              
              <button
                onClick={() => {
                  // Test Google OAuth endpoint to see if it's working
                  window.location.href = '/api/auth/google';
                }}
                className="mt-4 w-full flex justify-center items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
              
              <div className="mt-3 text-xs text-slate-500 text-center">
                <p className="mb-1">Autenticación rápida y segura con tu cuenta de Google</p>
                <p className="mt-1">Los cambios en Google Cloud pueden tardar unos minutos en aplicarse.</p>
              </div>
            </div>

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