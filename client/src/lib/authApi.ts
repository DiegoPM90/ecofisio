import { apiRequest } from './queryClient';
import { User, LoginCredentials, InsertUser } from '@shared/schema';

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    return apiRequest("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: InsertUser): Promise<{ message: string; user: User }> => {
    return apiRequest("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  },

  getMe: async (token: string): Promise<User> => {
    return apiRequest("/api/auth/me", {
      headers: { "Authorization": `Bearer ${token}` },
    });
  },

  // Admin endpoints
  getAdminAppointments: async (token: string) => {
    return apiRequest("/api/admin/appointments", {
      headers: { "Authorization": `Bearer ${token}` },
    });
  },

  updateAppointment: async (token: string, id: number, updates: any) => {
    return apiRequest(`/api/admin/appointments/${id}`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(updates),
    });
  },

  deleteAppointment: async (token: string, id: number) => {
    return apiRequest(`/api/admin/appointments/${id}`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
  },

  updateUserRole: async (token: string, userId: number, role: string) => {
    return apiRequest(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      headers: { 
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ role }),
    });
  },
};