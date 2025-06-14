import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/lib/authApi";
import type { User } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["auth"],
    queryFn: authApi.checkAuth,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logout = async () => {
    await authApi.logout();
    queryClient.setQueryData(["auth"], { isAuthenticated: false });
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  };

  return {
    user: authData?.user,
    isAuthenticated: authData?.isAuthenticated || false,
    isLoading,
    error,
    logout,
  };
}