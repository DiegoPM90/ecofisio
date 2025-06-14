import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, type LoginCredentials } from "@shared/schema";
import { authApi } from "@/lib/authApi";
import { Link, useLocation } from "wouter";
import { LogIn, UserPlus } from "lucide-react";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginCredentials) => {
      return await authApi.login(data);
    },
    onSuccess: (data) => {
      toast({
        title: "Login exitoso",
        description: "Bienvenido de vuelta",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setLocation(data.user.role === "admin" ? "/admin" : "/");
    },
    onError: (error: any) => {
      toast({
        title: "Error de login",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginCredentials) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa a tu cuenta de Ecofisio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input placeholder="Ingresa tu usuario" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Ingresa tu contraseña" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={loginMutation.isPending}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
                
                <div className="text-center text-sm text-slate-600">
                  ¿No tienes cuenta?{" "}
                  <Link href="/register" className="text-blue-600 hover:underline">
                    Regístrate aquí
                  </Link>
                </div>
              </div>
            </form>
          </Form>
          
          <div className="mt-6 border-t pt-4">
            <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
              <strong>Usuario administrador por defecto:</strong><br />
              Usuario: admin<br />
              Contraseña: admin123
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}