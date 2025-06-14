import { apiRequest } from "./queryClient";
import type { LoginCredentials, InsertUser, User } from "@shared/schema";

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
    return apiRequest("POST", "/api/auth/login", credentials);
  },

  register: async (userData: InsertUser): Promise<{ user: User; token: string }> => {
    return apiRequest("POST", "/api/auth/register", userData);
  },

  logout: async (): Promise<void> => {
    return apiRequest("POST", "/api/auth/logout", {});
  },

  getCurrentUser: async (): Promise<User> => {
    return apiRequest("GET", "/api/auth/me");
  },

  checkAuth: async (): Promise<{ isAuthenticated: boolean; user?: User }> => {
    try {
      const user = await apiRequest("GET", "/api/auth/me");
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }
};