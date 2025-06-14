import { apiRequest } from "./queryClient";
import type { LoginCredentials, InsertUser, User } from "@shared/schema";

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return apiRequest("POST", "/api/auth/login", credentials);
  },

  register: async (userData: InsertUser) => {
    return apiRequest("POST", "/api/auth/register", userData);
  },

  logout: async () => {
    return apiRequest("POST", "/api/auth/logout", {});
  },

  getCurrentUser: async () => {
    return apiRequest("GET", "/api/auth/me");
  },

  checkAuth: async () => {
    try {
      const user = await apiRequest("GET", "/api/auth/me");
      return { isAuthenticated: true, user };
    } catch (error) {
      return { isAuthenticated: false };
    }
  }
};