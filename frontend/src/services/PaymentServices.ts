// Payments API

import { apiRequest } from './api';
export const paymentsAPI = {
  getPayments: async () => {
    return apiRequest<{ status: string; data: any[] }>('/payments');
  },

  getPaymentById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/payments/${id}`);
  },

  createPayment: async (data: {
    bookingId: string;
    amount: number;
    paymentMethod: string;
    paymentStatus?: string;
  }) => {
    return apiRequest<{ status: string; data: any }>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaymentsByUser: async (userId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/payments/user/${userId}`);
  },

  getPaymentsByBooking: async (bookingId: string) => {
    return apiRequest<{ status: string; data: any[] }>(`/payments/booking/${bookingId}`);
  },
};


// Payment Methods API
export const paymentMethodsAPI = {
  getPaymentMethods: async () => {
    return apiRequest<{ status: string; data: any[] }>('/payment-methods');
  },

  getPaymentMethodById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/payment-methods/${id}`);
  },

  createPaymentMethod: async (data: {
    type: string;
    brand?: string;
    last4: string;
    expiryMonth?: number;
    expiryYear?: number;
    cardholderName?: string;
    isDefault?: boolean;
  }) => {
    return apiRequest<{ status: string; data: any }>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updatePaymentMethod: async (id: string, data: { isDefault?: boolean }) => {
    return apiRequest<{ status: string; data: any }>(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deletePaymentMethod: async (id: string) => {
    return apiRequest<{ status: string; message: string }>(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  },
};