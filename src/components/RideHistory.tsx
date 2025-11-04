import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Star, Download } from "lucide-react";

interface RideHistoryProps {
  onBack: () => void;
}

export function RideHistory({ onBack }: RideHistoryProps) {
  // Mock ride history data
  const rideHistory = [
    {
      id: "RA87654321",
      date: "Oct 18, 2025",
      driverName: "Sarah Chen",
      rating: 4.9,
      car: "Honda Civic",
      destination: "University of Calgary",
      quadrant: "DT",
      departureTime: "8:00 AM",
      seatNumber: 2,
      price: 12.00,
      status: "completed"
    },
    {
      id: "RA87654320",
      date: "Oct 15, 2025",
      driverName: "Mike Johnson",
      rating: 4.7,
      car: "Toyota Corolla",
      destination: "University of Calgary",
      quadrant: "NW",
      departureTime: "9:00 AM",
      seatNumber: 1,
      price: 10.00,
      status: "completed"
    },
    {
      id: "RA87654319",
      date: "Oct 12, 2025",
      driverName: "Emily Rodriguez",
      rating: 5.0,
      car: "Mazda CX-5",
      destination: "University of Calgary",
      quadrant: "DT",
      departureTime: "2:30 PM",
      seatNumber: 4,
      price: 15.00,
      status: "completed"
    },
    {
      id: "RA87654318",
      date: "Oct 10, 2025",
      driverName: "James Wilson",
      rating: 4.8,
      car: "Honda Pilot",
      destination: "University of Calgary",
      quadrant: "NE",
      departureTime: "7:45 AM",
      seatNumber: 3,
      price: 13.00,
      status: "completed"
    },
    {
      id: "RA87654317",
      date: "Oct 8, 2025",
      driverName: "Sarah Chen",
      rating: 4.9,
      car: "Honda Civic",
      destination: "University of Calgary",
      quadrant: "DT",
      departureTime: "4:00 PM",
      seatNumber: 2,
      price: 12.00,
      status: "cancelled"
    }
  ];

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-medium">Ride History</h1>
            <p className="text-sm text-primary-foreground/80">{rideHistory.length} total rides</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="p-4 grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-medium text-primary">
            {rideHistory.filter(r => r.status === "completed").length}
          </p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-medium text-primary">
            ${rideHistory.filter(r => r.status === "completed").reduce((sum, r) => sum + r.price, 0).toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground">Total Spent</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-medium text-primary">
            {rideHistory.filter(r => r.status === "cancelled").length}
          </p>
          <p className="text-xs text-muted-foreground">Cancelled</p>
        </Card>
      </div>

      {/* Ride History List */}
      <div className="px-4 space-y-3">
        <h2 className="font-medium mb-2">Past Rides</h2>
        
        {rideHistory.map((ride) => (
          <Card key={ride.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {ride.driverName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{ride.driverName}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{ride.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{ride.car}</p>
              </div>
              
              <Badge 
                variant={ride.status === "completed" ? "secondary" : "destructive"}
                className="text-xs"
              >
                {ride.status}
              </Badge>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{ride.date}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{ride.departureTime}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>{ride.destination} ({ride.quadrant})</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div>
                  <span className="text-muted-foreground">Booking ID: </span>
                  <span className="font-mono text-xs">{ride.id}</span>
                </div>
                <div className="font-medium text-primary">
                  ${ride.price.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <Button variant="outline" size="sm" className="flex-1">
                <Download className="w-3 h-3 mr-1" />
                Receipt
              </Button>
              {ride.status === "completed" && (
                <Button variant="outline" size="sm" className="flex-1">
                  Book Again
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
