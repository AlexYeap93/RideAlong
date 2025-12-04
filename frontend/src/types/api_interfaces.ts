// API interfaces for RideAlong frontend

export interface User {
    email: string;
    password: string;
    name: string;
    phone: string;
    userType: 'rider' | 'driver';
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    licenseNumber?: string;
    insuranceProof?: string;
    carPhoto?: string;
    availableSeats?: number;
}

export interface APIUser{
        status: string;
        message: string | null;
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
}


export interface Driver {
  id: string;
  user_id: string;
  license_number: string;
  insurance_proof?: string;
  car_photo?: string;
  available_seats: number;
  is_approved?: boolean;
  total_earnings?: number;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token?: string;
  };
}

export interface ListResponse<T> {
  status: string;
  data: T[];
}

export interface ItemResponse<T> {
  status: string;
  data: T;
}

export interface Ride {
  id: string;
  driver_id: string;
  destination: string;
  ride_date: string;
  ride_time: string;
  price: number;
  status: 'active' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  ride_id: string;
  number_of_seats: number;
  seat_number?: number;
  pickup_location?: string;
  pickup_city?: string;
  pickup_province?: string;
  pickup_postal_code?: string;
  pickup_time?: string;
  additional_amount_requested?: number;
  additional_amount_status?: 'pending' | 'accepted' | 'declined' | null;
  status: 'confirmed' | 'cancelled' | 'completed';
  created_at?: string;
  updated_at?: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  type: 'credit' | 'debit' | 'paypal' | 'other';
  brand?: string;
  last4: string;
  expiry_month?: number;
  expiry_year?: number;
  cardholder_name?: string;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Rating {
  id: string;
  booking_id: string;
  user_id: string;
  driver_id: string;
  ride_id: string;
  rating: number;
  comment?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Issue {
  id: string;
  user_id: string;
  booking_id?: string;
  issue_type: string;
  subject: string;
  description: string;
  reported_user_id?: string;
  status?: 'open' | 'under_review' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  admin_notes?: string;
  created_at?: string;
  updated_at?: string;
}
