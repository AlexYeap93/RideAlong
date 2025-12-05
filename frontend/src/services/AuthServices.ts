import { apiRequest } from './api';
import type { User, APIUser } from '../types/api_interfaces';




// Auth API
export const authAPI = {
  register: async (data: User) => {
    const formData: any = {
      email: data.email.trim().toLowerCase(),
      password: data.password,
      name: data.name.trim(),
      phone: data.phone.trim(),
      userType: data.userType,
    };

    // Add address fields if provided
    if (data.address) {
      formData.address = data.address.trim();
    }
    if (data.city !== undefined) {
      formData.city = data.city;
    }
    if (data.province !== undefined) {
      formData.province = data.province;
    }
    if (data.postalCode !== undefined) {
      formData.postalCode = data.postalCode;
    }

    if (data.userType === 'driver') {
      // Send license number (required for drivers)
      formData.licenseNumber = data.licenseNumber?.trim() || '';
      formData.insuranceProof = data.insuranceProof || '';
      formData.carPhoto = data.carPhoto || '';
      formData.availableSeats = data.availableSeats || 4;
    }

    try {
      const response = await apiRequest<APIUser>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      // Store token and user info if registration successful
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userId', response.data.user.id);
        localStorage.setItem('userEmail', response.data.user.email);
        localStorage.setItem('userName', response.data.user.name);
        localStorage.setItem('userRole', response.data.user.role);
        if (response.data.user.driverInfo && response.data.user.driverInfo.id) {
          localStorage.setItem('driverId', response.data.user.driverInfo.id);
        }
      }

      return response;
    } catch (error: any) {
      // Improve error messages
      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to server. Please make sure the backend server is running.');
      }
      throw error;
    }
  },

  login: async (email: string, password: string) => {
    const response = await apiRequest<APIUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
      localStorage.setItem('userEmail', response.data.user.email);
      localStorage.setItem('userName', response.data.user.name);
      localStorage.setItem('userRole', response.data.user.role);
      if (response.data.user.driverInfo && response.data.user.driverInfo.id) {
        localStorage.setItem('driverId', response.data.user.driverInfo.id);
      }
    }

    return response;
  },

  logout: async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('driverId');
    await apiRequest('/auth/logout', { method: 'POST' });
  },

  getCurrentUser: async () => {
    return apiRequest<APIUser>('/auth/me');
  },
};