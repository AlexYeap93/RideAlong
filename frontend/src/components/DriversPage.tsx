import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { MapPin, Plus, Clock, CheckCircle } from "lucide-react";
import { ListRideDialog } from "./ListRideDialog";
import { DriverRideDetailDialog } from "./DriverRideDetailDialog";
import {AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle} from "./ui/alert-dialog";
import { toast } from "sonner";
import { ridesAPI, driversAPI, bookingsAPI, paymentsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

export function DriversPage() {
  const { user } = useAuth();
  const [showListDialog, setShowListDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rideToComplete, setRideToComplete] = useState<any>(null);
  const [activeRides, setActiveRides] = useState<any[]>([]);
  const [completedRides, setCompletedRides] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [isApprovedDriver, setIsApprovedDriver] = useState(false);
  const [isCheckingDriver, setIsCheckingDriver] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState<number>(0);

  // Function to fetch driver info
  const fetchDriverInfo = async () => {
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
          setIsApprovedDriver(false);
        } else {
          console.error("Failed to fetch driver profile:", error);
          setIsApprovedDriver(false);
        }
      } finally {
        setIsCheckingDriver(false);
      }
    } catch (error: any) {
      console.error("Failed to fetch driver info:", error);
    }
  };

  // Get driver ID on mount and when user changes
  useEffect(() => {
    fetchDriverInfo();
  }, [user?.id]);

  // Refresh driver status periodically (every 5 seconds) to catch approval updates from admin
  useEffect(() => {
    if (!user?.id || isCheckingDriver) return;

    const interval = setInterval(() => {
      fetchDriverInfo();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user?.id, isCheckingDriver]);

  // Also refresh when page becomes visible (user switches tabs back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user?.id && !isCheckingDriver) {
        fetchDriverInfo();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user?.id, isCheckingDriver]);

  // Fetch rides for the driver
  const fetchRides = async (driverId: string) => {
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
  };

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
// Handles listing a ride for the driver
  const handleListRide = async (data: { date: Date; time: string; destination: string }) => {
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
  };
  // Handles viewing the details of a ride to update pickup times for passengers and extra amount requested
  const handleViewDetails = (ride: any) => {
    setSelectedRide(ride);
    setShowDetailDialog(true);
  };
  // Handles completing a ride
  const handleCompleteRideClick = (ride: any) => {
    setRideToComplete(ride);
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = async () => {
    if (!rideToComplete) return;

    try {
      await ridesAPI.updateRide(rideToComplete.id, {
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
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground py-4 px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium mb-0.5">For Drivers</h1>
            <p className="text-sm text-primary-foreground/80">Manage your rides to University of Calgary</p>
          </div>
          {(isApprovedDriver || user?.role === 'admin') ? (
            <Button 
              size="sm" 
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              onClick={() => setShowListDialog(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              List a Ride
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
              onClick={() => {
                toast.info("Please apply to become a driver in your Profile tab");
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              List a Ride
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-green-600">{activeRides.length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-blue-600">
            {completedRides.filter((ride) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const rideDate = new Date(ride.rideDate);
              rideDate.setHours(0, 0, 0, 0);
              return rideDate.getTime() === today.getTime();
            }).length}
          </p>
          <p className="text-xs text-muted-foreground">Completed Today</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-orange-600">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Total Earnings</p>
        </Card>
      </div>

      {/* Driver Approval Status */}
      {!isCheckingDriver && !isApprovedDriver && (
        <div className="px-4 mb-6">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-1">Driver Application Pending</h3>
                <p className="text-sm text-yellow-800">
                  Your driver application is pending admin approval. You cannot list rides until you are approved.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Active Rides Section */}
      {isCheckingDriver ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking driver status...</p>
        </div>
      ) : isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading rides...</p>
        </div>
      ) : activeRides.length > 0 ? (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Your Active Rides</h2>
          <div className="space-y-3">
            {activeRides.map((ride) => (
              <Card key={ride.id} className="p-4 border-2 border-green-500">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-green-600 hover:bg-green-700">Active Ride</Badge>
                        <Badge variant="outline">{ride.passengers.length} Passenger{ride.passengers.length > 1 ? 's' : ''}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm mb-1">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>To {ride.destination}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{ride.date} at {ride.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Passengers Preview */}
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-sm mb-2">Passengers:</p>
                    <div className="space-y-1">
                      {ride.passengers.map((passenger: any) => (
                        <div key={passenger.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {passenger.name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span>{passenger.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{passenger.pickupTime}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button 
                      size="sm"
                      onClick={() => handleViewDetails(ride)}
                      className="text-xs sm:text-sm"
                    >
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-green-50 border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800 text-xs sm:text-sm whitespace-nowrap"
                      onClick={() => handleCompleteRideClick(ride)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      <span className="hidden sm:inline">Complete</span>
                      <span className="sm:hidden">Done</span>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs sm:text-sm bg-red-50 border-red-600 text-red-700 hover:bg-red-100 hover:text-red-800"
                      onClick={async () => {
                        if (confirm('Are you sure you want to cancel this ride? All passengers will be notified and their bookings will be cancelled.')) {
                          try {
                            await ridesAPI.deleteRide(ride.id);
                            toast.success("Ride cancelled successfully", {
                              description: "All passenger bookings have been cancelled.",
                            });
                            if (driverId) {
                              await fetchRides(driverId);
                            }
                          } catch (error: any) {
                            toast.error("Failed to cancel ride", {
                              description: error.message || "Please try again.",
                            });
                          }
                        }
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 mb-6">
          <p className="text-muted-foreground text-center py-8">No active rides. List a ride to get started!</p>
        </div>
      )}

      {/* Completed Rides Section */}
      {completedRides.length > 0 && (
        <div className="px-4 mb-6">
          <h2 className="mb-3">Completed Rides</h2>
          <div className="space-y-3">
            {completedRides.map((ride) => (
              <Card key={ride.id} className="p-4 border-2 border-blue-500">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-xs">
                        Complete
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ride.numberOfRiders} Rider{ride.numberOfRiders !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{ride.destination}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{ride.date} • {ride.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <span>Total Earnings: ${ride.totalEarnings.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <ListRideDialog 
        open={showListDialog} 
        onClose={() => setShowListDialog(false)}
        onSubmit={handleListRide}
      />

      {selectedRide && (
        <DriverRideDetailDialog
          onSave={async () => {
            // Refresh rides after saving pickup times
            if (driverId) {
              await fetchRides(driverId);
            }
          }}
          open={showDetailDialog}
          onClose={() => {
            setShowDetailDialog(false);
            setSelectedRide(null);
          }}
          rideId={selectedRide.id}
          destination={selectedRide.destination}
          date={selectedRide.date}
          departureTime={selectedRide.time}
          passengers={selectedRide.passengers}
        />
      )}

      {/* Complete Ride Confirmation Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Ride?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this ride as completed? This action cannot be undone.
              {rideToComplete && (
                <div className="mt-3 p-3 bg-muted rounded-md">
                  <p className="font-medium text-foreground mb-1">Ride Details:</p>
                  <p className="text-sm">Destination: {rideToComplete.destination}</p>
                  <p className="text-sm">Date: {rideToComplete.date}</p>
                  <p className="text-sm">Passengers: {rideToComplete.passengers.length}</p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmComplete}>
              Complete Ride
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}