import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { MapPin, Clock } from "lucide-react";
import type { DriverStatsSectionProps, DriverCompletedRidesSectionProps } from "../../../serviceInterface";
import type { CompletedRide } from "../../../types/api_interfaces";


export function DriverCompletedRidesSection({ completedRides }: DriverCompletedRidesSectionProps) {
  if (completedRides.length === 0) {
    return null;
  }

  return (
    <div className="px-4 mb-6">
      <h2 className="mb-3">Completed Rides</h2>
      <div className="space-y-3">
        {completedRides.map((ride: CompletedRide) => (
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
  );
}


export function DriverStatsSection({ activeRidesCount, completedRides, totalEarnings }: DriverStatsSectionProps) {
  const completedToday = completedRides.filter((ride: CompletedRide) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const rideDate = new Date(ride.rideDate);
    rideDate.setHours(0, 0, 0, 0);
    return rideDate.getTime() === today.getTime();
  }).length;

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      <Card className="p-3 text-center">
        <p className="text-lg font-medium text-green-600">{activeRidesCount}</p>
        <p className="text-xs text-muted-foreground">Active</p>
      </Card>
      <Card className="p-3 text-center">
        <p className="text-lg font-medium text-blue-600">{completedToday}</p>
        <p className="text-xs text-muted-foreground">Completed Today</p>
      </Card>
      <Card className="p-3 text-center">
        <p className="text-lg font-medium text-orange-600">${totalEarnings.toFixed(2)}</p>
        <p className="text-xs text-muted-foreground">Total Earnings</p>
      </Card>
    </div>
  );
}

