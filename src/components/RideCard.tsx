import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, Users, Clock, MapPin } from "lucide-react";

interface RideCardProps {
  driverName: string;
  rating: number;
  departureTime: string;
  availableSeats: number;
  price: number;
  destination: string;
  estimatedDuration: string;
  carType?: "5-seater" | "7-seater";
  quadrant?: string;
  onSelect?: () => void;
}

export function RideCard({
  driverName,
  rating,
  departureTime,
  availableSeats,
  price,
  destination,
  estimatedDuration,
  carType,
  quadrant,
  onSelect
}: RideCardProps) {
  return (
    <Card className="p-4 m-4 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-primary text-primary-foreground">
              {driverName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{driverName}</p>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-muted-foreground">{rating}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">${price}</p>
          <p className="text-sm text-muted-foreground">per person</p>
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span>Departure: {departureTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span>{availableSeats} seats available</span>
          {carType && (
            <Badge variant="secondary" className="text-xs ml-2">
              {carType}
            </Badge>
          )}
        </div>
        {quadrant && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span>{quadrant}</span>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          To: {destination} • {estimatedDuration}
        </p>
      </div>
      
      <Button 
        className="w-full bg-primary text-primary-foreground"
        onClick={onSelect}
      >
        Book Ride
      </Button>
    </Card>
  );
}