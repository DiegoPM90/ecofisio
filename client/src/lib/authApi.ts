import type { LoginCredentials, InsertUser, User } from "@shared/schema";

// Helper function for API calls
async function fetchApi(url: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Error desconocido" }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return fetchApi("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  register: async (userData: InsertUser) => {
    return fetchApi("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  logout: async () => {
    return fetchApi("/api/auth/logout", {
      method: "POST",
    });
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      return await fetchApi("/api/auth/me");
    } catch (error: any) {
      if (error.message?.includes("401") || error.message?.includes("Authentication required")) {
        return null;
      }
      throw error;
    }
  },
};

export const adminApi = {
  getAppointments: async () => {
    return fetchApi("/api/admin/appointments");
  },

  deleteAppointment: async (id: number) => {
    return fetchApi(`/api/admin/appointments/${id}`, {
      method: "DELETE",
    });
  },

  getUsers: async () => {
    return fetchApi("/api/admin/users");
  },

  updateUserRole: async (id: number, role: string) => {
    return fetchApi(`/api/admin/users/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role }),
    });
  },
};