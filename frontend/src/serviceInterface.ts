import type { Passenger } from "./types/api_interfaces";

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

// Driver component props
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

export interface DriverApprovalStatusProps {
  hasDriverApplication: boolean;
  isApprovedDriver: boolean;
  isCheckingDriver: boolean;
}

export interface DriverActiveRidesSectionProps {
  activeRides: any[];
  driverId: string | null;
  onViewDetails: (ride: any) => void;
  onCompleteClick: (ride: any) => void;
  onRefresh: () => Promise<void>;
}

export interface DriverCompletedRidesSectionProps {
  completedRides: any[];
}

export interface DriverLoadingStateProps {
  message: string;
}

export interface DriversPageHeaderProps {
  isApprovedDriver: boolean;
  userRole?: string;
  onListRideClick: () => void;
}

export interface DriverStatsSectionProps {
  activeRidesCount: number;
  completedRides: any[];
  totalEarnings: number;
}

export interface DriverPassengerCardProps {
  passenger: Passenger;
  pickupTime: string;
  onPickupTimeChange: (passengerId: number | string, newTime: string) => void;
  onSave?: () => void;
}

export interface DriverRideInfoCardProps {
  destination: string;
  date: string;
  departureTime: string;
  driverPhone: string | null;
  passengers: Passenger[];
}

export interface DriverApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface DriverCompleteRideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rideToComplete: any | null;
  onConfirm: () => Promise<void>;
}

export interface FormState {
  licenseNumber: string;
  insuranceProof: string;
  carPhoto: File | null;
  availableSeats: string;
  isSubmitting: boolean;
}

export interface DialogState {
  passengerPickupTimes: {[key: number | string]: string};
  isSaving: boolean;
  driverPhone: string | null;
}

// Booking and Ride props
export interface BookingConfirmationProps {
  bookingDetails: {
    bookingId: string;
    driverName: string;
    rating: number;
    departureTime: string;
    destination: string;
    quadrant: string;
    seatNumber: number;
    price: number;
    car: string;
    carType: string;
    bookingDate: string;
  };
  onViewBookings: () => void;
  onReturnHome: () => void;
}

export interface RideCardProps {
  driverName: string;
  rating: number;
  departureTime: string;
  availableSeats: number;
  price: number;
  destination: string;
  estimatedDuration: string;
  carType?: "5-seater" | "7-seater";
  quadrant?: string;
  driverAddress?: string;
  onSelect?: () => void;
}

export interface RideHistoryProps {
  onBack: () => void;
}

export interface ListRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { date: Date; time: string; destination: string }) => void;
}

// Payment props
export interface PaymentPageProps {
  bookingDetails: {
    driverName: string;
    rating: number;
    departureTime: string;
    destination: string;
    quadrant: string;
    seatNumber: number;
    price: number;
    car: string;
    carType: string;
    bookingDate: string;
    rideId?: string;
  };
  onBack: () => void;
  onConfirm: (paymentMethod: string, pickupAddress: string, pickupCity: string, pickupProvince: string, pickupPostalCode: string) => void;
}

export interface PaymentMethodsProps {
  onBack: () => void;
}

export interface AddCardParams {
  cardNumber: string;
  cardName: string;
  expiryDate: string; // MM/YY
  cvv: string;
}

// Page props
export interface UsersPageProps {
  initialMode?: "main" | "browseRides";
  onModeChange?: (mode: "main" | "browseRides") => void;
  refreshTrigger?: number;
  onNavigateToHome?: () => void;
}

export interface SettingsPageProps {
  user: any;
  onBack: () => void;
  onUserUpdated?: (updated: any) => void;
}

export interface ProfilePageProps {
  onNavigateToPaymentMethods?: () => void;
  onNavigateToRideHistory?: () => void;
  onNavigateToSettings?: () => void;
}

export interface ProfilePageState {
  ridesTaken: number;
  ridesOffered: number;
  showDriverApplication: boolean;
  hasDriverProfile: boolean;
  isApprovedDriver: boolean;
  driverId: string | null;
  showHelpDialog: boolean;
  issueType: string;
  issueDescription: string;
  averageRating: number | null;
  recentBookings?: any[];
  selectedBookingId?: string;
}

export interface HomeNavigationState {
  selectedDestination: string;
  selectedTimeSlot: string;
  showTimeSlots: boolean;
  showRides: boolean;
  selectedDriver: any;
  selectedSeat: number | null;
}

// Admin props
export interface adminDriversProps {
  pendingDrivers: any[];
  onDriverClick: (driver: any) => void;
}

export interface issueProps {
  complaints: any[];
  isLoading: boolean;
  complaintFilter: string;
  onComplaintFilterChange: (value: string) => void;
  onComplaintClick: (c: any) => void;
}

export interface settingsProps {
  users: any[];
  isLoading: boolean;
  userFilter: string;
  onUserFilterChange: (v: string) => void;
  searchTerm: string;
  onSearchTermChange: (v: string) => void;
  onUserClick: (u: any) => void;
}

export interface adminUserProps {
  users: any[];
  isLoading: boolean;
  userFilter: string;
  onUserFilterChange: (value: string) => void;
  onUserClick: (user: any) => void;
}

export interface adminDriverDialogProps {
  open: boolean;
  driver: any | null;
  onOpenChange: (o: boolean) => void;
  onApprove: (d: any) => void;
  onReject: (d: any) => void;
}

export interface adminUserDialogProps {
  open: boolean;
  user: any | null;
  onOpenChange: (open: boolean) => void;
  onSuspendUser: (u: any) => void;
  onActivateUser: (u: any) => void;
}

export interface IssueCardProps {
  subject: string;
  description: string;
  date: string;
  reporter: string;
  priority: string;
  status: string;
  onClick?: () => void;
}

export interface PageHeaderProps {
  title: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}
export interface UsersPageState {
  showTimeSlots: boolean;
  selectedTimeSlot: string;
  showRides: boolean;
  selectedDriver: any;
  showSeatSelection: boolean;
  showPayment: boolean;
  showConfirmation: boolean;
  selectedSeat: number | null;
  bookingId: string;
  showHelpDialog: boolean;
  selectedBookingForHelp: any;
  issueType: string;
  issueDescription: string;
  showDetailsDialog: boolean;
  selectedBookingForDetails: any;
  activeBookings: any[];
  completedBookings: any[];
  rides: any[];
  isLoadingBookings: boolean;
  isLoadingRides: boolean;
  showRatingDialog: boolean;
  selectedBookingForRating: any;
  rating: number;
  ratingComment: string;
  isSubmittingRating: boolean;
  isRespondingToAmount: {[key: string]: boolean};
}

export interface PaymentPageState {
  paymentSource: "saved" | "manual";
  selectedSavedMethod: string;
  savedPaymentMethods: any[];
  isLoadingMethods: boolean;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
  savePaymentMethod: boolean;
  isProcessing: boolean;
  addressSource: "saved" | "manual";
  pickupAddress: string;
  pickupCity: string;
  pickupProvince: string;
  pickupPostalCode: string;
}
