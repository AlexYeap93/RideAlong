import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import {  MapPin, Clock, Save, DollarSign, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { toast } from "sonner";
import { bookingsAPI, usersAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { DriverRideDetailDialogProps } from "../../../types";


export function DriverRideDetailDialog({ 
  open, 
  onClose, 
  rideId,
  destination, 
  date, 
  departureTime,
  passengers,
  onSave
}: DriverRideDetailDialogProps) {
  const { user } = useAuth();
  const [passengerPickupTimes, setPassengerPickupTimes] = useState<{[key: number | string]: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [additionalAmountInputs, setAdditionalAmountInputs] = useState<{[key: number | string]: string}>({});
  const [isRequestingAmount, setIsRequestingAmount] = useState<{[key: number | string]: boolean}>({});
  const [driverPhone, setDriverPhone] = useState<string | null>(null);

  useEffect(() => {
    // Fetch driver phone number from database
    const fetchDriverPhone = async () => {
      if (user?.id) {
        try {
          const response = await usersAPI.getUserById(user.id);
          if (response.data?.phone) {
            setDriverPhone(response.data.phone);
          }
        }
        catch (error) {
          console.error("Failed to fetch driver phone:", error);
        }
      }
    };
    if (open && user?.id) {
      fetchDriverPhone();
    }
  }, [open, user?.id]);

  useEffect(() => {
    // Initialize pickup times from passengers
    // If passenger has a saved pickup time, use it; otherwise use the ride's departure time
    const initialTimes: {[key: number | string]: string} = {};
    passengers.forEach(p => {
      initialTimes[p.id] = p.pickupTime || departureTime;
    });
    // Default pickup time is the ride time to the University of Calgary
    setPassengerPickupTimes(initialTimes);
  }, [passengers, departureTime]);

  // Available time slots for the ride
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

  const handlePickupTimeChange = (passengerId: number | string, newTime: string) => {
    setPassengerPickupTimes(prev => ({
      ...prev,
      [passengerId]: newTime
    }));
  };
// Handles request for additional amount from passenger
  const handleRequestAdditionalAmount = async (passengerId: number | string) => {
    const amount = additionalAmountInputs[passengerId];
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsRequestingAmount(prev => ({ ...prev, [passengerId]: true }));
    try {
      await bookingsAPI.requestAdditionalAmount(String(passengerId), parseFloat(amount));
      toast.success("Additional amount request sent!", {
        description: "The rider will be notified and can accept or decline.",
      });
      setAdditionalAmountInputs(prev => ({ ...prev, [passengerId]: "" }));
      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      toast.error("Failed to request additional amount", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsRequestingAmount(prev => ({ ...prev, [passengerId]: false }));
    }
  };
// Handles saving the pickup times for the ride
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const pickupTimes = passengers.map(passenger => ({
        bookingId: String(passenger.id),
        pickupTime: passengerPickupTimes[passenger.id] || departureTime,
        pickupLocation: passenger.pickupLocation || undefined,
      }));

      await bookingsAPI.updatePickupTimes({
        rideId: String(rideId),
        pickupTimes,
      });

      toast.success("Pickup times saved!", {
        description: "All passengers have been notified of their pickup times."
      });
      
      if (onSave) {
        onSave();
      }
      onClose();
    } catch (error: any) {
      toast.error("Failed to save pickup times", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
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
              {driverPhone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Your Phone:</span>
                  <span className="font-medium">{driverPhone}</span>
                </div>
              )}
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
                      <Badge variant="secondary" className="text-xs">
                        Seat {passenger.seatNumber}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{passenger.pickupLocation}</span>
                    </div>
                    
                    {passenger.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Phone: {passenger.phone}</span>
                      </div>
                    )}

                    {/* Additional Amount Request Status */}
                    {passenger.additionalAmountRequested && passenger.additionalAmountStatus && (
                      <div className="mt-2">
                        {passenger.additionalAmountStatus === 'pending' && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                            <DollarSign className="w-3 h-3 mr-1" />
                            $ {passenger.additionalAmountRequested} requested - Pending
                          </Badge>
                        )}
                        {passenger.additionalAmountStatus === 'accepted' && (
                          <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                            <DollarSign className="w-3 h-3 mr-1" />
                            $ {passenger.additionalAmountRequested} accepted
                          </Badge>
                        )}
                        {passenger.additionalAmountStatus === 'declined' && (
                          <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            $ {passenger.additionalAmountRequested} declined - Booking cancelled
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Request Additional Amount */}
                {passenger.additionalAmountStatus !== 'pending' && passenger.additionalAmountStatus !== 'accepted' && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <Label className="text-sm flex items-center gap-2">
                      <DollarSign className="w-3 h-3" />
                      Request Additional Amount (Optional):
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g., 10.00"
                        value={additionalAmountInputs[passenger.id] || ""}
                        onChange={(e) => setAdditionalAmountInputs(prev => ({ ...prev, [passenger.id]: e.target.value }))}
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRequestAdditionalAmount(passenger.id)}
                        disabled={isRequestingAmount[passenger.id]}
                        className="text-xs sm:text-sm whitespace-nowrap"
                      >
                        {isRequestingAmount[passenger.id] ? "Requesting..." : "Request"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Request additional payment if rider is far from your location
                    </p>
                  </div>
                )}

                {/* Pickup Time Selector */}
                <div className="space-y-2">
                  <label className="text-sm flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    Pickup Time:
                  </label>
                  <Select 
                    value={passengerPickupTimes[passenger.id]} 
                    onValueChange={(value: string) => handlePickupTimeChange(passenger.id, value)}
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

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose} className="text-xs sm:text-sm">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="text-xs sm:text-sm">
            <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            {isSaving ? "Saving..." : "Save Pickup Times"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
