// Ratings API
import { apiRequest } from './api';
  export const ratingsAPI = {
    createRating: async (data: {
      bookingId: string;
      rating: number;
      comment?: string;
    }) => {
      return apiRequest<{ status: string; message: string; data: any }>('/ratings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    getDriverRatings: async (driverId: string) => {
      return apiRequest<{ status: string; data: { ratings: any[]; averageRating: number; totalRatings: number } }>(`/ratings/driver/${driverId}`);
    },

    getRatingByBooking: async (bookingId: string) => {
      return apiRequest<{ status: string; data: any }>(`/ratings/booking/${bookingId}`);
    },
  };