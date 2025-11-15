import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { MapPin, Clock, ChevronDown, ChevronUp, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";
import { Passenger } from "../types";

interface ActiveRideCardProps {
  rideId: number;
  destination: string;
  date: string;
  time: string;
  passengers: Passenger[];
}
// For Driver tab to display active rides
export function ActiveRideCard({ rideId: _rideId, destination, date, time, passengers }: ActiveRideCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [rideTime, setRideTime] = useState(time);
  // available time slots for the ride
  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
    "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  // handles update for ride pickup time for passenger
  const handleTimeChange = (newTime: string) => {
    setRideTime(newTime);
    toast.success("Ride time updated", {
      description: `New departure time: ${newTime}`
    });
  };

  return (
    <Card className="p-4 border-2 border-green-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600 hover:bg-green-700">Active Ride</Badge>
              <Badge variant="outline">{passengers.length} Passenger{passengers.length > 1 ? 's' : ''}</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm mb-1">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span>To {destination}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{date}</span>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <label className="text-sm">Departure Time:</label>
          <Select value={rideTime} onValueChange={handleTimeChange}>
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

        {/* Passengers List */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t">
            <h4 className="text-sm">Passengers to Pick Up:</h4>
            {passengers.map((passenger) => (
              <Card key={passenger.id} className="p-3 bg-muted/50">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {passenger.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{passenger.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {passenger.quadrant}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs">{passenger.rating}</span>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{passenger.pickupLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span>{passenger.pickupTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            Start Ride
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            Cancel Ride
          </Button>
        </div>
      </div>
    </Card>
  );
}
