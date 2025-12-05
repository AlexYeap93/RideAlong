import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { MapPin, Clock, CheckCircle } from "lucide-react";
import type { DriverActiveRidesSectionProps } from "../../../serviceInterface";
import type { Passenger, ActiveRide } from "../../../types/api_interfaces";
import { toast } from "sonner";
import { ridesAPI } from "../../../services/RideServices";


export function DriverActiveRidesSection({ activeRides, driverId, onViewDetails, onCompleteClick, onRefresh }: DriverActiveRidesSectionProps) {
  if (activeRides.length === 0) {
    return (
      <div className="px-4 mb-6">
        <p className="text-muted-foreground text-center py-8">No active rides. List a ride to get started!</p>
      </div>
    );
  }

  return (
    <div className="px-4 mb-6">
      <h2 className="mb-3">Your Active Rides</h2>
      <div className="space-y-3">
        {activeRides.map((ride: ActiveRide) => (
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
                  {ride.passengers.map((passenger: Passenger) => (
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
                  onClick={() => onViewDetails(ride)}
                  className="text-xs sm:text-sm"
                >
                  Details
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="bg-green-50 border-green-600 text-green-700 hover:bg-green-100 hover:text-green-800 text-xs sm:text-sm whitespace-nowrap"
                  onClick={() => onCompleteClick(ride)}
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
                        await ridesAPI.deleteRide(String(ride.id));
                        toast.success("Ride cancelled successfully", {
                          description: "All passenger bookings have been cancelled.",
                        });
                        if (driverId) {
                          await onRefresh();
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
  );
}

