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
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Actualizar el estado del usuario cuando los datos cambien
  useEffect(() => {
    if (userData && (userData as any).user) {
      setUser((userData as any).user);
    } else if (error || !userData) {
      setUser(null);
    }
  }, [userData, error]);

  // Mutación para login
  const loginMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      return response;
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
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
  });

  // Mutación para logout
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/auth/logout", {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente",
        variant: "default",
      });
    },
  });

  const login = async (email: string, password: string) => {
    await loginMutation.mutateAsync({ email, password });
  };

  const register = async (name: string, email: string, password: string, confirmPassword: string) => {
    await registerMutation.mutateAsync({ name, email, password, confirmPassword });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
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