const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: 'rider' | 'driver';
    address?: string;
    latitude?: number;
    longitude?: number;
    licenseNumber?: string;
    insuranceProof?: string;
    carPhoto?: string;
    availableSeats?: number;
  }) => {
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
      const response = await apiRequest<{
        status: string;
        message: string;
        data: {
          user: {
            id: string;
            email: string;
            name: string;
            role: string;
            driverInfo?: any;
          };
          token?: string;
        };
      }>('/auth/register', {
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
    const response = await apiRequest<{
      status: string;
      message: string;
      data: {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
          driverInfo?: any;
        };
        token: string;
      };
    }>('/auth/login', {
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
    return apiRequest<{
      status: string;
      data: {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
          driverInfo?: any;
        };
      };
    }>('/auth/me');
  },
};

// Users API
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
};

// Drivers API
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

// Rides API
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

// Bookings API
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

// Payments API
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

// Helper function to transform backend ride data to frontend format
export const transformRideData = (ride: any) => {
  const availableSeats = ride.available_seats || 4;
  const bookedSeats = parseInt(ride.booked_seats || '0');
  const remainingSeats = availableSeats - bookedSeats;

  // Determine car type based on available seats
  const carType = availableSeats >= 7 ? '7-seater' : '5-seater';

  // Format time - backend returns TIME type as "HH:MM:SS" or "HH:MM:SS.mmm"
  const timeStr = ride.ride_time || ride.time || '12:00:00';
  let time = timeStr;
  
  // Convert 24-hour format to 12-hour format if needed
  if (timeStr.includes(':') && !timeStr.includes('AM') && !timeStr.includes('PM')) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    time = `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }

  // Use rating from backend - this is the average rating given by riders to the driver
  // Parse as float and ensure it's a valid number
  const rating = ride.average_rating != null && ride.average_rating !== undefined 
    ? parseFloat(ride.average_rating) 
    : 0;

  // Get driver address from backend (this is the address they entered in settings)
  const driverAddress = ride.driver_address || null;

  return {
    id: ride.id,
    rideId: ride.id,
    driverName: ride.driver_name || ride.driverName || 'Driver',
    rating: rating,
    departureTime: time,
    availableSeats: remainingSeats,
    isFullyBooked: remainingSeats <= 0,
    price: parseFloat(ride.price) || 10,
    destination: ride.destination || 'University of Calgary',
    estimatedDuration: '25 min', // Mock data
    carType: carType as '5-seater' | '7-seater',
    quadrant: null, // Don't use quadrant - use driver address instead
    driverAddress: driverAddress, // Driver's address from backend (from settings)
    car: 'Car', // Mock data
    rideDate: ride.ride_date || ride.date,
    driverId: ride.driver_user_id || ride.driver_id, // Use driver_user_id if available
    status: ride.status || 'active',
  };
};

  // Ratings API
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


  // Issues API
  export const issuesAPI = {
  createIssue: async (data: {
    bookingId?: string;
    issueType: string;
    subject: string;
    description: string;
    reportedUserId?: string;
    priority?: string;
  }) => {
    return apiRequest<{ status: string; message: string; data: any }>('/issues', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getIssues: async (filters?: { status?: string; priority?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.priority) queryParams.append('priority', filters.priority);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/issues?${queryString}` : '/issues';

    return apiRequest<{ status: string; data: any[] }>(endpoint);
  },

  getIssueById: async (id: string) => {
    return apiRequest<{ status: string; data: any }>(`/issues/${id}`);
  },

  updateIssue: async (id: string, data: { status?: string; priority?: string; adminNotes?: string }) => {
    return apiRequest<{ status: string; data: any }>(`/issues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Helper function to transform backend booking data to frontend format
export const transformBookingData = (booking: any) => {
  // Format time from backend (HH:MM:SS) to 12-hour format
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '12:00 PM';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hour12 = hours % 12 || 12;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Format date from backend (YYYY-MM-DD) to readable format
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return new Date().toLocaleDateString();
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Determine car type from available seats
  const availableSeats = booking.available_seats || 4;
  const carType = availableSeats >= 7 ? '7-seater' : '5-seater';

  // Generate mock quadrant
  const quadrants = ['DT', 'NW', 'NE', 'SE', 'SW'];
  const quadrant = booking.quadrant || quadrants[Math.floor(Math.random() * quadrants.length)];

  return {
    id: booking.id,
    bookingId: booking.id,
    driverName: booking.driver_name || 'Driver',
    rating: booking.average_rating ? parseFloat(booking.average_rating) : 0, // Real rating from backend
    car: 'Car', // Mock car
    destination: booking.destination || 'University of Calgary',
    quadrant: quadrant,
    departureTime: formatTime(booking.ride_time || '12:00:00'),
    seatNumber: booking.number_of_seats || 1,
    price: parseFloat(booking.price) || 10,
    status: booking.status || 'confirmed',
    date: formatDate(booking.ride_date || new Date().toISOString()),
    pickupLocation: booking.pickup_location || 'Location',
    pickupTime: booking.pickup_time ? formatTime(booking.pickup_time) : formatTime(booking.ride_time || '12:00:00'),
    carType: carType as '5-seater' | '7-seater',
    color: 'Unknown', // Mock data
    driverRating: booking.average_rating ? parseFloat(booking.average_rating) : 0, // Real rating from backend
    driverPhone: booking.driver_phone || null, // Driver phone number
    ride_date: booking.ride_date, // Keep raw date for filtering
    additional_amount_requested: booking.additional_amount_requested ? parseFloat(booking.additional_amount_requested) : null,
    additional_amount_status: booking.additional_amount_status || null,
  };
};

