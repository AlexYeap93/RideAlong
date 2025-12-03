import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import { DriverRideInfoCardProps} from "../../shared/constants/const";

export function DriverRideInfoCard({ 
  destination, 
  date, 
  departureTime, 
  driverPhone, 
  passengers 
}: DriverRideInfoCardProps) {
  return (
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
  );
}

