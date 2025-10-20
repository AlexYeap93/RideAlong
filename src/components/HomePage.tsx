import { useState } from "react";
import { LocationHeader } from "./LocationHeader";
import { SearchBar } from "./SearchBar";
import { DestinationList } from "./DestinationList";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { RideCard } from "./RideCard";
import { SeatSelection } from "./SeatSelection";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "sonner";

export function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);

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
    setSelectedDestination("");
    setSelectedTimeSlot("");
    setSearchTerm("");
    setSelectedDriver(null);
  };

  const handleBackToTimeSlots = () => {
    setShowRides(false);
    setShowSeatSelection(false);
    setShowTimeSlots(true);
    setSelectedDriver(null);
  };

  const handleBackToRides = () => {
    setShowSeatSelection(false);
    setSelectedDriver(null);
  };

  const handleDriverSelect = (driver: any) => {
    setSelectedDriver(driver);
    setShowSeatSelection(true);
    setShowRides(false);
  };

  const handleSeatConfirm = (seatNumber: number) => {
    console.log("Seat confirmed:", seatNumber, "for driver:", selectedDriver);
    // Handle booking confirmation
    toast.success(`Seat ${seatNumber} booked successfully!`, {
      description: `Your ride with ${selectedDriver.driverName} is confirmed for ${selectedDriver.departureTime}.`
    });
    handleBackToDestinations();
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
          
          <Tabs defaultValue="rides" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-4 my-4">
              <TabsTrigger value="rides">Available Rides</TabsTrigger>
              <TabsTrigger value="offer">Offer Ride</TabsTrigger>
            </TabsList>
            
            <TabsContent value="rides" className="space-y-0">
              {mockRides.map((ride, index) => (
                <RideCard 
                  key={index} 
                  {...ride} 
                  onSelect={() => handleDriverSelect(ride)}
                />
              ))}
            </TabsContent>
            
            <TabsContent value="offer" className="p-4">
              <div className="bg-white rounded-lg p-6 text-center">
                <h3 className="font-medium mb-2">Offer a Ride</h3>
                <p className="text-muted-foreground mb-4">
                  Going to {selectedDestination}? Offer a ride and earn money while helping others!
                </p>
                <Button className="w-full">
                  Create Ride Offer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}