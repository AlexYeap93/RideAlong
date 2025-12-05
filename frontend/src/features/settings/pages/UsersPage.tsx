import { useReducer, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Star, MapPin, Clock, HelpCircle, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { TimeSlotSelection } from "../../ride/components/TimeSlotSelection";
import { RideCard } from "../../ride/components/RideCard";
import { SeatSelection } from "../../ride/components/SeatSelection";
import { PaymentPage } from "../../payments/pages/PaymentPage";
import { BookingConfirmation } from "../../ride/components/BookingConfirmation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { toast } from "sonner";
import {  transformRideData, transformBookingData } from "../../../services/api";
import { ridesAPI } from "../../../services/RideServices";
import { bookingsAPI } from "../../../services/BookingServices";
import { paymentsAPI } from "../../../services/PaymentServices";
import { issuesAPI } from "../../../services/IssueServices";
import { ratingsAPI } from "../../../services/Ratingservices";
import { useAuth } from "../../../contexts/AuthContext";
import type { UsersPageProps, UsersPageState } from "../../../serviceInterface";

type UsersPageAction =
  | { type: 'SET_SHOW_TIME_SLOTS'; payload: boolean }
  | { type: 'SET_SELECTED_TIME_SLOT'; payload: string }
  | { type: 'SET_SHOW_RIDES'; payload: boolean }
  | { type: 'SET_SELECTED_DRIVER'; payload: any }
  | { type: 'SET_SHOW_SEAT_SELECTION'; payload: boolean }
  | { type: 'SET_SHOW_PAYMENT'; payload: boolean }
  | { type: 'SET_SHOW_CONFIRMATION'; payload: boolean }
  | { type: 'SET_SELECTED_SEAT'; payload: number | null }
  | { type: 'SET_BOOKING_ID'; payload: string }
  | { type: 'SET_SHOW_HELP_DIALOG'; payload: boolean }
  | { type: 'SET_SELECTED_BOOKING_FOR_HELP'; payload: any }
  | { type: 'SET_ISSUE_TYPE'; payload: string }
  | { type: 'SET_ISSUE_DESCRIPTION'; payload: string }
  | { type: 'SET_SHOW_DETAILS_DIALOG'; payload: boolean }
  | { type: 'SET_SELECTED_BOOKING_FOR_DETAILS'; payload: any }
  | { type: 'SET_ACTIVE_BOOKINGS'; payload: any[] }
  | { type: 'SET_COMPLETED_BOOKINGS'; payload: any[] }
  | { type: 'SET_RIDES'; payload: any[] }
  | { type: 'SET_IS_LOADING_BOOKINGS'; payload: boolean }
  | { type: 'SET_IS_LOADING_RIDES'; payload: boolean }
  | { type: 'SET_SHOW_RATING_DIALOG'; payload: boolean }
  | { type: 'SET_SELECTED_BOOKING_FOR_RATING'; payload: any }
  | { type: 'SET_RATING'; payload: number }
  | { type: 'SET_RATING_COMMENT'; payload: string }
  | { type: 'SET_IS_SUBMITTING_RATING'; payload: boolean }
  | { type: 'SET_IS_RESPONDING_TO_AMOUNT'; payload: {[key: string]: boolean} }
  | { type: 'RESET_BOOKING_FLOW' }
  | { type: 'RESET_ISSUE_FORM' }
  | { type: 'RESET_RATING_FORM' };

function usersPageReducer(state: UsersPageState, action: UsersPageAction): UsersPageState {
  switch (action.type) {
    case 'SET_SHOW_TIME_SLOTS':
      return { ...state, showTimeSlots: action.payload };
    case 'SET_SELECTED_TIME_SLOT':
      return { ...state, selectedTimeSlot: action.payload };
    case 'SET_SHOW_RIDES':
      return { ...state, showRides: action.payload };
    case 'SET_SELECTED_DRIVER':
      return { ...state, selectedDriver: action.payload };
    case 'SET_SHOW_SEAT_SELECTION':
      return { ...state, showSeatSelection: action.payload };
    case 'SET_SHOW_PAYMENT':
      return { ...state, showPayment: action.payload };
    case 'SET_SHOW_CONFIRMATION':
      return { ...state, showConfirmation: action.payload };
    case 'SET_SELECTED_SEAT':
      return { ...state, selectedSeat: action.payload };
    case 'SET_BOOKING_ID':
      return { ...state, bookingId: action.payload };
    case 'SET_SHOW_HELP_DIALOG':
      return { ...state, showHelpDialog: action.payload };
    case 'SET_SELECTED_BOOKING_FOR_HELP':
      return { ...state, selectedBookingForHelp: action.payload };
    case 'SET_ISSUE_TYPE':
      return { ...state, issueType: action.payload };
    case 'SET_ISSUE_DESCRIPTION':
      return { ...state, issueDescription: action.payload };
    case 'SET_SHOW_DETAILS_DIALOG':
      return { ...state, showDetailsDialog: action.payload };
    case 'SET_SELECTED_BOOKING_FOR_DETAILS':
      return { ...state, selectedBookingForDetails: action.payload };
    case 'SET_ACTIVE_BOOKINGS':
      return { ...state, activeBookings: action.payload };
    case 'SET_COMPLETED_BOOKINGS':
      return { ...state, completedBookings: action.payload };
    case 'SET_RIDES':
      return { ...state, rides: action.payload };
    case 'SET_IS_LOADING_BOOKINGS':
      return { ...state, isLoadingBookings: action.payload };
    case 'SET_IS_LOADING_RIDES':
      return { ...state, isLoadingRides: action.payload };
    case 'SET_SHOW_RATING_DIALOG':
      return { ...state, showRatingDialog: action.payload };
    case 'SET_SELECTED_BOOKING_FOR_RATING':
      return { ...state, selectedBookingForRating: action.payload };
    case 'SET_RATING':
      return { ...state, rating: action.payload };
    case 'SET_RATING_COMMENT':
      return { ...state, ratingComment: action.payload };
    case 'SET_IS_SUBMITTING_RATING':
      return { ...state, isSubmittingRating: action.payload };
    case 'SET_IS_RESPONDING_TO_AMOUNT':
      return { ...state, isRespondingToAmount: action.payload };
    case 'RESET_BOOKING_FLOW':
      return {
        ...state,
        showTimeSlots: false,
        showRides: false,
        showSeatSelection: false,
        showPayment: false,
        showConfirmation: false,
        selectedTimeSlot: "",
        selectedDriver: null,
        selectedSeat: null,
        bookingId: "",
      };
    case 'RESET_ISSUE_FORM':
      return {
        ...state,
        issueType: "",
        issueDescription: "",
        showHelpDialog: false,
        selectedBookingForHelp: null,
      };
    case 'RESET_RATING_FORM':
      return {
        ...state,
        rating: 5,
        ratingComment: "",
        showRatingDialog: false,
        selectedBookingForRating: null,
      };
    default:
      return state;
  }
}

export function UsersPage({ initialMode = "main", onModeChange, refreshTrigger, onNavigateToHome }: UsersPageProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(usersPageReducer, {
    showTimeSlots: initialMode === "browseRides",
    selectedTimeSlot: "",
    showRides: false,
    selectedDriver: null,
    showSeatSelection: false,
    showPayment: false,
    showConfirmation: false,
    selectedSeat: null,
    bookingId: "",
    showHelpDialog: false,
    selectedBookingForHelp: null,
    issueType: "",
    issueDescription: "",
    showDetailsDialog: false,
    selectedBookingForDetails: null,
    activeBookings: [],
    completedBookings: [],
    rides: [],
    isLoadingBookings: false,
    isLoadingRides: false,
    showRatingDialog: false,
    selectedBookingForRating: null,
    rating: 5,
    ratingComment: "",
    isSubmittingRating: false,
    isRespondingToAmount: {},
  });

  // Sync with initialMode changes
  useEffect(() => {
    if (initialMode === "browseRides") {
      dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: true });
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
    
    dispatch({ type: 'SET_IS_LOADING_BOOKINGS', payload: true });
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
      
      dispatch({ type: 'SET_ACTIVE_BOOKINGS', payload: confirmed });
      dispatch({ type: 'SET_COMPLETED_BOOKINGS', payload: completed });
    } catch (error: any) {
      toast.error("Failed to load bookings", {
        description: error.message || "Please try again.",
      });
    } finally {
      dispatch({ type: 'SET_IS_LOADING_BOOKINGS', payload: false });
    }
  };

  const handleTimeSlotSelect = async (timeSlot: string) => {
    dispatch({ type: 'SET_SELECTED_TIME_SLOT', payload: timeSlot });
    dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: false });
    dispatch({ type: 'SET_IS_LOADING_RIDES', payload: true });
    dispatch({ type: 'SET_SHOW_RIDES', payload: true });

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

      dispatch({ type: 'SET_RIDES', payload: filteredRides });
    } catch (error: any) {
      toast.error("Failed to load rides", {
        description: error.message || "Please try again.",
      });
      dispatch({ type: 'SET_RIDES', payload: [] });
    } finally {
      dispatch({ type: 'SET_IS_LOADING_RIDES', payload: false });
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
    dispatch({ type: 'SET_SHOW_RIDES', payload: false });
    dispatch({ type: 'SET_SHOW_SEAT_SELECTION', payload: false });
    dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: true });
    dispatch({ type: 'SET_SELECTED_DRIVER', payload: null });
  };

  const handleBackToRides = () => {
    dispatch({ type: 'SET_SHOW_SEAT_SELECTION', payload: false });
    dispatch({ type: 'SET_SELECTED_DRIVER', payload: null });
  };

  const handleBackToMain = () => {
    dispatch({ type: 'RESET_BOOKING_FLOW' });
    onModeChange?.("main");
  };

  const handleDriverSelect = (driver: any) => {
    dispatch({ type: 'SET_SELECTED_DRIVER', payload: driver });
    dispatch({ type: 'SET_SHOW_SEAT_SELECTION', payload: true });
    dispatch({ type: 'SET_SHOW_RIDES', payload: false });
  };

  const handleSeatConfirm = (seatNumber: number) => {
    dispatch({ type: 'SET_SELECTED_SEAT', payload: seatNumber });
    dispatch({ type: 'SET_SHOW_SEAT_SELECTION', payload: false });
    dispatch({ type: 'SET_SHOW_PAYMENT', payload: true });
  };

  const handlePaymentConfirm = async (
    paymentMethod: string,
    pickupAddress: string,
    pickupCity: string,
    pickupProvince: string,
    pickupPostalCode: string
  ) => {
    if (!user || !state.selectedDriver || !state.selectedSeat) {
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
      // Create booking with complete pickup address combined into one string
      const fullPickupAddress = `${pickupAddress}, ${pickupCity}, ${pickupProvince} ${pickupPostalCode}`;
      const bookingResponse = await bookingsAPI.createBooking({
        rideId: state.selectedDriver.rideId || state.selectedDriver.id,
        numberOfSeats: 1,
        seatNumber: state.selectedSeat,
        pickupLocation: fullPickupAddress,
      });

      const booking = bookingResponse.data;
      dispatch({ type: 'SET_BOOKING_ID', payload: booking.id });

      await paymentsAPI.createPayment({
        bookingId: booking.id,
        amount: state.selectedDriver.price * state.selectedSeat,
        paymentMethod: paymentMethod,
        paymentStatus: 'completed',
      });

      dispatch({ type: 'SET_SHOW_PAYMENT', payload: false });
      dispatch({ type: 'SET_SHOW_CONFIRMATION', payload: true });
      
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
    dispatch({ type: 'SET_SHOW_CONFIRMATION', payload: false });
    dispatch({ type: 'SET_SHOW_PAYMENT', payload: false });
    dispatch({ type: 'SET_SHOW_SEAT_SELECTION', payload: false });
    dispatch({ type: 'SET_SHOW_RIDES', payload: false });
    dispatch({ type: 'SET_SELECTED_DRIVER', payload: null });
    dispatch({ type: 'SET_SELECTED_SEAT', payload: null });
    dispatch({ type: 'SET_BOOKING_ID', payload: "" });
    dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: true });
    onModeChange?.("browseRides");
  };

  const handleOpenHelp = (booking: any) => {
    dispatch({ type: 'SET_SELECTED_BOOKING_FOR_HELP', payload: booking });
    dispatch({ type: 'SET_SHOW_HELP_DIALOG', payload: true });
  };

  const handleSubmitHelp = async () => {
    if (!state.issueType || !state.issueDescription.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      // Determine priority based on issue type
      let priority = 'medium';
      if (state.issueType === 'safety') {
        priority = 'critical';
      } else if (state.issueType === 'driver-noshow' || state.issueType === 'payment') {
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
        bookingId: state.selectedBookingForHelp?.bookingId || state.selectedBookingForHelp?.id,
        issueType: state.issueType,
        subject: issueTypeLabels[state.issueType] || 'Issue reported',
        description: state.issueDescription.trim(),
        priority: priority,
      });

      toast.success("Issue reported successfully", {
        description: "An admin will review your report shortly.",
      });

      // Reset form
      dispatch({ type: 'RESET_ISSUE_FORM' });
    } catch (error: any) {
      toast.error("Failed to submit issue", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleOpenDetails = (booking: any) => {
    dispatch({ type: 'SET_SELECTED_BOOKING_FOR_DETAILS', payload: booking });
    dispatch({ type: 'SET_SHOW_DETAILS_DIALOG', payload: true });
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
  if (state.showConfirmation && state.selectedDriver && state.selectedSeat) {
    return (
      <BookingConfirmation
        bookingDetails={{
          bookingId: state.bookingId,
          driverName: state.selectedDriver.driverName,
          rating: state.selectedDriver.rating,
          departureTime: state.selectedDriver.departureTime,
          destination: state.selectedDriver.destination,
          quadrant: state.selectedDriver.quadrant,
          seatNumber: state.selectedSeat,
          price: state.selectedDriver.price,
          car: state.selectedDriver.car,
          carType: state.selectedDriver.carType,
          bookingDate: getCurrentDate()
        }}
        onViewBookings={handleViewBookings}
        onReturnHome={handleBookAnotherRide}
      />
    );
  }

  // If showing payment
  if (state.showPayment && state.selectedDriver && state.selectedSeat) {
    return (
      <PaymentPage
        bookingDetails={{
          driverName: state.selectedDriver.driverName,
          rating: state.selectedDriver.rating,
          departureTime: state.selectedDriver.departureTime,
          destination: state.selectedDriver.destination,
          quadrant: state.selectedDriver.quadrant,
          seatNumber: state.selectedSeat,
          price: state.selectedDriver.price,
          car: state.selectedDriver.car,
          carType: state.selectedDriver.carType,
          bookingDate: getCurrentDate(),
          rideId: state.selectedDriver.rideId || state.selectedDriver.id,
        }}
        onBack={() => dispatch({ type: 'SET_SHOW_PAYMENT', payload: false })}
        onConfirm={handlePaymentConfirm}
      />
    );
  }

  // If showing seat selection
  if (state.showSeatSelection && state.selectedDriver) {
    return (
      <SeatSelection 
        driver={{
          name: state.selectedDriver.driverName,
          rating: state.selectedDriver.rating,
          car: state.selectedDriver.car,
          carType: state.selectedDriver.carType,
          price: state.selectedDriver.price,
          departureTime: state.selectedDriver.departureTime,
          destination: state.selectedDriver.destination,
          quadrant: state.selectedDriver.quadrant,
          rideId: state.selectedDriver.rideId || state.selectedDriver.id,
          driverId: state.selectedDriver.driverId || state.selectedDriver.driver_user_id,
        }}
        onBack={handleBackToRides}
        onConfirm={handleSeatConfirm}
      />
    );
  }

  // If showing time slots
  if (state.showTimeSlots) {
    return (
      <TimeSlotSelection 
        onTimeSlotSelect={handleTimeSlotSelect}
        onBack={handleBackToMain}
      />
    );
  }

  // If showing available rides
  if (state.showRides) {
    return (
      <div className="pb-20 bg-background min-h-screen">
        <div className="p-4 bg-white border-b flex items-center justify-between">
          <div>
            <h2 className="font-medium">Rides to University of Calgary</h2>
            <p className="text-sm text-muted-foreground">
              {state.selectedTimeSlot && `Departing at ${state.selectedTimeSlot} • `}
              {state.isLoadingRides ? "Loading..." : `${state.rides.length} rides available`}
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
        
        {state.isLoadingRides ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading rides...</p>
          </div>
        ) : state.rides.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No rides available for this time slot.</p>
          </div>
        ) : (
          <div className="space-y-0">
            {state.rides.map((ride) => (
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
              dispatch({ type: 'SET_SHOW_TIME_SLOTS', payload: true });
              onModeChange?.("browseRides");
            }
          }}
        >
          Browse Rides to University of Calgary
        </Button>
      </div>

      {/* Active Bookings Section */}
      {state.isLoadingBookings ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading bookings...</p>
        </div>
      ) : state.activeBookings.length > 0 ? (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Your Active Rides Today</h2>
          <div className="space-y-3">
            {state.activeBookings.map((booking) => (
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
                              dispatch({ type: 'SET_IS_RESPONDING_TO_AMOUNT', payload: { ...state.isRespondingToAmount, [booking.id]: true } });
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
                                dispatch({ type: 'SET_IS_RESPONDING_TO_AMOUNT', payload: { ...state.isRespondingToAmount, [booking.id]: false } });
                              }
                            }}
                            disabled={state.isRespondingToAmount[booking.id]}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="hidden sm:inline">Accept </span>$ {parseFloat(booking.additional_amount_requested).toFixed(2)}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1 text-xs sm:text-sm"
                            onClick={async () => {
                              dispatch({ type: 'SET_IS_RESPONDING_TO_AMOUNT', payload: { ...state.isRespondingToAmount, [booking.id]: true } });
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
                                dispatch({ type: 'SET_IS_RESPONDING_TO_AMOUNT', payload: { ...state.isRespondingToAmount, [booking.id]: false } });
                              }
                            }}
                            disabled={state.isRespondingToAmount[booking.id]}
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
      {state.completedBookings.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Completed Rides</h2>
          <div className="space-y-3">
            {state.completedBookings.map((booking) => (
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
                        dispatch({ type: 'SET_SELECTED_BOOKING_FOR_RATING', payload: booking });
                        dispatch({ type: 'SET_RATING', payload: 5 });
                        dispatch({ type: 'SET_RATING_COMMENT', payload: "" });
                        dispatch({ type: 'SET_SHOW_RATING_DIALOG', payload: true });
                      } catch (error: any) {
                        dispatch({ type: 'SET_SELECTED_BOOKING_FOR_RATING', payload: booking });
                        dispatch({ type: 'SET_RATING', payload: 5 });
                        dispatch({ type: 'SET_RATING_COMMENT', payload: "" });
                        dispatch({ type: 'SET_SHOW_RATING_DIALOG', payload: true });
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
      <Dialog open={state.showRatingDialog} onOpenChange={(open: boolean) => dispatch({ type: 'SET_SHOW_RATING_DIALOG', payload: open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Your Driver</DialogTitle>
            <DialogDescription>
              How was your ride with {state.selectedBookingForRating?.driverName}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {state.selectedBookingForRating && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p><strong>Ride:</strong> {state.selectedBookingForRating.destination}</p>
                <p><strong>Date:</strong> {state.selectedBookingForRating.date} at {state.selectedBookingForRating.departureTime}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => dispatch({ type: 'SET_RATING', payload: star })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= state.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{state.rating} / 5</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comment (Optional)</Label>
              <Textarea
                id="comment"
                placeholder="Share your experience..."
                value={state.ratingComment}
                onChange={(e) => dispatch({ type: 'SET_RATING_COMMENT', payload: e.target.value })}
                rows={4}
                className="bg-input-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch({ type: 'SET_SHOW_RATING_DIALOG', payload: false })}>
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                if (!state.selectedBookingForRating) return;
                
                dispatch({ type: 'SET_IS_SUBMITTING_RATING', payload: true });
                try {
                  await ratingsAPI.createRating({
                    bookingId: state.selectedBookingForRating.id,
                    rating: state.rating,
                    comment: state.ratingComment.trim() || undefined,
                  });
                  
                  toast.success("Rating submitted successfully!", {
                    description: "Thank you for your feedback.",
                  });
                  
                  dispatch({ type: 'RESET_RATING_FORM' });
                  await fetchBookings(); // Refresh to update UI
                } catch (error: any) {
                  toast.error("Failed to submit rating", {
                    description: error.message || "Please try again.",
                  });
                } finally {
                  dispatch({ type: 'SET_IS_SUBMITTING_RATING', payload: false });
                }
              }}
              disabled={state.isSubmittingRating}
            >
              {state.isSubmittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Help/Dispute Dialog */}
      <Dialog open={state.showHelpDialog} onOpenChange={(open: boolean) => dispatch({ type: 'SET_SHOW_HELP_DIALOG', payload: open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Let us know if you're experiencing any problems with your ride.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {state.selectedBookingForHelp && (
              <div className="p-3 bg-muted rounded-md text-sm">
                <p><strong>Ride:</strong> {state.selectedBookingForHelp.destination}</p>
                <p><strong>Driver:</strong> {state.selectedBookingForHelp.driverName}</p>
                <p><strong>Date:</strong> {state.selectedBookingForHelp.date} at {state.selectedBookingForHelp.departureTime}</p>
              </div>
            )}

            <div className="space-y-3">
              <Label>Issue Type</Label>
              <RadioGroup value={state.issueType} onValueChange={(value: string) => dispatch({ type: 'SET_ISSUE_TYPE', payload: value })}>
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
                value={state.issueDescription}
                onChange={(e) => dispatch({ type: 'SET_ISSUE_DESCRIPTION', payload: e.target.value })}
                rows={4}
                className="bg-input-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => dispatch({ type: 'SET_SHOW_HELP_DIALOG', payload: false })}>
              Cancel
            </Button>
            <Button onClick={handleSubmitHelp}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={state.showDetailsDialog} onOpenChange={(open: boolean) => dispatch({ type: 'SET_SHOW_DETAILS_DIALOG', payload: open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ride Details</DialogTitle>
            <DialogDescription>
              View the details of your ride.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {state.selectedBookingForDetails && (
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Driver:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.driverName}</span>
                  </div>
                  {state.selectedBookingForDetails.driverPhone && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Driver Phone:</span>
                      <span className="font-medium">{state.selectedBookingForDetails.driverPhone}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.driverRating} ★</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Departure Time:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.departureTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Time:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.pickupTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pickup Location:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.pickupLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quadrant:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.quadrant}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Car:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.car} ({state.selectedBookingForDetails.color})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seat Number:</span>
                    <span className="font-medium">{state.selectedBookingForDetails.seatNumber}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium">${state.selectedBookingForDetails.price}.00</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => dispatch({ type: 'SET_SHOW_DETAILS_DIALOG', payload: false })}>
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}