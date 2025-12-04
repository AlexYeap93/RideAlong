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

export interface ActiveRideCardProps {
  rideId: number;
  destination: string;
  date: string;
  time: string;
  passengers: Passenger[];
}

export interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

export interface DestinationListProps {
  onDestinationSelect: (destination: string) => void;
}

export interface HomePageProps {
  onNavigateToUsers?: () => void;
  onBookingCreated?: () => void; // Callback when booking is created
  autoSelectDestination?: string; // Auto-select destination when navigating from Users tab
}

export interface UseHomeNavigationProps {
  autoSelectDestination?: string;
  showSeatSelection?: boolean;
  showPayment?: boolean;
  showConfirmation?: boolean;
  setShowSeatSelection: (value: boolean) => void;
  setShowPayment: (value: boolean) => void;
  setShowConfirmation: (value: boolean) => void;
  isUpdatingHashRef: React.RefObject<boolean>; 

}

export interface LoginPageProps {
  initialMode?: "login" | "signup";
  initialUserType?: "rider" | "driver";
  onBack?: () => void;
}

export interface RequestRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { date: Date; time: string; destination: string }) => void;
}

export interface ScrollableDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
}

export interface SeatSelectionProps {
  driver: {
    name: string;
    rating: number;
    car: string;
    carType: "5-seater" | "7-seater";
    price: number;
    departureTime: string;
    destination: string;
    quadrant: string;
    rideId?: string;
    driverId?: string;
  };
  onBack: () => void;
  onConfirm: (seat: number) => void;
}

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export interface TimeSlot {
  id: string;
  time: string;
  period: string;
  available: boolean;
  driverCount: number;
}

export interface TimeSlotSelectionProps {
  onTimeSlotSelect: (timeSlot: string) => void;
  onBack: () => void;
  destination?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}
