import { useReducer, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { bookingsAPI, usersAPI } from "../../../../services/api";
import { useAuth } from "../../../../contexts/AuthContext";
import { DriverRideDetailDialogProps } from "../../../../types";
import { DriverRideInfoCard } from "../DriverRideInfoCard";
import { DriverPassengerCard } from "../DriverPassengerCard";
import { DialogState } from "../../../shared/constants/const";


type DialogAction =
  | { type: 'SET_PASSENGER_PICKUP_TIMES'; payload: {[key: number | string]: string} }
  | { type: 'UPDATE_PASSENGER_PICKUP_TIME'; payload: { passengerId: number | string; time: string } }
  | { type: 'SET_IS_SAVING'; payload: boolean }
  | { type: 'SET_DRIVER_PHONE'; payload: string | null }
  | { type: 'RESET_PICKUP_TIMES'; payload: {[key: number | string]: string} };

const initialState: DialogState = {
  passengerPickupTimes: {},
  isSaving: false,
  driverPhone: null,
};

function dialogReducer(state: DialogState, action: DialogAction): DialogState {
  switch (action.type) {
    case 'SET_PASSENGER_PICKUP_TIMES':
      return { ...state, passengerPickupTimes: action.payload };
    case 'UPDATE_PASSENGER_PICKUP_TIME':
      return {
        ...state,
        passengerPickupTimes: {
          ...state.passengerPickupTimes,
          [action.payload.passengerId]: action.payload.time,
        },
      };
    case 'SET_IS_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_DRIVER_PHONE':
      return { ...state, driverPhone: action.payload };
    case 'RESET_PICKUP_TIMES':
      return { ...state, passengerPickupTimes: action.payload };
    default:
      return state;
  }
}

export function DriverRideDetailDialog({ 
  open, 
  onClose, 
  rideId,
  destination, 
  date, 
  departureTime,
  passengers,
  onSave
}: DriverRideDetailDialogProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(dialogReducer, initialState);

  useEffect(() => {
    // Fetch driver phone number from database
    const fetchDriverPhone = async () => {
      if (user?.id) {
        try {
          const response = await usersAPI.getUserById(user.id);
          if (response.data?.phone) {
            dispatch({ type: 'SET_DRIVER_PHONE', payload: response.data.phone });
          }
        }
        catch (error) {
          console.error("Failed to fetch driver phone:", error);
        }
      }
    };
    if (open && user?.id) {
      fetchDriverPhone();
    }
  }, [open, user?.id]);

  useEffect(() => {
    // Initialize pickup times from passengers
    // If passenger has a saved pickup time, use it; otherwise use the ride's departure time
    const initialTimes: {[key: number | string]: string} = {};
    passengers.forEach(p => {
      initialTimes[p.id] = p.pickupTime || departureTime;
    });
    // Default pickup time is the ride time to the University of Calgary
    dispatch({ type: 'RESET_PICKUP_TIMES', payload: initialTimes });
  }, [passengers, departureTime]);

  const handlePickupTimeChange = (passengerId: number | string, newTime: string) => {
    dispatch({ type: 'UPDATE_PASSENGER_PICKUP_TIME', payload: { passengerId, time: newTime } });
  };

  // Handles saving the pickup times for the ride
  const handleSave = async () => {
    dispatch({ type: 'SET_IS_SAVING', payload: true });
    try {
      const pickupTimes = passengers.map(passenger => ({
        bookingId: String(passenger.id),
        pickupTime: state.passengerPickupTimes[passenger.id] || departureTime,
        pickupLocation: passenger.pickupLocation || undefined,
      }));

      await bookingsAPI.updatePickupTimes({
        rideId: String(rideId),
        pickupTimes,
      });

      toast.success("Pickup times saved!", {
        description: "All passengers have been notified of their pickup times."
      });
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error: any) {
      toast.error("Failed to save pickup times", {
        description: error.message || "Please try again.",
      });
    } finally {
      dispatch({ type: 'SET_IS_SAVING', payload: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ride Details</DialogTitle>
          <DialogDescription>
            Manage your ride and view passenger information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ride Info */}
          <DriverRideInfoCard
            destination={destination}
            date={date}
            departureTime={departureTime}
            driverPhone={state.driverPhone}
            passengers={passengers}
          />

          {/* Passengers List */}
          <div className="space-y-3">
            <h4 className="font-medium">Passengers to Pick Up:</h4>
            {passengers.map((passenger) => (
              <DriverPassengerCard
                key={passenger.id}
                passenger={passenger}
                pickupTime={state.passengerPickupTimes[passenger.id] || departureTime}
                onPickupTimeChange={handlePickupTimeChange}
                onSave={onSave}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={state.isSaving} className="text-xs sm:text-sm">
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            {state.isSaving ? "Saving..." : "Save Pickup Times"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
