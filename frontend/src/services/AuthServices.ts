import { User,APIUser } from '../types/api_interfaces';
import { API_BASE_URL } from '../types/const';


// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Helper function to get user ID
const getUserId = (): string | null => {
  return localStorage.getItem('userId');
};

// Helper function for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the backend server is running on http://localhost:5000');
    }
    throw error;
  }
}

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
    if (data.latitude !== undefined) {
      formData.latitude = data.latitude;
    }
    if (data.longitude !== undefined) {
      formData.longitude = data.longitude;
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