import { useState, useRef } from "react";
import { LocationHeader } from "../../../components/LocationHeader";
import { DestinationList } from "../../../components/DestinationList";
import { TimeSlotSelection } from "../../../components/TimeSlotSelection";
import { RideCard } from "../../ride/components/RideCard";
import { SeatSelection } from "../../../components/SeatSelection";
import { PaymentPage } from "../../payments/pages/PaymentPage";
import { BookingConfirmation } from "../../ride/components/BookingConfirmation";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import {  bookingsAPI, paymentsAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { useRides } from "../hooks/useRides"; 
import { useHomeNavigation } from "../hooks/useHomeNavigation";


interface HomePageProps {
  onNavigateToUsers?: () => void;
  onBookingCreated?: () => void; // Callback when booking is created
  autoSelectDestination?: string; // Auto-select destination when navigating from Users tab
}

export function HomePage({ onNavigateToUsers, onBookingCreated, autoSelectDestination }: HomePageProps) {
  const { user } = useAuth();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingId, setBookingId] = useState("");

  const { rides, isLoading, fetchRidesForTimeSlot } = useRides(selectedDate);
  const isUpdatingHashRef = useRef(false);

  const {
    selectedDestination,
    setSelectedDestination,
    selectedTimeSlot,
    setSelectedTimeSlot,
    showTimeSlots,
    setShowTimeSlots,
    showRides,
    setShowRides,
    selectedDriver,
    setSelectedDriver,
    selectedSeat,
    setSelectedSeat,
  } = useHomeNavigation({
    autoSelectDestination,
    showSeatSelection,
    showPayment,
    showConfirmation,
    setShowSeatSelection,
    setShowPayment,
    setShowConfirmation,
    isUpdatingHashRef
  });

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    // Since only University of Calgary is available, show time slots
    setShowTimeSlots(true);
    setShowRides(false);
    // Update hash
    isUpdatingHashRef.current = true;
    window.location.hash = `home/timeslots/${encodeURIComponent(destination)}`;
  };

  const handleTimeSlotSelect = async (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlots(false);
    // Update hash
    isUpdatingHashRef.current = true;
    window.location.hash = `home/rides/${encodeURIComponent(selectedDestination || "University of Calgary")}/${encodeURIComponent(timeSlot)}`;
    // Fetch rides
    await fetchRidesForTimeSlot(timeSlot, selectedDestination || "University of Calgary");
  };

  const handleBackToDestinations = () => {
    setShowTimeSlots(false);
    setShowRides(false);
    setShowSeatSelection(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setSelectedDestination("");
    setSelectedTimeSlot("");
    setSelectedDriver(null);
    setSelectedSeat(null);
    setBookingId("");
    // Update hash
    isUpdatingHashRef.current = true;
    window.location.hash = 'home/destination';
  };

  const handleBackToTimeSlots = () => {
    setShowRides(false);
    setShowSeatSelection(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setShowTimeSlots(true);
    setSelectedDriver(null);
    setSelectedSeat(null);
    // Update hash
    isUpdatingHashRef.current = true;
    window.location.hash = `home/timeslots/${encodeURIComponent(selectedDestination || "University of Calgary")}`;
  };

  const handleBackToRides = () => {
    setShowSeatSelection(false);
    setShowPayment(false);
    setSelectedDriver(null);
    setSelectedSeat(null);
    // Update hash to go back to rides list
    isUpdatingHashRef.current = true;
    window.location.hash = `home/rides/${encodeURIComponent(selectedDestination || "University of Calgary")}/${encodeURIComponent(selectedTimeSlot || "")}`;
  };

  const handleBackToSeatSelection = () => {
    setShowPayment(false);
  };

  const handleDriverSelect = (driver: any) => {
    setSelectedDriver(driver);
    setShowSeatSelection(true);
    setShowRides(false);
    // Update hash for seat selection (but keep it in the booking flow, not in main hash)
    // The hash will remain at rides level for browser back button
  };

  const handleSeatConfirm = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
    setShowSeatSelection(false);
    setShowPayment(true);
  };

  const handlePaymentConfirm = async (
    paymentMethod: string,
    pickupAddress: string,
    pickupCity: string,
    pickupProvince: string,
    pickupPostalCode: string
  ) => {
    if (!user || !selectedDriver || !selectedSeat) {
      toast.error("Missing information", {
        description: "Please try again.",
      });
      return;
    }

    if (!pickupAddress.trim() || !pickupCity.trim() || !pickupProvince.trim() || !pickupPostalCode.trim()) {
      toast.error("Complete pickup address is required", {
        description: "Please enter all address fields.",
      });
      return;
    }

    try {
      // Create booking with complete pickup address
      const fullPickupAddress = `${pickupAddress}, ${pickupCity}, ${pickupProvince} ${pickupPostalCode}`;
      const bookingResponse = await bookingsAPI.createBooking({
        rideId: selectedDriver.rideId || selectedDriver.id,
        numberOfSeats: 1,
        seatNumber: selectedSeat,
        pickupLocation: fullPickupAddress,
      });

      const booking = bookingResponse.data;
      setBookingId(booking.id);

      // Create payment with original price
      await paymentsAPI.createPayment({
        bookingId: booking.id,
        amount: selectedDriver.price * selectedSeat,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
      });

      setShowPayment(false);
      setShowConfirmation(true);
      
      toast.success("Payment successful!", {
        description: "Your booking has been confirmed."
      });

      // Trigger refresh of UsersPage bookings
      if (onBookingCreated) {
        onBookingCreated();
      }
    } catch (error: any) {
      toast.error("Failed to create booking", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleViewBookings = () => {
    onNavigateToUsers?.();
  };

  const handleBookAnotherRide = () => {
    setShowConfirmation(false);
    setShowPayment(false);
    setShowSeatSelection(false);
    setShowRides(false);
    setSelectedDriver(null);
    setSelectedSeat(null);
    setSelectedTimeSlot(""); // Reset time slot so user can choose a different one
    setBookingId("");
    // Keep destination and date so user can easily book another ride
    setShowTimeSlots(true);
    // Update hash to go back to time slots with the same destination
    isUpdatingHashRef.current = true;
    if (selectedDestination) {
      window.location.hash = `home/timeslots/${encodeURIComponent(selectedDestination)}`;
    } else {
      window.location.hash = 'home/destination';
    }
  };


  // Get current date for booking
  const getCurrentDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // If showing confirmation
  if (showConfirmation && selectedDriver && selectedSeat) {
    return (
      <BookingConfirmation
        bookingDetails={{
          bookingId: bookingId,
          driverName: selectedDriver.driverName,
          rating: selectedDriver.rating,
          departureTime: selectedDriver.departureTime,
          destination: selectedDriver.destination,
          quadrant: selectedDriver.quadrant,
          seatNumber: selectedSeat,
          price: selectedDriver.price,
          car: selectedDriver.car,
          carType: selectedDriver.carType,
          bookingDate: getCurrentDate()
        }}
        onViewBookings={handleViewBookings}
        onReturnHome={handleBookAnotherRide}
      />
    );
  }

  // If showing payment
  if (showPayment && selectedDriver && selectedSeat) {
    return (
      <PaymentPage
        bookingDetails={{
          driverName: selectedDriver.driverName,
          rating: selectedDriver.rating,
          departureTime: selectedDriver.departureTime,
          destination: selectedDriver.destination,
          quadrant: selectedDriver.quadrant,
          seatNumber: selectedSeat,
          price: selectedDriver.price,
          car: selectedDriver.car,
          carType: selectedDriver.carType,
          bookingDate: getCurrentDate(),
          rideId: selectedDriver.rideId || selectedDriver.id,
        }}
        onBack={handleBackToSeatSelection}
        onConfirm={handlePaymentConfirm}
      />
    );
  }

  // If showing seat selection
  if (showSeatSelection && selectedDriver) {
    return (
      <SeatSelection 
        driver={{
          name: selectedDriver.driverName,
          rating: selectedDriver.rating,
          car: selectedDriver.car,
          carType: selectedDriver.carType,
          price: selectedDriver.price,
          departureTime: selectedDriver.departureTime,
          destination: selectedDriver.destination,
          quadrant: selectedDriver.quadrant,
          rideId: selectedDriver.rideId || selectedDriver.id,
          driverId: selectedDriver.driverId || selectedDriver.driver_user_id,
        }}
        onBack={handleBackToRides}
        onConfirm={handleSeatConfirm}
      />
    );
  }

  return (
    <div className="pb-20">
      <LocationHeader />
      
      {!showTimeSlots && !showRides ? (
        <DestinationList 
          onDestinationSelect={handleDestinationSelect}
        />
      ) : showTimeSlots ? (
        <TimeSlotSelection 
          onTimeSlotSelect={handleTimeSlotSelect}
          onBack={handleBackToDestinations}
          destination={selectedDestination || "University of Calgary"}
          selectedDate={selectedDate}
          onDateChange={(date) => setSelectedDate(date)}
        />
      ) : (
        <div className="bg-background">
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium">Rides to {selectedDestination || "University of Calgary"}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTimeSlot && `Departing at ${selectedTimeSlot} • `}
                {isLoading ? "Loading..." : `${rides.length} rides available`}
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBackToTimeSlots}
            >
              Change Time
            </Button>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading rides...</p>
            </div>
          ) : rides.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No rides available for this time slot.</p>
            </div>
          ) : (
            <div className="space-y-0">
              {rides.map((ride) => (
                <RideCard 
                  key={ride.id} 
                  {...ride} 
                  onSelect={() => handleDriverSelect(ride)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}