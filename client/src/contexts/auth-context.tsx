import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query para obtener el usuario actual
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("No autenticado");
      }
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Actualizar el estado del usuario cuando los datos cambien
  useEffect(() => {
    if (userData && (userData as any).user) {
      setUser((userData as any).user);
    } else if (error) {
      setUser(null);
    }
  }, [userData, error]);

  // Mutación para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error de autenticación");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success && data.user) {
        setUser(data.user);
        // Guardar token en localStorage como respaldo
        if (data.sessionToken) {
          localStorage.setItem('sessionToken', data.sessionToken);
        }
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
        toast({
          title: "¡Bienvenido!",
          description: `Hola ${data.user.name}, has iniciado sesión correctamente`,
        });
      }
    },
    onError: (error) => {
      console.error("Error en login:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Verifica tus credenciales e intenta nuevamente",
        variant: "destructive",
      });
    },
  });

  // Mutación para registro
  const registerMutation = useMutation({
    mutationFn: async ({ 
      name, 
      email, 
      password, 
      confirmPassword 
    }: { 
      name: string; 
      email: string; 
      password: string; 
      confirmPassword: string; 
    }) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      return response;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error) => {
      console.error("Error en registro:", error);
      toast({
        title: "Error de registro",
        description: "No se pudo crear la cuenta. Intenta nuevamente",
        variant: "destructive",
      });
    },
  });

  // Mutación para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      return response.json();
    },
    onSuccess: () => {
      setUser(null);
      localStorage.removeItem('sessionToken');
      queryClient.clear();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    },
    onError: (error) => {
      console.error("Error en logout:", error);
      // Aún así limpiamos los datos locales en caso de error
      setUser(null);
      localStorage.removeItem('sessionToken');
      queryClient.clear();
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
    } catch (error) {
      // Error ya manejado en onError de la mutación
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    try {
      await registerMutation.mutateAsync({ name, email, password, confirmPassword });
    } catch (error) {
      // Error ya manejado en onError de la mutación
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      // Error ya manejado en onError de la mutación
      console.error("Error durante logout:", error);
    }
  };

  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}