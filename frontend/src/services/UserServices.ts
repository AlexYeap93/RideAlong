// Users API
import { apiRequest } from './api';
export const usersAPI = {
  getUsers: async () => {
    return apiRequest<{ status: string; data: any[] }>('/users');
  },

  getUserById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/users/${id}`);
  },

  updateUser: async (id: string, data: { name?: string; email?: string; phone?: string; address?: string; latitude?: number; longitude?: number }) => {
    return apiRequest<{ status: string; data: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getUserRides: async (userId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/users/${userId}/rides`);
  },

  suspendUser: async (userId: string) => {
    return apiRequest<{ status: string; message: string; data: any }>(`/users/${userId}/suspend`, {
      method: 'POST',
    });
  },

  unsuspendUser: async (userId: string) => {
    return apiRequest<{ status: string; message: string; data: any }>(`/users/${userId}/unsuspend`, {
      method: 'POST',
    });
  },
  updatePassword: async (userId: string, data: { oldPassword: string; newPassword: string }) => {
    return apiRequest<{ status: string; message: string }>(`/users/${userId}/password`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },


};