import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../../../contexts/AuthContext';
import { ridesAPI, driversAPI, bookingsAPI, paymentsAPI } from '../../../services/api';
import type { ActiveRide, CompletedRide } from '../../../types/api_interfaces';

// Utility functions
const formatTime = (time: string): string => {
  if (!time) return '12:00 PM';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes || '00'} ${ampm}`;
};

const formatDate = (rideDate: string): string => {
  if (!rideDate) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(rideDate);
  date.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    return 'Today';
  }
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function useDriverRides() {
  const { user } = useAuth();
  
  // Dialog states
  const [showListDialog, setShowListDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState<ActiveRide | null>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rideToComplete, setRideToComplete] = useState<ActiveRide | null>(null);
  
  // Data states
  const [activeRides, setActiveRides] = useState<ActiveRide[]>([]);
  const [completedRides, setCompletedRides] = useState<CompletedRide[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Driver info states
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isApprovedDriver, setIsApprovedDriver] = useState(false);
  const [isCheckingDriver, setIsCheckingDriver] = useState(true);
  const [hasDriverApplication, setHasDriverApplication] = useState(false);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  // Fetch rides for the driver
  const fetchRides = useCallback(async (driverId: string) => {
    setIsLoading(true);
    try {
      const response = await driversAPI.getDriverRides(driverId);
      // Filter for active and completed rides
      const active = response.data.filter((ride: any) => ride.status === 'active');
      const completed = response.data.filter((ride: any) => ride.status === 'completed');
      
      // Fetch bookings for each active ride
      const ridesWithPassengers = await Promise.all(
        active.map(async (ride: any) => {
          try {
            const bookingsResponse = await bookingsAPI.getBookingsByRide(ride.id);
            
            // Format ride time to 12-hour format for default pickup time
            const formatRideTime = (timeStr: string): string => {
              if (!timeStr) {
                // Fallback to ride time if timeStr is empty
                const rideTime = ride.ride_time || '12:00:00';
                const [hours, minutes] = rideTime.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                return `${hour12}:${minutes || '00'} ${ampm}`;
              }
              const [hours, minutes] = timeStr.split(':');
              const hour = parseInt(hours);
              const ampm = hour >= 12 ? 'PM' : 'AM';
              const hour12 = hour % 12 || 12;
              return `${hour12}:${minutes || '00'} ${ampm}`;
            };
            
            const defaultPickupTime = formatRideTime(ride.ride_time);
            
            const passengers = bookingsResponse.data.map((booking: any) => {
              // Format pickup time from database (24-hour) to 12-hour format
              // If no pickup_time is set, use the ride's departure time as default
              let pickupTime = defaultPickupTime;
              if (booking.pickup_time) {
                const [hours, minutes] = booking.pickup_time.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const hour12 = hour % 12 || 12;
                pickupTime = `${hour12}:${minutes || '00'} ${ampm}`;
              }
              
              return {
                id: booking.id,
                name: booking.user_name || 'Passenger',
                phone: booking.user_phone || null,
                rating: 4.5,
                pickupLocation: booking.pickup_location || 'Location',
                pickupTime: pickupTime,
                quadrant: 'DT',
                seatNumber: booking.seat_number || booking.number_of_seats || 1,
                additionalAmountRequested: booking.additional_amount_requested ? parseFloat(booking.additional_amount_requested) : null,
                additionalAmountStatus: booking.additional_amount_status || null,
              };
            });
            return {
              id: ride.id,
              destination: ride.destination,
              date: formatDate(ride.ride_date),
              rideDate: ride.ride_date, // Keep raw date for filtering
              time: formatTime(ride.ride_time),
              passengers,
            };
          } catch (error) {
            return {
              id: ride.id,
              destination: ride.destination,
              date: formatDate(ride.ride_date),
              rideDate: ride.ride_date, // Keep raw date for filtering
              time: formatTime(ride.ride_time),
              passengers: [],
            };
          }
        })
      );
      
      // Fetch bookings and earnings for each completed ride
      const completedRidesWithData = await Promise.all(
        completed.map(async (ride: any) => {
          try {
            const bookingsResponse = await bookingsAPI.getBookingsByRide(ride.id);
            const completedBookings = bookingsResponse.data.filter((b: any) => b.status === 'completed');
            
            // Calculate total earnings from payments
            let totalEarnings = 0;
            const earningsPromises = completedBookings.map(async (booking: any) => {
              try {
                const paymentResponse = await paymentsAPI.getPaymentsByBooking(booking.id);
                if (paymentResponse.data && paymentResponse.data.length > 0) {
                  const payment = paymentResponse.data[0];
                  if (payment.payment_status === 'completed') {
                    return parseFloat(payment.amount) || 0;
                  }
                }
                return 0;
              } catch (error) {
                return 0;
              }
            });
            
            const earnings = await Promise.all(earningsPromises);
            totalEarnings = earnings.reduce((sum, amount) => sum + amount, 0);
            
            return {
              id: ride.id,
              destination: ride.destination,
              date: formatDate(ride.ride_date),
              rideDate: ride.ride_date, // Keep raw date for filtering
              time: formatTime(ride.ride_time),
              numberOfRiders: completedBookings.length,
              totalEarnings: totalEarnings,
            };
          } catch (error) {
            return {
              id: ride.id,
              destination: ride.destination,
              date: formatDate(ride.ride_date),
              rideDate: ride.ride_date, // Keep raw date for filtering
              time: formatTime(ride.ride_time),
              numberOfRiders: 0,
              totalEarnings: 0,
            };
          }
        })
      );
      
      setActiveRides(ridesWithPassengers);
      setCompletedRides(completedRidesWithData);
      
      // Get driver's total earnings for total earnings box
      try {
        const driverProfile = await driversAPI.getMyDriverProfile();
        if (driverProfile.data && driverProfile.data.total_earnings) {
          setTotalEarnings(parseFloat(driverProfile.data.total_earnings) || 0);
        }
      } catch (error) {
        // Ignore error, keep default 0
      }
    } catch (error: any) {
      toast.error("Failed to load rides", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to fetch driver info
  const fetchDriverInfo = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      // Try to get driver ID from localStorage first (set during login)
      const storedDriverId = localStorage.getItem('driverId');
      if (storedDriverId) {
        // Still need to verify approval status
        try {
          const driverResponse = await driversAPI.getMyDriverProfile();
          if (driverResponse.data && driverResponse.data.id) {
            setDriverId(driverResponse.data.id);
            const wasApproved = driverResponse.data.is_approved === true;
            setHasDriverApplication(true);
            setIsApprovedDriver(wasApproved);
            localStorage.setItem('driverId', driverResponse.data.id);
            if (wasApproved) {
              fetchRides(driverResponse.data.id);
            }
            setIsCheckingDriver(false);
            return;
          }
        } catch (error) {
          // Fall through to normal flow
        }
      }

      // Try to get my driver profile
      try {
        const driverResponse = await driversAPI.getMyDriverProfile();
        if (driverResponse.data && driverResponse.data.id) {
          setDriverId(driverResponse.data.id);
          const wasApproved = driverResponse.data.is_approved === true;
          setHasDriverApplication(true);
          setIsApprovedDriver(wasApproved);
          localStorage.setItem('driverId', driverResponse.data.id);
          if (wasApproved) {
            fetchRides(driverResponse.data.id);
          }
        }
      } 
      catch (error: any) {
        // Driver profile doesn't exist yet or not approved
        if (error.message.includes('404') || error.message.includes('not found')) {
          // No driver record exists for this user yet
          setHasDriverApplication(false);
          setIsApprovedDriver(false);
        } else {
          console.error("Failed to fetch driver profile:", error);
          // On other errors, assume no application so UI doesn't show pending incorrectly
          setHasDriverApplication(false);
          setIsApprovedDriver(false);
        }
      } finally {
        setIsCheckingDriver(false);
      }
    } catch (error: any) {
      console.error("Failed to fetch driver info:", error);
    }
  }, [user?.id, fetchRides]);

  // Handles listing a ride for the driver
  const handleListRide = useCallback(async (data: { date: Date; time: string; destination: string }) => {
    // Admin can list rides - backend will handle driver profile creation
    if (!driverId && user?.role !== 'admin') {
      toast.error("Driver profile not found");
      return;
    }

    try {
      // Convert time to 24-hour format
      const [timePart, modifier] = data.time.split(' ');
      let [hours, minutes] = timePart.split(':');
      if (modifier === 'PM' && hours !== '12') {
        hours = String(parseInt(hours) + 12);
      }
      if (modifier === 'AM' && hours === '12') {
        hours = '00';
      }
      const time24 = `${hours}:${minutes || '00'}:00`;
      
      // Format date in local timezone (YYYY-MM-DD) to avoid timezone issues
      const year = data.date.getFullYear();
      const month = String(data.date.getMonth() + 1).padStart(2, '0');
      const day = String(data.date.getDate()).padStart(2, '0');
      const rideDateStr = `${year}-${month}-${day}`;
      // create a ride when driver list a ride
      await ridesAPI.createRide({
        destination: data.destination,
        rideDate: rideDateStr,
        rideTime: time24,
        price: 10, // Default price
      });

      toast.success("Ride listed successfully!", {
        description: `Ride to ${data.destination} on ${data.date.toLocaleDateString()} at ${data.time}.`
      });
      
      // Refresh rides
      if (driverId) {
        await fetchRides(driverId);
      }
    } catch (error: any) {
      toast.error("Failed to create ride", {
        description: error.message || "Please try again.",
      });
    }
  }, [driverId, user?.role, fetchRides]);

  // Handles viewing the details of a ride to update pickup times for passengers and extra amount requested
  const handleViewDetails = useCallback((ride: ActiveRide) => {
    setSelectedRide(ride);
    setShowDetailDialog(true);
  }, []);

  // Handles completing a ride
  const handleCompleteRideClick = useCallback((ride: ActiveRide) => {
    setRideToComplete(ride);
    setShowCompleteDialog(true);
  }, []);

  const handleConfirmComplete = useCallback(async () => {
    if (!rideToComplete) return;

    try {
      await ridesAPI.updateRide(String(rideToComplete.id), {
        status: 'completed',
      });

      toast.success("Ride completed successfully!", {
        description: "You can view this ride in your ride history."
      });
      setShowCompleteDialog(false);
      setRideToComplete(null);
      
      // Refresh rides
      if (driverId) {
        await fetchRides(driverId);
      }
    } catch (error: any) {
      toast.error("Failed to complete ride", {
        description: error.message || "Please try again.",
      });
    }
  }, [rideToComplete, driverId, fetchRides]);

  // Get driver ID on mount and when user changes
  useEffect(() => {
    fetchDriverInfo();
  }, [fetchDriverInfo]);

  // Refresh driver status periodically (every 5 seconds) to catch approval updates from admin
  useEffect(() => {
    if (!user?.id || isCheckingDriver) return;

    const interval = setInterval(() => {
      fetchDriverInfo();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user?.id, isCheckingDriver, fetchDriverInfo]);

  // Also refresh when page becomes visible (user switches tabs back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && !isCheckingDriver) {
        fetchDriverInfo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, isCheckingDriver, fetchDriverInfo]);

  return {
    // Dialog state and controls
    dialogs: {
      showListDialog,
      showDetailDialog,
      showCompleteDialog,
      selectedRide,
      rideToComplete,
      setShowListDialog,
      setShowDetailDialog,
      setSelectedRide,
      setShowCompleteDialog,
    },
    
    // Rides data
    rides: {
      activeRides,
      completedRides,
      isLoading,
    },
    
    // Driver information
    driver: {
      driverId,
      isApprovedDriver,
      isCheckingDriver,
      hasDriverApplication,
      totalEarnings,
    },
    
    // Actions
    actions: {
      fetchRides,
      handleListRide,
      handleViewDetails,
      handleCompleteRideClick,
      handleConfirmComplete,
    },
  };
}

