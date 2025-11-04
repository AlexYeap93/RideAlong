import { useState } from "react";
import { LocationHeader } from "./LocationHeader";
import { SearchBar } from "./SearchBar";
import { DestinationList } from "./DestinationList";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { RideCard } from "./RideCard";
import { SeatSelection } from "./SeatSelection";
import { PaymentPage } from "./PaymentPage";
import { BookingConfirmation } from "./BookingConfirmation";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";

interface HomePageProps {
  onNavigateToUsers?: () => void;
}

export function HomePage({ onNavigateToUsers }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState("");

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setSelectedDestination(searchTerm);
      // Only University of Calgary is available, so show time slots
      if (searchTerm.toLowerCase().includes("university") || searchTerm.toLowerCase().includes("calgary")) {
        setShowTimeSlots(true);
      } else {
        setShowRides(true);
      }
    }
  };

  const handleDestinationSelect = (destination: string) => {
    setSelectedDestination(destination);
    setSearchTerm(destination);
    // Since only University of Calgary is available, show time slots
    setShowTimeSlots(true);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlots(false);
    setShowRides(true);
  };

  const handleBackToDestinations = () => {
    setShowTimeSlots(false);
    setShowRides(false);
    setShowSeatSelection(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setSelectedDestination("");
    setSelectedTimeSlot("");
    setSearchTerm("");
    setSelectedDriver(null);
    setSelectedSeat(null);
    setBookingId("");
  };

  const handleBackToTimeSlots = () => {
    setShowRides(false);
    setShowSeatSelection(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setShowTimeSlots(true);
    setSelectedDriver(null);
    setSelectedSeat(null);
  };

  const handleBackToRides = () => {
    setShowSeatSelection(false);
    setShowPayment(false);
    setSelectedDriver(null);
    setSelectedSeat(null);
  };

  const handleBackToSeatSelection = () => {
    setShowPayment(false);
  };

  const handleDriverSelect = (driver: any) => {
    setSelectedDriver(driver);
    setShowSeatSelection(true);
    setShowRides(false);
  };

  const handleSeatConfirm = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
    setShowSeatSelection(false);
    setShowPayment(true);
  };

  const handlePaymentConfirm = (paymentMethod: string) => {
    // Generate a booking ID
    const id = `RA${Date.now().toString().slice(-8)}`;
    setBookingId(id);
    setShowPayment(false);
    setShowConfirmation(true);
    
    toast.success("Payment successful!", {
      description: "Your booking has been confirmed."
    });
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
    setBookingId("");
    setShowTimeSlots(true);
  };

  const getMockRides = () => {
    if (!selectedTimeSlot) return [];
    
    const baseTime = selectedTimeSlot;
    return [
      {
        driverName: "Sarah Chen",
        rating: 4.9,
        departureTime: baseTime,
        availableSeats: 3,
        price: 12,
        destination: selectedDestination,
        estimatedDuration: "25 min",
        carType: "5-seater" as const,
        car: "Honda Civic",
        quadrant: "DT"
      },
      {
        driverName: "Mike Johnson",
        rating: 4.7,
        departureTime: baseTime,
        availableSeats: 2,
        price: 10,
        destination: selectedDestination,
        estimatedDuration: "30 min",
        carType: "5-seater" as const,
        car: "Toyota Corolla",
        quadrant: "NW"
      },
      {
        driverName: "Emily Rodriguez",
        rating: 5.0,
        departureTime: baseTime,
        availableSeats: 5,
        price: 15,
        destination: selectedDestination,
        estimatedDuration: "22 min",
        carType: "7-seater" as const,
        car: "Mazda CX-5",
        quadrant: "DT"
      },
      {
        driverName: "James Wilson",
        rating: 4.8,
        departureTime: baseTime,
        availableSeats: 4,
        price: 13,
        destination: selectedDestination,
        estimatedDuration: "28 min",
        carType: "7-seater" as const,
        car: "Honda Pilot",
        quadrant: "NE"
      }
    ];
  };

  const mockRides = getMockRides();

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
          bookingDate: getCurrentDate()
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
          quadrant: selectedDriver.quadrant
        }}
        onBack={handleBackToRides}
        onConfirm={handleSeatConfirm}
      />
    );
  }

  return (
    <div className="pb-20">
      <LocationHeader />
      <SearchBar 
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
      />
      
      {!showTimeSlots && !showRides ? (
        <DestinationList 
          searchTerm={searchTerm}
          onDestinationSelect={handleDestinationSelect}
        />
      ) : showTimeSlots ? (
        <TimeSlotSelection 
          onTimeSlotSelect={handleTimeSlotSelect}
          onBack={handleBackToDestinations}
        />
      ) : (
        <div className="bg-background">
          <div className="p-4 bg-white border-b flex items-center justify-between">
            <div>
              <h2 className="font-medium">Rides to {selectedDestination}</h2>
              <p className="text-sm text-muted-foreground">
                {selectedTimeSlot && `Departing at ${selectedTimeSlot} • `}
                {mockRides.length} rides available
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
          
          <div className="space-y-0">
            {mockRides.map((ride, index) => (
              <RideCard 
                key={index} 
                {...ride} 
                onSelect={() => handleDriverSelect(ride)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}