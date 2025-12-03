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