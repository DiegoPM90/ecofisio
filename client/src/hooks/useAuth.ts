import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/authApi";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: () => authApi.getCurrentUser(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const logout = async () => {
    try {
      await authApi.logout();
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error cerrando sesión",
        variant: "destructive",
      });
    }
  };

  return logout;
}