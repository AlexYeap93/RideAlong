import { useState, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Star, Download } from "lucide-react";
import { transformBookingData } from "../../../services/api";
import { bookingsAPI } from "../../../services/BookingServices";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "sonner";

export function RideHistory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rideHistory, setRideHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchRideHistory();
    }
  }, [user?.id]);

  const fetchRideHistory = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await bookingsAPI.getBookingsByUser(user.id);
      const transformedBookings = response.data.map(transformBookingData);
      // Filter for completed and cancelled bookings
      const history = transformedBookings.filter((booking: any) => 
        booking.status === 'completed' || booking.status === 'cancelled'
      );
      // Sort by date (most recent first)
      history.sort((a: any, b: any) => {
        const dateA = a.ride_date || a.date;
        const dateB = b.ride_date || b.date;
        const timeA = typeof dateA === 'string' ? new Date(dateA).getTime() : dateA.getTime();
        const timeB = typeof dateB === 'string' ? new Date(dateB).getTime() : dateB.getTime();
        return timeB - timeA;
      });
      setRideHistory(history);
    } catch (error: any) {
      toast.error("Failed to load ride history", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  
  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
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
            ${rideHistory.filter(r => r.status === "completed").reduce((sum, r) => sum + (r.price || 0), 0).toFixed(2)}
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
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ride history...</p>
          </div>
        ) : rideHistory.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No ride history yet.</p>
          </div>
        ) : (
          rideHistory.map((ride) => (
          <Card key={ride.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {ride.driverName.split(' ').map((n: string) => n[0]).join('')}
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
          ))
        )}
      </div>
    </div>
  );
}
