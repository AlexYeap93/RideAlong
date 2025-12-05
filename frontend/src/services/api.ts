
import { API_BASE_URL } from '../types/const';


// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};


// Helper function for API requests
export async function apiRequest<T>(
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

