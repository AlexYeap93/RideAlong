import { Passenger } from "./types";

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
