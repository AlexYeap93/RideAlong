import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, MapPin, Clock, Save } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner@2.0.3";

interface Passenger {
  id: number;
  name: string;
  rating: number;
  pickupLocation: string;
  pickupTime: string;
  quadrant: string;
  seatNumber: number;
}

interface DriverRideDetailDialogProps {
  open: boolean;
  onClose: () => void;
  rideId: number;
  destination: string;
  date: string;
  departureTime: string;
  passengers: Passenger[];
}

export function DriverRideDetailDialog({ 
  open, 
  onClose, 
  rideId,
  destination, 
  date, 
  departureTime,
  passengers 
}: DriverRideDetailDialogProps) {
  const [passengerPickupTimes, setPassengerPickupTimes] = useState<{[key: number]: string}>(
    passengers.reduce((acc, p) => ({ ...acc, [p.id]: p.pickupTime }), {})
  );

  const timeSlots = [
    "8:00 AM", "8:15 AM", "8:30 AM", "8:45 AM", "9:00 AM",
    "9:15 AM", "9:30 AM", "9:45 AM", "10:00 AM", "10:15 AM",
    "10:30 AM", "10:45 AM", "11:00 AM", "11:15 AM", "11:30 AM",
    "11:45 AM", "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "1:00 PM", "1:15 PM", "1:30 PM", "1:45 PM", "2:00 PM",
    "2:15 PM", "2:30 PM", "2:45 PM", "3:00 PM", "3:15 PM",
    "3:30 PM", "3:45 PM", "4:00 PM", "4:15 PM", "4:30 PM",
    "4:45 PM", "5:00 PM", "5:15 PM", "5:30 PM", "5:45 PM",
    "6:00 PM", "6:15 PM", "6:30 PM", "6:45 PM", "7:00 PM",
    "7:15 PM", "7:30 PM", "7:45 PM", "8:00 PM"
  ];

  const handlePickupTimeChange = (passengerId: number, newTime: string) => {
    setPassengerPickupTimes(prev => ({
      ...prev,
      [passengerId]: newTime
    }));
  };

  const handleSave = () => {
    // Here you would typically save to a backend/state management
    console.log("Saving pickup times:", passengerPickupTimes);
    toast.success("Pickup times saved!", {
      description: "All passengers have been notified of their pickup times."
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ride Details</DialogTitle>
          <DialogDescription>
            Manage your ride and view passenger information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Ride Info */}
          <Card className="p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">To {destination}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{date} • Departure: {departureTime}</span>
              </div>
              <div className="text-sm">
                <Badge variant="secondary">{passengers.length} Passenger{passengers.length > 1 ? 's' : ''}</Badge>
              </div>
            </div>
          </Card>

          {/* Passengers List */}
          <div className="space-y-3">
            <h4 className="font-medium">Passengers to Pick Up:</h4>
            {passengers.map((passenger) => (
              <Card key={passenger.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {passenger.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{passenger.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {passenger.quadrant}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        Seat {passenger.seatNumber}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{passenger.rating}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{passenger.pickupLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Pickup Time Selector */}
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Pickup Time:
                  </label>
                  <Select 
                    value={passengerPickupTimes[passenger.id]} 
                    onValueChange={(value) => handlePickupTimeChange(passenger.id, value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Pickup Times
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
