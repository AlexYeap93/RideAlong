import { useState, useEffect, useRef } from "react";
import { LocationHeader } from "./LocationHeader";
import { DestinationList } from "./DestinationList";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { RideCard } from "../features/ride/components/RideCard";
import { SeatSelection } from "./SeatSelection";
import { PaymentPage } from "./PaymentPage";
import { BookingConfirmation } from "../features/ride/components/BookingConfirmation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { ridesAPI, bookingsAPI, paymentsAPI, transformRideData } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface HomePageProps {
  onNavigateToUsers?: () => void;
  onBookingCreated?: () => void; // Callback when booking is created
  autoSelectDestination?: string; // Auto-select destination when navigating from Users tab
}

export function HomePage({ onNavigateToUsers, onBookingCreated, autoSelectDestination }: HomePageProps) {
  const { user } = useAuth();
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState("");
  const [rides, setRides] = useState<any[]>([]);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const isUpdatingHashRef = useRef(false);

  // Helper function to convert 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours) + 12);
    return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`;
  };

  // Helper function to get time difference in minutes
  const getTimeDifference = (time1: string, time2: string): number => {
    // Handle both "HH:MM" and "HH:MM:SS" formats
    const parts1 = time1.split(':').map(Number);
    const parts2 = time2.split(':').map(Number);
    const h1 = parts1[0] || 0;
    const m1 = parts1[1] || 0;
    const h2 = parts2[0] || 0;
    const m2 = parts2[1] || 0;
    return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
  };

  // Helper function to fetch rides for a time slot (defined early for use in useEffect)
  const fetchRidesForTimeSlot = async (timeSlot: string, destination: string) => {
    setSelectedTimeSlot(timeSlot);
    setIsLoadingRides(true);
    setShowRides(true);

    try {
      // Convert time slot to 24-hour format for backend
      const time24 = convertTo24Hour(timeSlot);
      const dateStr = selectedDate.toISOString().split('T')[0];
      
      // Fetch available rides from backend
      const response = await ridesAPI.getAvailableRides({
        destination: destination || "University of Calgary",
        date: dateStr,
      });

      const transformedRides = response.data.map(transformRideData);
      
      // Filter by time slot (approximate match)
      const filteredRides = transformedRides.filter(ride => {
        const rawRide = response.data.find((r: any) => r.id === ride.id);
        if (!rawRide) return false;
        
        const backendTime = rawRide.ride_time || rawRide.time || '12:00:00';
        const backendTimeHM = backendTime.split(':').slice(0, 2).join(':');
        const selectedTimeHM = time24.split(':').slice(0, 2).join(':');
        
        return Math.abs(getTimeDifference(backendTimeHM, selectedTimeHM)) <= 30;
      });

      setRides(filteredRides);
    } catch (error: any) {
      toast.error("Failed to load rides", {
        description: error.message || "Please try again.",
      });
      setRides([]);
    } finally {
      setIsLoadingRides(false);
    }
  };

  // Auto-show time slots when navigating from Users tab (only one destination available)
  useEffect(() => {
    if (autoSelectDestination && !selectedDestination && !showTimeSlots) {
      setSelectedDestination("University of Calgary");
      setShowTimeSlots(true);
      setShowRides(false);
      isUpdatingHashRef.current = true;
      window.location.hash = `home/timeslots/${encodeURIComponent("University of Calgary")}`;
    }
  }, [autoSelectDestination, selectedDestination, showTimeSlots]);

  // Initialize from URL hash on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('home/')) {
      const parts = hash.split('/');
      if (parts[1] === 'destination') {
        // Already on destination selection (default state)
      } else if (parts[1] === 'timeslots') {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        setSelectedDestination(dest);
        setShowTimeSlots(true);
      } else if (parts[1] === 'rides') {
        const dest = decodeURIComponent(parts[2] || "University of Calgary");
        const timeSlot = decodeURIComponent(parts[3] || "");
               setSelectedDestination(dest);
        setSelectedTimeSlot(timeSlot);
        setShowTimeSlots(false);
        setShowRides(true);
        // Fetch rides if we have the time slot
        if (timeSlot) {
          fetchRidesForTimeSlot(timeSlot, dest);
        }
      }
    }
  }, []);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (!isUpdatingHashRef.current) {
        const hash = window.location.hash.slice(1);
        if (hash.startsWith('home/')) {
          const parts = hash.split('/');
          if (parts[1] === 'destination' || parts.length === 1 || hash === 'home') {
            // Go back to destination selection
            setShowTimeSlots(false);
            setShowRides(false);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedDestination("");
            setSelectedTimeSlot("");
            setSelectedDriver(null);
            setSelectedSeat(null);
          } else if (parts[1] === 'timeslots') {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            setSelectedDestination(dest);
            setShowTimeSlots(true);
            setShowRides(false);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedTimeSlot("");
            setSelectedDriver(null);
            setSelectedSeat(null);
          } else if (parts[1] === 'rides') {
            const dest = decodeURIComponent(parts[2] || "University of Calgary");
            const timeSlot = decodeURIComponent(parts[3] || "");
            setSelectedDestination(dest);
            setSelectedTimeSlot(timeSlot);
            setShowTimeSlots(false);
            setShowRides(true);
            setShowSeatSelection(false);
            setShowPayment(false);
            setShowConfirmation(false);
            setSelectedDriver(null);
            setSelectedSeat(null);
            // Re-fetch rides if we have the time slot
            if (timeSlot) {
              fetchRidesForTimeSlot(timeSlot, dest);
            }
          }
        }
      }
      isUpdatingHashRef.current = false;
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Update URL hash when navigation state changes
  useEffect(() => {
    let hash = 'home';
    if (showTimeSlots && selectedDestination) {
      hash = `home/timeslots/${encodeURIComponent(selectedDestination)}`;
    } else if (showRides && selectedDestination && selectedTimeSlot) {
      hash = `home/rides/${encodeURIComponent(selectedDestination)}/${encodeURIComponent(selectedTimeSlot)}`;
    } else if (!showTimeSlots && !showRides) {
      hash = 'home/destination';
    }
    
    // Don't update hash if we're in booking flow (seat selection, payment, confirmation)
    // These are modal-like states that should maintain the rides hash for browser back button
    if (showSeatSelection || showPayment || showConfirmation) {
      return;
    }

    const currentHash = window.location.hash.slice(1);
    if (currentHash !== hash) {
      isUpdatingHashRef.current = true;
      window.location.hash = hash;
    }
  }, [showTimeSlots, showRides, selectedDestination, selectedTimeSlot, showSeatSelection, showPayment, showConfirmation]);

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
    pickupAddress: string
  ) => {
    if (!user || !selectedDriver || !selectedSeat) {
      toast.error("Missing information", {
        description: "Please try again.",
      });
      return;
    }

    if (!pickupAddress.trim()) {
      toast.error("Pickup address is required", {
        description: "Please enter your pickup address.",
      });
      return;
    }

    try {
      // Create booking with pickup address
      const bookingResponse = await bookingsAPI.createBooking({
        rideId: selectedDriver.rideId || selectedDriver.id,
        numberOfSeats: 1,
        seatNumber: selectedSeat,
        pickupLocation: pickupAddress,
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
    setRides([]); // Clear rides list to ensure fresh data is loaded
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
                {isLoadingRides ? "Loading..." : `${rides.length} rides available`}
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
          
          {isLoadingRides ? (
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