import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Search, MapPin, Filter, Plus, Clock, CheckCircle } from "lucide-react";
import { ListRideDialog } from "./ListRideDialog";
import { DriverRideDetailDialog } from "./DriverRideDetailDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { toast } from "sonner@2.0.3";

export function DriversPage() {
  const [showListDialog, setShowListDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rideToComplete, setRideToComplete] = useState<any>(null);

  // Active rides that the driver has listed
  const activeRides = [
    {
      id: 1,
      destination: "University of Calgary",
      date: "Oct 20, 2025",
      time: "3:00 PM",
      passengers: [
        {
          id: 1,
          name: "Jessica Wang",
          rating: 4.8,
          pickupLocation: "Brentwood Station",
          pickupTime: "2:45 PM",
          quadrant: "NW",
          seatNumber: 2
        },
        {
          id: 2,
          name: "Tom Anderson",
          rating: 4.9,
          pickupLocation: "Dalhousie Station",
          pickupTime: "2:50 PM",
          quadrant: "NW",
          seatNumber: 3
        }
      ]
    }
  ];

  const handleListRide = (data: { date: Date; time: string; destination: string }) => {
    console.log("Ride listed:", data);
    toast.success("Ride listed successfully!", {
      description: `Ride to ${data.destination} on ${data.date.toLocaleDateString()} at ${data.time}.`
    });
  };

  const handleViewDetails = (ride: any) => {
    setSelectedRide(ride);
    setShowDetailDialog(true);
  };

  const handleCompleteRideClick = (ride: any) => {
    setRideToComplete(ride);
    setShowCompleteDialog(true);
  };

  const handleConfirmComplete = () => {
    toast.success("Ride completed successfully!", {
      description: "You can view this ride in your ride history."
    });
    setShowCompleteDialog(false);
    setRideToComplete(null);
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-medium mb-1">For Drivers</h1>
            <p className="text-sm text-primary-foreground/80">Manage your rides to University of Calgary</p>
          </div>
          <Button 
            size="sm" 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={() => setShowListDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            List a Ride
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
          <Input
            placeholder="Search ride requests..."
            className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2 overflow-x-auto">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            All Areas
          </Button>
          <Button variant="outline" size="sm">NE</Button>
          <Button variant="outline" size="sm">NW</Button>
          <Button variant="outline" size="sm">SE</Button>
          <Button variant="outline" size="sm">SW</Button>
          <Button variant="outline" size="sm">DT</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-4">
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-green-600">{activeRides.length}</p>
          <p className="text-xs text-muted-foreground">Active</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-blue-600">0</p>
          <p className="text-xs text-muted-foreground">Completed Today</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-lg font-medium text-orange-600">$0</p>
          <p className="text-xs text-muted-foreground">Earnings</p>
        </Card>
      </div>

      {/* Active Rides Section */}
      {activeRides.length > 0 && (
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
                        <span>{ride.date} • Departure: {ride.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Passengers Preview */}
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-sm mb-2">Passengers:</p>
                    <div className="space-y-1">
                      {ride.passengers.map((passenger) => (
                        <div key={passenger.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {passenger.name.split(' ').map(n => n[0]).join('')}
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
                    >
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="bg-green-50 border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800"
                      onClick={() => handleCompleteRideClick(ride)}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Complete
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

      <ListRideDialog 
        open={showListDialog} 
        onClose={() => setShowListDialog(false)}
        onSubmit={handleListRide}
      />

      {selectedRide && (
        <DriverRideDetailDialog
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