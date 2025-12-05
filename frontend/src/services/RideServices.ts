// Rides API
import { apiRequest } from './api';
export const ridesAPI = {
  getRides: async (filters?: {
    destination?: string;
    date?: string;
    driverId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters?.destination) queryParams.append('destination', filters.destination);
    if (filters?.date) queryParams.append('date', filters.date);
    if (filters?.driverId) queryParams.append('driverId', filters.driverId);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/rides?${queryString}` : '/rides';

    return apiRequest<{ status: string; data: any[] }>(endpoint);
  },

  getAvailableRides: async (filters?: { destination?: string; date?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.destination) queryParams.append('destination', filters.destination);
    if (filters?.date) queryParams.append('date', filters.date);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/rides/available?${queryString}` : '/rides/available';

    return apiRequest<{ status: string; data: any[] }>(endpoint);
  },

  getRideById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/rides/${id}`);
  },

  createRide: async (data: {
    destination: string;
    rideDate: string;
    rideTime: string;
    price?: number;
  }) => {
    return apiRequest<{ status: string; data: any }>('/rides', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateRide: async (id: string, data: any) => {
    return apiRequest<{ status: string; data: any }>(`/rides/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteRide: async (id: string) => {
    return apiRequest<{ status: string; message: string }>(`/rides/${id}`, {
      method: 'DELETE',
    });
  },

  getRidesByDestination: async (destination: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/rides/destination/${encodeURIComponent(destination)}`);
  },
};