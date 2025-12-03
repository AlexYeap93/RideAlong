// Constants and Interfaces for DriversPage

export interface Passenger {
  id: number | string;
  name: string;
  phone?: string;
  rating: number;
  pickupLocation: string;
  pickupTime: string;
  quadrant?: string;
  seatNumber?: number;
  additionalAmountRequested?: number | null;
  additionalAmountStatus?: 'pending' | 'accepted' | 'declined' | null;
}

export interface ActiveRide {
  id: number;
  destination: string;
  date: string;
  rideDate: string; // Raw date for filtering
  time: string;
  passengers: Passenger[];
}

export interface CompletedRide {
  id: number;
  destination: string;
  date: string;
  rideDate: string; // Raw date for filtering
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
  // Dialog states
  showListDialog: boolean;
  showDetailDialog: boolean;
  showCompleteDialog: boolean;
  
  // Selected items
  selectedRide: ActiveRide | null;
  rideToComplete: ActiveRide | null;
  
  // Driver info
  driverId: string | null;
  isApprovedDriver: boolean;
  isCheckingDriver: boolean;
  hasDriverApplication: boolean;
  totalEarnings: number;
  
  // Rides data
  activeRides: ActiveRide[];
  completedRides: CompletedRide[];
  
  // Loading states
  isLoading: boolean;
}

export interface DriverApprovalStatusProps {
  hasDriverApplication: boolean;
  isApprovedDriver: boolean;
  isCheckingDriver: boolean;
}

export interface DriverActiveRidesSectionProps {
  activeRides: ActiveRide[];
  driverId: string | null;
  onViewDetails: (ride: ActiveRide) => void;
  onCompleteClick: (ride: ActiveRide) => void;
  onRefresh: () => Promise<void>;
}
export interface DriverCompletedRidesSectionProps {
  completedRides: CompletedRide[];
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
  completedRides: CompletedRide[];
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
  rideToComplete: ActiveRide | null;
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
// After Payment, to the Booking Confirmation Page
export interface BookingConfirmationProps {
  bookingDetails: {
    bookingId: string;
    driverName: string;
    rating: number; // This is the rating of the driver from the database "Ratings" table
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
// Constants
export const REFRESH_INTERVAL = 5000; // 5 seconds
export const DEFAULT_RIDE_PRICE = 10;
export const serviceFee = 2.50;
