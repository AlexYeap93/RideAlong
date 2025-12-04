// Shared types for the RideAlong application

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

export interface DriverRideDetailDialogProps {
  open: boolean;
  onClose: () => void;
  rideId: string | number;
  destination: string;
  date: string;
  departureTime: string;
  passengers: Passenger[];
  onSave?: () => void;
}

export interface PaymentMethod {
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
