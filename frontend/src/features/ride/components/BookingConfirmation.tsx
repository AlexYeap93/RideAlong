import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle2, MapPin, Clock, Calendar, User, Car } from "lucide-react";
import type { BookingConfirmationProps } from "../../../serviceInterface";
import { serviceFee } from "../../../types/const";


export function BookingConfirmation({ 
  bookingDetails, 
  onViewBookings, 
  onReturnHome 
}: BookingConfirmationProps) {
  // Service fee is 2.50$ which we may increase based on team discussion
  
  // Total is the price of the ride + service fee THIS IS $12.50 FOR NOW
  const total = bookingDetails.price + serviceFee;

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Success Header */}
      <div className="bg-primary text-primary-foreground p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
        </div>
        <h1 className="mb-2">Booking Confirmed!</h1>
        <p className="text-primary-foreground/80">
          Your ride has been successfully booked
        </p>
      </div>

      <div className="p-4 space-y-4 -mt-4">
        {/* Booking Reference */}
        <Card className="p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
          <p className="font-mono tracking-wider">{bookingDetails.bookingId}</p>
        </Card>

        {/* QR Code Placeholder CURRENTLY NOT WORKING */}
        <Card className="p-6">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-3 border-2 border-dashed border-gray-300">
              {/* Simple QR-like pattern */}
              <div className="grid grid-cols-8 gap-1">
                {[...Array(64)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'} rounded-sm`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Show this QR code to your driver
            </p>
          </div>
        </Card>

        {/* Driver & Trip Details */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Trip Details</h2>
          
          {/* Driver Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {bookingDetails.driverName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{bookingDetails.driverName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {bookingDetails.rating} ★
                </Badge>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{bookingDetails.carType}</span>
              </div>
            </div>
          </div>

          {/* Trip Info Grid */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Car className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">{bookingDetails.car}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Your Seat</p>
                <p className="font-medium">Seat {bookingDetails.seatNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup</p>
                <p className="font-medium">{bookingDetails.quadrant} Quadrant, Calgary</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{bookingDetails.destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{bookingDetails.bookingDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Departure Time</p>
                <p className="font-medium">{bookingDetails.departureTime}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Summary */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Payment Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ride fare</span>
              <span>${bookingDetails.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total Paid</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Important Note */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-medium mb-2 text-blue-900">Important</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Be ready 5 minutes before departure time</li>
            <li>Driver will contact you for exact pickup location</li>
            <li>Keep your booking ID handy</li>
          </ul>
        </Card>
      </div>

      {/* Fixed Bottom Buttons */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t space-y-2">
        <Button className="w-full" onClick={onViewBookings}>
          View My Bookings
        </Button>
        <Button variant="outline" className="w-full" onClick={onReturnHome}>
          Book Another Ride
        </Button>
      </div>
    </div>
  );
}