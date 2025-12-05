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
  pickup_address?: string;
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

// Passenger interface
export interface Passenger {
  id: number | string;
  name: string;
  rating: number;
  pickupLocation: string;
  pickupTime: string;
  quadrant?: string;
  seatNumber?: number;
  phone?: string;
  additionalAmountRequested?: number | null;
  additionalAmountStatus?: 'pending' | 'accepted' | 'declined' | null;
}

// Admin view interfaces
export interface AdminUserView {
  id: number;
  name: string;
  email: string;
  type: "Driver" | "Admin" | "Rider";
  status: "Active" | "Suspended";
  is_suspended: boolean;
  role: string;
  address: string | null;
  city: string | null;
  province: string | null;
  postalCode: string | null;
  joinDate: string;
  totalRides: number;
  rating: number | "N/A";
}

export interface AdminIssueView {
  id: number;
  reporter: string;
  reportedUser: string | "N/A";
  type: string;
  subject: string;
  description: string;
  date: string;
  status: "Open" | "Under Review" | "Resolved" | "Closed";
  priority: string;
  dbStatus: string;
}

export interface AdminPageState {
  searchTerm: string;
  userFilter: string;
  complaintFilter: string;
  users: any[];
  pendingDrivers: any[];
  issues: any[];
  isLoadingUsers: boolean;
  isLoadingIssues: boolean;
  selectedUser: AdminUserView | null;
  selectedComplaint: AdminIssueView | null;
  selectedDriver: AdminPendingDriverView | null;
  showUserDialog: boolean;
  showComplaintDialog: boolean;
  showDriverDialog: boolean;
}
export interface AdminPendingDriverView {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  available_seats: number;
  license_number: string | null;
  insurance_proof: string | null;
  car_photo: string | null;
}

// Driver ride interfaces
export interface ActiveRide {
  id: number;
  destination: string;
  date: string;
  rideDate: string;
  time: string;
  passengers: Passenger[];
}

export interface CompletedRide {
  id: number;
  destination: string;
  date: string;
  rideDate: string;
  time: string;
  numberOfRiders: number;
  totalEarnings: number;
}

export interface ListRideData {
  date: Date;
  time: string;
  destination: string;
}

export interface DriverState {
  showListDialog: boolean;
  showDetailDialog: boolean;
  showCompleteDialog: boolean;
  selectedRide: ActiveRide | null;
  rideToComplete: ActiveRide | null;
  driverId: string | null;
  isApprovedDriver: boolean;
  isCheckingDriver: boolean;
  hasDriverApplication: boolean;
  totalEarnings: number;
  activeRides: ActiveRide[];
  completedRides: CompletedRide[];
  isLoading: boolean;
}

// Frontend User interface (for AuthContext)
export interface FrontendUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'driver' | 'admin';
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  driverInfo?: any;
}

export interface AuthContextType {
  user: FrontendUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
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
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (partial: Partial<FrontendUser>) => void;
}

// Frontend PaymentMethod interface (for component usage)
export interface FrontendPaymentMethod {
  id: string;
  type: string;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault?: boolean;
}

export interface AddCardInput {
  type: string;
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  cardholderName?: string;
  isDefault?: boolean;
}