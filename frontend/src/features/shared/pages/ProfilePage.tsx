import { useReducer, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Label } from "../../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Textarea } from "../../../components/ui/textarea";
import { Star, Edit, Settings, CreditCard, History, HelpCircle, ChevronRight, Car, LogOut, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";
import { bookingsAPI, driversAPI, issuesAPI } from "../../../services/api";
import { DriverApplicationDialog } from "../../../features/driver/components/dialog/DriverApplicationDialog";
import type { ProfilePageProps, ProfilePageState } from "../../../serviceInterface";


type ProfilePageAction =
  | { type: 'SET_RIDES_TAKEN'; payload: number }
  | { type: 'SET_RIDES_OFFERED'; payload: number }
  | { type: 'SET_SHOW_DRIVER_APPLICATION'; payload: boolean }
  | { type: 'SET_HAS_DRIVER_PROFILE'; payload: boolean }
  | { type: 'SET_IS_APPROVED_DRIVER'; payload: boolean }
  | { type: 'SET_DRIVER_ID'; payload: string | null }
  | { type: 'SET_SHOW_HELP_DIALOG'; payload: boolean }
  | { type: 'SET_ISSUE_TYPE'; payload: string }
  | { type: 'SET_ISSUE_DESCRIPTION'; payload: string }
  | { type: 'SET_AVERAGE_RATING'; payload: number | null }
  | { type: 'SET_DRIVER_STATUS'; payload: { hasDriverProfile: boolean; isApprovedDriver: boolean; driverId: string | null; averageRating: number | null } }
  | { type: 'RESET_ISSUE_FORM' };

const initialState: ProfilePageState = {
  ridesTaken: 0,
  ridesOffered: 0,
  showDriverApplication: false,
  hasDriverProfile: false,
  isApprovedDriver: false,
  driverId: null,
  showHelpDialog: false,
  issueType: "",
  issueDescription: "",
  averageRating: null,
};

function profilePageReducer(state: ProfilePageState, action: ProfilePageAction): ProfilePageState {
  switch (action.type) {
    case 'SET_RIDES_TAKEN':
      return { ...state, ridesTaken: action.payload };
    case 'SET_RIDES_OFFERED':
      return { ...state, ridesOffered: action.payload };
    case 'SET_SHOW_DRIVER_APPLICATION':
      return { ...state, showDriverApplication: action.payload };
    case 'SET_HAS_DRIVER_PROFILE':
      return { ...state, hasDriverProfile: action.payload };
    case 'SET_IS_APPROVED_DRIVER':
      return { ...state, isApprovedDriver: action.payload };
    case 'SET_DRIVER_ID':
      return { ...state, driverId: action.payload };
    case 'SET_SHOW_HELP_DIALOG':
      return { ...state, showHelpDialog: action.payload };
    case 'SET_ISSUE_TYPE':
      return { ...state, issueType: action.payload };
    case 'SET_ISSUE_DESCRIPTION':
      return { ...state, issueDescription: action.payload };
    case 'SET_AVERAGE_RATING':
      return { ...state, averageRating: action.payload };
    case 'SET_DRIVER_STATUS':
      return {
        ...state,
        hasDriverProfile: action.payload.hasDriverProfile,
        isApprovedDriver: action.payload.isApprovedDriver,
        driverId: action.payload.driverId,
        averageRating: action.payload.averageRating,
      };
    case 'RESET_ISSUE_FORM':
      return { ...state, issueType: "", issueDescription: "", showHelpDialog: false };
    default:
      return state;
  }
}

export function ProfilePage({ onNavigateToPaymentMethods, onNavigateToRideHistory, onNavigateToSettings }: ProfilePageProps) {
  const { user, refreshUser, logout } = useAuth();
  const [state, dispatch] = useReducer(profilePageReducer, initialState);

  useEffect(() => {
    if (user?.id) {
      checkDriverStatus();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id, state.driverId]);

  const checkDriverStatus = async () => {
    if (!user?.id) return;
    
    try {
      const driverResponse = await driversAPI.getMyDriverProfile();
      if (driverResponse.data) {
        const rating = driverResponse.data.average_rating 
          ? parseFloat(driverResponse.data.average_rating) 
          : null;
        dispatch({
          type: 'SET_DRIVER_STATUS',
          payload: {
            hasDriverProfile: true,
            isApprovedDriver: driverResponse.data.is_approved === true,
            driverId: driverResponse.data.id,
            averageRating: rating,
          },
        });
      }
    } catch (error: any) {
      // Driver profile doesn't exist
      dispatch({
        type: 'SET_DRIVER_STATUS',
        payload: {
          hasDriverProfile: false,
          isApprovedDriver: false,
          driverId: null,
          averageRating: null,
        },
      });
    }
  };
  //Counts the number of rides taken and offered by the user
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      // Get user bookings (rides taken) - count ALL bookings, not just completed
      const bookingsResponse = await bookingsAPI.getBookingsByUser(user.id);
      const allBookings = bookingsResponse.data.filter((b: any) => b.status !== 'cancelled');
      dispatch({ type: 'SET_RIDES_TAKEN', payload: allBookings.length });
      
      // Don't store completed rides taken for display (removed per user request)

      // If user is a driver, get completed rides offered
      // Use driverId from state (set by checkDriverStatus) or try to fetch it
      let currentDriverId = state.driverId;
      
      // If driverId is not set yet, try to get it (works for all users including admins)
      if (!currentDriverId) {
        try {
          const driverResponse = await driversAPI.getMyDriverProfile();
          if (driverResponse.data && driverResponse.data.id) {
            currentDriverId = driverResponse.data.id;
            dispatch({ type: 'SET_DRIVER_ID', payload: currentDriverId });
          }
        } catch (error: any) {
          // User is not a driver or profile not found
          currentDriverId = null;
        }
      }

      // Fetch completed rides if we have a driver ID
      if (currentDriverId) {
        try {
          const driverRidesResponse = await driversAPI.getDriverRides(currentDriverId);
          // Filter for completed rides (same logic as DriversPage)
          const completedRides = driverRidesResponse.data.filter((r: any) => r.status === 'completed');
          // Count ALL completed rides for the driver (same as DriversPage)
          dispatch({ type: 'SET_RIDES_OFFERED', payload: completedRides.length });
        } catch (error: any) {
          console.error("Failed to fetch driver rides:", error);
          dispatch({ type: 'SET_RIDES_OFFERED', payload: 0 });
        }
      } else {
        // Only set to 0 if we're sure the user is not a driver
        // (i.e., hasDriverProfile is false after checkDriverStatus has run)
        if (state.hasDriverProfile === false) {
          dispatch({ type: 'SET_RIDES_OFFERED', payload: 0 });
        }
        // Otherwise, leave it as is (might still be loading)
      }
    } catch (error: any) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  // Handles the driver application process if the user is not a driver
  const handleBecomeDriver = () => {
    if (state.hasDriverProfile && !state.isApprovedDriver) {
      toast.info("Your driver application is pending approval");
      return;
    }
    if (state.hasDriverProfile && state.isApprovedDriver) {
      toast.info("You are already an approved driver");
      return;
    }
    dispatch({ type: 'SET_SHOW_DRIVER_APPLICATION', payload: true });
  };

  // Handles the driver application success which will remove the want to become a driver button and add the driver (approved) button
  const handleApplicationSuccess = () => {
    dispatch({ type: 'SET_HAS_DRIVER_PROFILE', payload: true });
    dispatch({ type: 'SET_IS_APPROVED_DRIVER', payload: false });
    refreshUser();
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Profile Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary-foreground text-primary text-xl">
              {user ? getInitials(user.name) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-medium">{user?.name || 'User'}</h2>
            <p className="text-primary-foreground/80">{user?.email || ''}</p>
            {state.hasDriverProfile && (
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {state.averageRating !== null && state.averageRating > 0 
                    ? `${state.averageRating.toFixed(1)} Rating` 
                    : 'No Rating Yet'}
                </span>
                <Badge variant="secondary" className="ml-2">Verified</Badge>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-medium text-primary">{state.ridesTaken}</p>
          <p className="text-sm text-muted-foreground">Rides Taken</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-medium text-primary">{state.ridesOffered}</p>
          <p className="text-sm text-muted-foreground">Rides Offered</p>
        </Card>
      </div>


      {/* Menu Options */}
      <div className="px-4 space-y-2">
        <Card className="p-4">
          <button 
            onClick={onNavigateToPaymentMethods}
            className="flex items-center gap-3 mb-4 w-full text-left hover:bg-accent/50 -mx-4 px-4 py-2 rounded transition-colors"
          >
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Payment Methods</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={onNavigateToRideHistory}
            className="flex items-center gap-3 mb-4 w-full text-left hover:bg-accent/50 -mx-4 px-4 py-2 rounded transition-colors"
          >
            <History className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Ride History</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={onNavigateToSettings}
            className="flex items-center gap-3 mb-4 w-full text-left hover:bg-accent/50 -mx-4 px-4 py-2 rounded transition-colors"
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button 
            onClick={() => dispatch({ type: 'SET_SHOW_HELP_DIALOG', payload: true })}
            className="flex items-center gap-3 w-full text-left hover:bg-accent/50 -mx-4 px-4 py-2 rounded transition-colors"
          >
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </Card>

        {user?.role !== 'driver' && user?.role !== 'admin' && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleBecomeDriver}
          >
            <Car className="w-4 h-4 mr-2" />
            {state.hasDriverProfile && !state.isApprovedDriver 
              ? "Application Pending" 
              : state.hasDriverProfile && state.isApprovedDriver
              ? "Driver (Approved)"
              : "Become a Driver"}
          </Button>
        )}

        {state.hasDriverProfile && !state.isApprovedDriver && (
          <Card className="p-4 mt-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900 mb-1">Application Pending</h3>
                <p className="text-sm text-yellow-800">
                  Your driver application is pending admin approval. You'll be notified once approved.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Logout Button */}
        <Card className="p-4 mt-4">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={async () => {
              try {
                await logout();
                toast.success("Logged out successfully");
              } catch (error: any) {
                toast.error("Failed to logout", {
                  description: error.message || "Please try again.",
                });
              }
            }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </Card>
      </div>

      <DriverApplicationDialog
        open={state.showDriverApplication}
        onClose={() => dispatch({ type: 'SET_SHOW_DRIVER_APPLICATION', payload: false })}
        onSuccess={handleApplicationSuccess}
      />

      {/* Help & Support Dialog */}
      <Dialog open={state.showHelpDialog} onOpenChange={(open: boolean) => dispatch({ type: 'SET_SHOW_HELP_DIALOG', payload: open })}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              Let us know if you're experiencing any problems.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
            <Button variant="outline" onClick={() => dispatch({ type: 'RESET_ISSUE_FORM' })}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!state.issueType || !state.issueDescription.trim()) {
                toast.error("Please fill in all required fields");
                return;
              }

              try {
                const issueTypeLabels: { [key: string]: string } = {
                  'driver-late': 'Driver is late',
                  'driver-noshow': 'Driver didn\'t show up',
                  'safety': 'Safety concern',
                  'route': 'Wrong route/location',
                  'payment': 'Payment issue',
                  'other': 'Other issue'
                };

                let priority = 'medium';
                if (state.issueType === 'safety') {
                  priority = 'critical';
                } else if (state.issueType === 'driver-noshow' || state.issueType === 'payment') {
                  priority = 'high';
                }

                await issuesAPI.createIssue({
                  issueType: state.issueType,
                  subject: issueTypeLabels[state.issueType] || 'Issue reported',
                  description: state.issueDescription.trim(),
                  priority: priority,
                });

                toast.success("Issue reported successfully", {
                  description: "An admin will review your report shortly.",
                });

                dispatch({ type: 'RESET_ISSUE_FORM' });
              } catch (error: any) {
                toast.error("Failed to submit issue", {
                  description: error.message || "Please try again.",
                });
              }
            }}>
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}