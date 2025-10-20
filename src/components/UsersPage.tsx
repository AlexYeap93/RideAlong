import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, MapPin, Clock } from "lucide-react";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { RideCard } from "./RideCard";
import { SeatSelection } from "./SeatSelection";
import { toast } from "sonner@2.0.3";

export function UsersPage() {
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);

  // User's active bookings for the day - pickup times synced from driver
  const activeBookings = [
    {
      id: 1,
      driverName: "Sarah Chen",
      driverRating: 4.9,
      car: "Honda Civic",
      carType: "5-seater" as const,
      color: "White",
      destination: "University of Calgary",
      date: "Oct 20, 2025",
      departureTime: "3:00 PM",
      pickupLocation: "Brentwood Station",
      pickupTime: "2:45 PM", // This syncs with driver's saved time
      quadrant: "NW",
      status: "confirmed",
      seatNumber: 2
    },
    {
      id: 2,
      driverName: "Mike Johnson",
      driverRating: 4.7,
      car: "Toyota Corolla",
      carType: "5-seater" as const,
      color: "Silver",
      destination: "University of Calgary",
      date: "Oct 20, 2025",
      departureTime: "5:30 PM",
      pickupLocation: "Dalhousie Station",
      pickupTime: "5:15 PM", // This syncs with driver's saved time
      quadrant: "NW",
      status: "confirmed",
      seatNumber: 3
    }
  ];

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlots(false);
    setShowRides(true);
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

  const handleBackToMain = () => {
    setShowTimeSlots(false);
    setShowRides(false);
    setShowSeatSelection(false);
    setSelectedTimeSlot("");
    setSelectedDriver(null);
  };

  const handleDriverSelect = (driver: any) => {
    setSelectedDriver(driver);
    setShowSeatSelection(true);
    setShowRides(false);
  };

  const handleSeatConfirm = (seatNumber: number) => {
    console.log("Seat confirmed:", seatNumber, "for driver:", selectedDriver);
    toast.success(`Seat ${seatNumber} booked successfully!`, {
      description: `Your ride with ${selectedDriver.driverName} is confirmed for ${selectedDriver.departureTime}.`
    });
    handleBackToMain();
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
        destination: "University of Calgary",
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
        destination: "University of Calgary",
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
        destination: "University of Calgary",
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
        destination: "University of Calgary",
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

  // If showing time slots
  if (showTimeSlots) {
    return (
      <TimeSlotSelection 
        onTimeSlotSelect={handleTimeSlotSelect}
        onBack={handleBackToMain}
      />
    );
  }

  // If showing available rides
  if (showRides) {
    return (
      <div className="pb-20 bg-background min-h-screen">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div>
            <h2 className="font-medium">Rides to University of Calgary</h2>
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
    );
  }

  // Main view with active bookings and browse button
  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-medium mb-1">For Users</h1>
        <p className="text-sm text-primary-foreground/80">Your rides to University of Calgary</p>
      </div>

      {/* Browse Rides Button - Thinner Bar */}
      <div className="p-4">
        <Button 
          className="w-full"
          onClick={() => setShowTimeSlots(true)}
        >
          Browse Rides to University of Calgary
        </Button>
      </div>

      {/* Active Bookings Section */}
      {activeBookings.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Your Active Rides Today</h2>
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <Card key={booking.id} className="p-4 border-2 border-green-500">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {booking.driverName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        Confirmed - Seat {booking.seatNumber}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {booking.quadrant}
                      </Badge>
                    </div>

                    <h3 className="font-medium mb-1">{booking.driverName}</h3>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{booking.driverRating}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Car:</span>
                        <span>{booking.car} ({booking.color})</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{booking.destination}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-600">
                            Pickup: {booking.pickupTime}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            at {booking.pickupLocation}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>Departure: {booking.departureTime}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <Button size="sm" variant="outline">
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
