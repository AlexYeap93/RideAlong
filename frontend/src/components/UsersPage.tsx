import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, MapPin, Clock, HelpCircle, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { TimeSlotSelection } from "../features/shared/ui/TimeSlotSelection";
import { RideCard } from "../features/ride/components/RideCard";
import { SeatSelection } from "../features/shared/ui/SeatSelection";
import { PaymentPage } from "../features/payments/pages/PaymentPage";
import { BookingConfirmation } from "../features/ride/components/BookingConfirmation";
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
import { toast } from "sonner";
import { bookingsAPI, ridesAPI, paymentsAPI, issuesAPI, ratingsAPI, transformRideData, transformBookingData } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface UsersPageProps {
  initialMode?: "main" | "browseRides";
  onModeChange?: (mode: "main" | "browseRides") => void;
  refreshTrigger?: number; // Add refresh trigger prop
  onNavigateToHome?: () => void; // Callback to navigate to home tab
}

export function UsersPage({ initialMode = "main", onModeChange, refreshTrigger, onNavigateToHome }: UsersPageProps) {
  const { user } = useAuth();
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
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [rides, setRides] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingRides, setIsLoadingRides] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [selectedBookingForRating, setSelectedBookingForRating] = useState<any>(null);
  const [rating, setRating] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isRespondingToAmount, setIsRespondingToAmount] = useState<{[key: string]: boolean}>({});

  // Sync with initialMode changes
  useEffect(() => {
    if (initialMode === "browseRides") {
      setShowTimeSlots(true);
    }
  }, [initialMode]);

  // Fetch user bookings on mount and when mode changes to main
  useEffect(() => {
    if (user?.id && initialMode === "main") {
      fetchBookings();
    }
  }, [user?.id, initialMode, refreshTrigger]);

  // Refresh bookings when page becomes visible (user navigates to Users tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && initialMode === "main") {
        fetchBookings();
      }
    };

    // Refresh when tab becomes visible
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id, initialMode]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    
    setIsLoadingBookings(true);
    try {
      const response = await bookingsAPI.getBookingsByUser(user.id);
      const transformedBookings = response.data.map(transformBookingData);
      
      // Get today's date in local timezone (YYYY-MM-DD format)
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Filter for today's bookings using ride_date
      const todayBookings = transformedBookings.filter((booking: any) => {
        // Use ride_date from backend (raw date string)
        const bookingDate = booking.ride_date;
        if (!bookingDate) return false;
        
        // Extract date part (YYYY-MM-DD) from the date string
        const dateStr = typeof bookingDate === 'string' 
          ? bookingDate.split('T')[0].split(' ')[0] // Handle both "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS" formats
          : null;
        
        return dateStr === todayStr;
      });
      
      // Separate confirmed and completed bookings
      // Active bookings are confirmed bookings (not cancelled, not completed)
      const confirmed = todayBookings.filter((b: any) => b.status === 'confirmed');
      const completed = todayBookings.filter((b: any) => b.status === 'completed');
      
      setActiveBookings(confirmed);
      setCompletedBookings(completed);
    } catch (error: any) {
      toast.error("Failed to load bookings", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleTimeSlotSelect = async (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowTimeSlots(false);
    setIsLoadingRides(true);
    setShowRides(true);

    try {
      const time24 = convertTo24Hour(timeSlot);
      const dateStr = new Date().toISOString().split('T')[0];
      
      const response = await ridesAPI.getAvailableRides({
        destination: "University of Calgary",
        date: dateStr,
      });

      const transformedRides = response.data.map(transformRideData);
      
      // Filter by time slot - compare with backend time format
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

  const convertTo24Hour = (time12h: string): string => {
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') hours = '00';
    if (modifier === 'PM') hours = String(parseInt(hours) + 12);
    return `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`;
  };

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

  const handlePaymentConfirm = async (paymentMethod: string, pickupAddress: string) => {
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
      const bookingResponse = await bookingsAPI.createBooking({
        rideId: selectedDriver.rideId || selectedDriver.id,
        numberOfSeats: 1,
        seatNumber: selectedSeat,
        pickupLocation: pickupAddress,
      });

      const booking = bookingResponse.data;
      setBookingId(booking.id);

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
      
      // Refresh bookings
      await fetchBookings();
    } catch (error: any) {
      toast.error("Failed to create booking", {
        description: error.message || "Please try again.",
      });
    }
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

  const handleSubmitHelp = async () => {
    if (!issueType || !issueDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Determine priority based on issue type
      let priority = 'medium';
      if (issueType === 'safety') {
        priority = 'critical';
      } else if (issueType === 'driver-noshow' || issueType === 'payment') {
        priority = 'high';
      }

      // Get subject from issue type
      const issueTypeLabels: { [key: string]: string } = {
        'driver-late': 'Driver is late',
        'driver-noshow': 'Driver didn\'t show up',
        'safety': 'Safety concern',
        'route': 'Wrong route/location',
        'payment': 'Payment issue',
        'other': 'Other issue'
      };

      await issuesAPI.createIssue({
        bookingId: selectedBookingForHelp?.bookingId || selectedBookingForHelp?.id,
        issueType: issueType,
        subject: issueTypeLabels[issueType] || 'Issue reported',
        description: issueDescription.trim(),
        priority: priority,
      });

      toast.success("Issue reported successfully", {
        description: "An admin will review your report shortly.",
      });

      // Reset form
      setIssueType("");
      setIssueDescription("");
      setShowHelpDialog(false);
      setSelectedBookingForHelp(null);
    } catch (error: any) {
      toast.error("Failed to submit issue", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleOpenDetails = (booking: any) => {
    setSelectedBookingForDetails(booking);
    setShowDetailsDialog(true);
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
          quadrant: selectedDriver.quadrant,
          rideId: selectedDriver.rideId || selectedDriver.id,
          driverId: selectedDriver.driverId || selectedDriver.driver_user_id,
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
    );
  }

  // Main view with active bookings and browse button
  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-medium mb-1">For Riders</h1>
        <p className="text-sm text-primary-foreground/80">Your rides to University of Calgary</p>
      </div>

      <div className="p-4">
        <Button 
          className="w-full"
          onClick={() => {
            // Navigate to home tab instead of showing time slots in Riders tab
            if (onNavigateToHome) {
              onNavigateToHome();
            } else {
              // Fallback to old behavior if callback not provided
              setShowTimeSlots(true);
              onModeChange?.("browseRides");
            }
          }}
        >
          Browse Rides to University of Calgary
        </Button>
      </div>

      {/* Active Bookings Section */}
      {isLoadingBookings ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      ) : activeBookings.length > 0 ? (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Your Active Rides Today</h2>
          <div className="space-y-3">
            {activeBookings.map((booking) => (
              <Card key={booking.id} className="p-4 border-2 border-green-500">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {booking.driverName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-green-600 hover:bg-green-700 text-xs">
                        Confirmed - Seat {booking.seatNumber}
                      </Badge>
                    </div>

                    <h3 className="font-medium mb-1">{booking.driverName}</h3>
                    
                    {booking.driverRating > 0 && (
                      <div className="flex items-center gap-1 mb-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{booking.driverRating.toFixed(1)}</span>
                      </div>
                    )}
                    
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

                    {/* Additional Amount Request */}
                    {booking.additional_amount_requested && booking.additional_amount_status === 'pending' && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-start gap-2 mb-2">
                          <DollarSign className="w-4 h-4 text-yellow-700 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-900">
                              Additional Amount Request
                            </p>
                            <p className="text-sm text-yellow-800">
                              Driver is requesting an additional ${parseFloat(booking.additional_amount_requested).toFixed(2)} because your pickup location is far from their location.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
                            onClick={async () => {
                              setIsRespondingToAmount(prev => ({ ...prev, [booking.id]: true }));
                              try {
                                await bookingsAPI.respondToAdditionalAmount(booking.id, 'accepted');
                                toast.success("Additional amount accepted", {
                                  description: `You will be charged an additional $ ${parseFloat(booking.additional_amount_requested).toFixed(2)}.`,
                                });
                                await fetchBookings();
                              } catch (error: any) {
                                toast.error("Failed to accept request", {
                                  description: error.message || "Please try again.",
                                });
                              } finally {
                                setIsRespondingToAmount(prev => ({ ...prev, [booking.id]: false }));
                              }
                            }}
                            disabled={isRespondingToAmount[booking.id]}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Accept </span>$ {parseFloat(booking.additional_amount_requested).toFixed(2)}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 text-xs sm:text-sm"
                            onClick={async () => {
                              setIsRespondingToAmount(prev => ({ ...prev, [booking.id]: true }));
                              try {
                                await bookingsAPI.respondToAdditionalAmount(booking.id, 'declined');
                                toast.info("Request declined", {
                                  description: "Your booking has been cancelled and you will receive a refund.",
                                });
                                await fetchBookings();
                              } catch (error: any) {
                                toast.error("Failed to decline request", {
                                  description: error.message || "Please try again.",
                                });
                              } finally {
                                setIsRespondingToAmount(prev => ({ ...prev, [booking.id]: false }));
                              }
                            }}
                            disabled={isRespondingToAmount[booking.id]}
                          >
                            <XCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Decline
                          </Button>
                        </div>
                      </div>
                    )}

                    {booking.additional_amount_requested && booking.additional_amount_status === 'accepted' && (
                      <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center gap-2 text-sm text-green-800">
                          <CheckCircle className="w-4 h-4" />
                          <span>Additional $ {parseFloat(booking.additional_amount_requested).toFixed(2)} accepted</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Buttons at bottom for mobile */}
                <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDetails(booking)} className="text-xs flex-1">
                    Details
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleOpenHelp(booking)}
                    className="text-xs flex-1"
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Help
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={async () => {
                      if (confirm('Are you sure you want to cancel this booking? Your seat will be freed up for other users.')) {
                        try {
                          await bookingsAPI.cancelBooking(booking.id);
                          toast.success("Booking cancelled successfully", {
                            description: "Your seat has been freed up and you will receive a refund.",
                          });
                          await fetchBookings();
                        } catch (error: any) {
                          toast.error("Failed to cancel booking", {
                            description: error.message || "Please try again.",
                          });
                        }
                      }
                    }}
                    className="text-xs flex-1 bg-red-50 border-red-600 text-red-700 hover:bg-red-100 hover:text-red-800"
                  >
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mb-6">
          <p className="text-muted-foreground text-center py-8">No active bookings for today.</p>
        </div>
      )}

      {/* Completed Bookings Section */}
      {completedBookings.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Completed Rides</h2>
          <div className="space-y-3">
            {completedBookings.map((booking) => (
              <Card key={booking.id} className="p-4 border-2 border-blue-500">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {booking.driverName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Complete - Seat {booking.seatNumber}
                      </Badge>
                    </div>

                    <h3 className="font-medium mb-1">{booking.driverName}</h3>
                    
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{booking.destination}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span>Completed on {booking.date} at {booking.departureTime}</span>
                    </div>
                  </div>
                </div>
                
                {/* Rate Driver and Help buttons at bottom for mobile */}
                <div className="pt-3 border-t space-y-2">
                  <Button 
                    size="sm" 
                    variant="default"
                    className="w-full text-xs sm:text-sm"
                    onClick={async () => {
                      // Check if already rated
                      try {
                        const ratingCheck = await ratingsAPI.getRatingByBooking(booking.id);
                        if (ratingCheck.data) {
                          toast.info("You have already rated this ride");
                          return;
                        }
                        setSelectedBookingForRating(booking);
                        setRating(5);
                        setRatingComment("");
                        setShowRatingDialog(true);
                      } catch (error: any) {
                        setSelectedBookingForRating(booking);
                        setRating(5);
                        setRatingComment("");
                        setShowRatingDialog(true);
                      }
                    }}
                  >
                    <Star className="w-3 h-3 mr-1" />
                    Rate Driver
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full text-xs sm:text-sm"
                    onClick={() => handleOpenHelp(booking)}
                  >
                    <HelpCircle className="w-3 h-3 mr-1" />
                    Help
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Driver</DialogTitle>
            <DialogDescription>
              How was your ride with {selectedBookingForRating?.driverName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedBookingForRating && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p><strong>Ride:</strong> {selectedBookingForRating.destination}</p>
                <p><strong>Date:</strong> {selectedBookingForRating.date} at {selectedBookingForRating.departureTime}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{rating} / 5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                rows={4}
                className="bg-input-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!selectedBookingForRating) return;
                
                setIsSubmittingRating(true);
                try {
                  await ratingsAPI.createRating({
                    bookingId: selectedBookingForRating.id,
                    rating: rating,
                    comment: ratingComment.trim() || undefined,
                  });
                  
                  toast.success("Rating submitted successfully!", {
                    description: "Thank you for your feedback.",
                  });
                  
                  setShowRatingDialog(false);
                  setSelectedBookingForRating(null);
                  setRating(5);
                  setRatingComment("");
                  await fetchBookings(); // Refresh to update UI
                } catch (error: any) {
                  toast.error("Failed to submit rating", {
                    description: error.message || "Please try again.",
                  });
                } finally {
                  setIsSubmittingRating(false);
                }
              }}
              disabled={isSubmittingRating}
            >
              {isSubmittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  {selectedBookingForDetails.driverPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver Phone:</span>
                      <span className="font-medium">{selectedBookingForDetails.driverPhone}</span>
                    </div>
                  )}
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