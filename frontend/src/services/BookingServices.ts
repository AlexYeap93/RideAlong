// Bookings API
import { apiRequest } from './api';

export const bookingsAPI = {
  getBookings: async () => {
    return apiRequest<{ status: string; data: any[] }>('/bookings');
  },

  getBookingById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/bookings/${id}`);
  },

  createBooking: async (data: {
    rideId: string;
    numberOfSeats: number;
    seatNumber?: number;
    pickupLocation?: string;
    pickupLatitude?: number | null;
    pickupLongitude?: number | null;
  }) => {
    return apiRequest<{ status: string; data: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateBooking: async (id: string, data: any) => {
    return apiRequest<{ status: string; data: any }>(`/bookings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteBooking: async (id: string) => {
    return apiRequest<{ status: string; message: string }>(`/bookings/${id}`, {
      method: 'DELETE',
    });
  },

  cancelBooking: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/bookings/${id}/cancel`, {
      method: 'POST',
    });
  },

  getBookingsByUser: async (userId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/bookings/user/${userId}`);
  },

  getBookingsByRide: async (rideId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/bookings/ride/${rideId}`);
  },

  getBookedSeats: async (rideId: string) => {
    return apiRequest<{ status: string; data: number[] }>(`/bookings/ride/${rideId}/seats`);
  },

  updatePickupTimes: async (data: {
    rideId: string;
    pickupTimes: Array<{ bookingId: string; pickupTime: string; pickupLocation?: string }>;
  }) => {
    return apiRequest<{ status: string; message: string; data: any[] }>('/bookings/pickup-times', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  requestAdditionalAmount: async (bookingId: string, additionalAmount: number) => {
    return apiRequest<{ status: string; message: string; data: any }>(`/bookings/${bookingId}/request-additional-amount`, {
      method: 'POST',
      body: JSON.stringify({ additionalAmount }),
    });
  },

  respondToAdditionalAmount: async (bookingId: string, response: 'accepted' | 'declined') => {
    return apiRequest<{ status: string; message: string; data: any }>(`/bookings/${bookingId}/respond-additional-amount`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },
};