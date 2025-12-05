// Drivers API
import { apiRequest } from './api';
export const driversAPI = {
  getDrivers: async () => {
    return apiRequest<{ status: string; data: any[] }>('/drivers');
  },

  getMyDriverProfile: async () => {
    return apiRequest<{ status: string; data: any }>('/drivers/me');
  },

  getDriverById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/drivers/${id}`);
  },

  createDriver: async (data: {
    licenseNumber: string;
    insuranceProof?: string;
    carPhoto?: string;
    availableSeats: number;
  }) => {
    return apiRequest<{ status: string; data: any }>('/drivers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateDriver: async (id: string, data: any) => {
    return apiRequest<{ status: string; data: any }>(`/drivers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  getDriverRides: async (driverId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/drivers/${driverId}/rides`);
  },

  approveDriver: async (driverId: string) => {
    return apiRequest<{ status: string; data: any }>(`/drivers/${driverId}/approve`, {
      method: 'POST',
    });
  },
};
