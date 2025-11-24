import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Textarea } from "./ui/textarea";
import { Star, Edit, Settings, CreditCard, History, HelpCircle, ChevronRight, Car, LogOut, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { bookingsAPI, driversAPI, issuesAPI } from "../services/api";
import { DriverApplicationDialog } from "./DriverApplicationDialog";

interface ProfilePageProps {
  onNavigateToPaymentMethods?: () => void;
  onNavigateToRideHistory?: () => void;
  onNavigateToSettings?: () => void;
}

export function ProfilePage({ onNavigateToPaymentMethods, onNavigateToRideHistory, onNavigateToSettings }: ProfilePageProps) {
  const { user, refreshUser, logout } = useAuth();
  const [ridesTaken, setRidesTaken] = useState(0);
  const [ridesOffered, setRidesOffered] = useState(0);
  const [showDriverApplication, setShowDriverApplication] = useState(false);
  const [hasDriverProfile, setHasDriverProfile] = useState(false);
  const [isApprovedDriver, setIsApprovedDriver] = useState(false);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [issueType, setIssueType] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkDriverStatus();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id, driverId]);

  const checkDriverStatus = async () => {
    if (!user?.id) return;
    
    try {
      const driverResponse = await driversAPI.getMyDriverProfile();
      if (driverResponse.data) {
        setHasDriverProfile(true);
        setIsApprovedDriver(driverResponse.data.is_approved === true);
        setDriverId(driverResponse.data.id);
        // Get average rating from database
        const rating = driverResponse.data.average_rating 
          ? parseFloat(driverResponse.data.average_rating) 
          : null;
        setAverageRating(rating);
      }
    } catch (error: any) {
      // Driver profile doesn't exist
      setHasDriverProfile(false);
      setIsApprovedDriver(false);
      setDriverId(null);
    }
  };
  //Counts the number of rides taken and offered by the user
  const fetchUserStats = async () => {
    if (!user?.id) return;
    
    try {
      // Get user bookings (rides taken) - count ALL bookings, not just completed
      const bookingsResponse = await bookingsAPI.getBookingsByUser(user.id);
      const allBookings = bookingsResponse.data.filter((b: any) => b.status !== 'cancelled');
      setRidesTaken(allBookings.length);
      
      // Don't store completed rides taken for display (removed per user request)

      // If user is a driver, get completed rides offered
      // Use driverId from state (set by checkDriverStatus) or try to fetch it
      let currentDriverId = driverId;
      
      // If driverId is not set yet, try to get it (works for all users including admins)
      if (!currentDriverId) {
        try {
          const driverResponse = await driversAPI.getMyDriverProfile();
          if (driverResponse.data && driverResponse.data.id) {
            currentDriverId = driverResponse.data.id;
            setDriverId(currentDriverId);
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
          setRidesOffered(completedRides.length);
        } catch (error: any) {
          console.error("Failed to fetch driver rides:", error);
          setRidesOffered(0);
        }
      } else {
        // Only set to 0 if we're sure the user is not a driver
        // (i.e., hasDriverProfile is false after checkDriverStatus has run)
        if (hasDriverProfile === false) {
          setRidesOffered(0);
        }
        // Otherwise, leave it as is (might still be loading)
      }
    } catch (error: any) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  // Handles the driver application process if the user is not a driver
  const handleBecomeDriver = () => {
    if (hasDriverProfile && !isApprovedDriver) {
      toast.info("Your driver application is pending approval");
      return;
    }
    if (hasDriverProfile && isApprovedDriver) {
      toast.info("You are already an approved driver");
      return;
    }
    setShowDriverApplication(true);
  };

  // Handles the driver application success which will remove the want to become a driver button and add the driver (approved) button
  const handleApplicationSuccess = () => {
    setHasDriverProfile(true);
    setIsApprovedDriver(false);
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
            {hasDriverProfile && (
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>
                  {averageRating !== null && averageRating > 0 
                    ? `${averageRating.toFixed(1)} Rating` 
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
          <p className="text-2xl font-medium text-primary">{ridesTaken}</p>
          <p className="text-sm text-muted-foreground">Rides Taken</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-medium text-primary">{ridesOffered}</p>
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
            onClick={() => setShowHelpDialog(true)}
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
            {hasDriverProfile && !isApprovedDriver 
              ? "Application Pending" 
              : hasDriverProfile && isApprovedDriver
              ? "Driver (Approved)"
              : "Become a Driver"}
          </Button>
        )}

        {hasDriverProfile && !isApprovedDriver && (
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
        open={showDriverApplication}
        onClose={() => setShowDriverApplication(false)}
        onSuccess={handleApplicationSuccess}
      />

      {/* Help & Support Dialog */}
      <Dialog open={showHelpDialog} onOpenChange={setShowHelpDialog}>
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
            <Button variant="outline" onClick={() => {
              setShowHelpDialog(false);
              setIssueType("");
              setIssueDescription("");
            }}>
              Cancel
            </Button>
            <Button onClick={async () => {
              if (!issueType || !issueDescription.trim()) {
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
                if (issueType === 'safety') {
                  priority = 'critical';
                } else if (issueType === 'driver-noshow' || issueType === 'payment') {
                  priority = 'high';
                }

                await issuesAPI.createIssue({
                  issueType: issueType,
                  subject: issueTypeLabels[issueType] || 'Issue reported',
                  description: issueDescription.trim(),
                  priority: priority,
                });

                toast.success("Issue reported successfully", {
                  description: "An admin will review your report shortly.",
                });

                setIssueType("");
                setIssueDescription("");
                setShowHelpDialog(false);
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