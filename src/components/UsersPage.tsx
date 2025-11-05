import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, MapPin, Clock, HelpCircle } from "lucide-react";
import { TimeSlotSelection } from "./TimeSlotSelection";
import { RideCard } from "./RideCard";
import { SeatSelection } from "./SeatSelection";
import { PaymentPage } from "./PaymentPage";
import { BookingConfirmation } from "./BookingConfirmation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { toast } from "sonner@2.0.3";

interface UsersPageProps {
  initialMode?: "main" | "browseRides";
  onModeChange?: (mode: "main" | "browseRides") => void;
}

export function UsersPage({ initialMode = "main", onModeChange }: UsersPageProps) {
  const [showTimeSlots, setShowTimeSlots] = useState(initialMode === "browseRides");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showRides, setShowRides] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showSeatSelection, setShowSeatSelection] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingId, setBookingId] = useState("");
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [selectedBookingForHelp, setSelectedBookingForHelp] = useState<any>(null);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null);

  // Sync with initialMode changes
  useEffect(() => {
    if (initialMode === "browseRides") {
      setShowTimeSlots(true);
    }
  }, [initialMode]);

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
      seatNumber: 2,
      price: 12
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
      seatNumber: 3,
      price: 10
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
    setShowPayment(false);
    setShowConfirmation(false);
    setSelectedTimeSlot("");
    setSelectedDriver(null);
    setSelectedSeat(null);
    setBookingId("");
    onModeChange?.("main");
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
    handleBackToMain();
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
    onModeChange?.("browseRides");
  };

  const handleOpenHelp = (booking: any) => {
    setSelectedBookingForHelp(booking);
    setShowHelpDialog(true);
  };

  const handleSubmitHelp = () => {
    if (!issueType || !issueDescription.trim()) {
      toast.error("Please select an issue type and provide a description");
      return;
    }
    
    toast.success("Help request submitted!", {
      description: "Our support team will review your issue and contact you shortly."
    });
    
    setShowHelpDialog(false);
    setSelectedBookingForHelp(null);
    setIssueType("");
    setIssueDescription("");
  };

  const handleOpenDetails = (booking: any) => {
    setSelectedBookingForDetails(booking);
    setShowDetailsDialog(true);
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
        onBack={() => setShowPayment(false)}
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
    const mockRides = getMockRides();
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
          onClick={() => {
            setShowTimeSlots(true);
            onModeChange?.("browseRides");
          }}
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
                    <Button size="sm" variant="outline" onClick={() => handleOpenDetails(booking)}>
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleOpenHelp(booking)}
                    >
                      <HelpCircle className="w-3 h-3 mr-1" />
                      Help
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

      {/* Help/Dispute Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Let us know if you're experiencing any problems with your ride.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBookingForHelp && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p><strong>Ride:</strong> {selectedBookingForHelp.destination}</p>
                <p><strong>Driver:</strong> {selectedBookingForHelp.driverName}</p>
                <p><strong>Date:</strong> {selectedBookingForHelp.date} at {selectedBookingForHelp.departureTime}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label>Issue Type</Label>
              <RadioGroup value={issueType} onValueChange={setIssueType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver-late" id="driver-late" />
                  <Label htmlFor="driver-late" className="font-normal">Driver is late</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver-noshow" id="driver-noshow" />
                  <Label htmlFor="driver-noshow" className="font-normal">Driver didn't show up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="safety" id="safety" />
                  <Label htmlFor="safety" className="font-normal">Safety concern</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="route" id="route" />
                  <Label htmlFor="route" className="font-normal">Wrong route/location</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="payment" id="payment" />
                  <Label htmlFor="payment" className="font-normal">Payment issue</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other" className="font-normal">Other</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please describe the issue in detail..."
                value={issueDescription}
                onChange={(e) => setIssueDescription(e.target.value)}
                rows={4}
                className="bg-input-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHelpDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitHelp}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              View the details of your ride.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBookingForDetails && (
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-medium">{selectedBookingForDetails.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-medium">{selectedBookingForDetails.driverName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{selectedBookingForDetails.driverRating} ★</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{selectedBookingForDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departure Time:</span>
                    <span className="font-medium">{selectedBookingForDetails.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Time:</span>
                    <span className="font-medium">{selectedBookingForDetails.pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Location:</span>
                    <span className="font-medium">{selectedBookingForDetails.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quadrant:</span>
                    <span className="font-medium">{selectedBookingForDetails.quadrant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Car:</span>
                    <span className="font-medium">{selectedBookingForDetails.car} ({selectedBookingForDetails.color})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat Number:</span>
                    <span className="font-medium">{selectedBookingForDetails.seatNumber}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${selectedBookingForDetails.price}.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}