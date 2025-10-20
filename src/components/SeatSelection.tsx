import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { X, Star, Car, MapPin } from "lucide-react";

interface SeatSelectionProps {
  driver: {
    name: string;
    rating: number;
    car: string;
    carType: "5-seater" | "7-seater";
    price: number;
    departureTime: string;
    destination: string;
    quadrant: string;
  };
  onBack: () => void;
  onConfirm: (seat: number) => void;
}

export function SeatSelection({ driver, onBack, onConfirm }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  
  const totalSeats = driver.carType === "5-seater" ? 4 : 6; // Excluding driver
  // Mock some already booked seats
  const bookedSeats = driver.carType === "5-seater" ? [1, 3] : [1, 2, 5];
  
  const renderSeat = (seatNumber: number) => {
    const isBooked = bookedSeats.includes(seatNumber);
    const isSelected = selectedSeat === seatNumber;
    
    return (
      <button
        key={seatNumber}
        disabled={isBooked}
        onClick={() => setSelectedSeat(seatNumber)}
        className={`
          w-14 h-14 rounded-lg border-2 flex items-center justify-center transition-all
          ${isBooked ? 'bg-gray-200 border-gray-300 cursor-not-allowed' : ''}
          ${isSelected ? 'bg-primary border-primary text-white' : 'border-border hover:border-primary'}
          ${!isBooked && !isSelected ? 'bg-white' : ''}
        `}
      >
        {isBooked ? (
          <X className="w-5 h-5 text-gray-400" />
        ) : (
          <span className="font-medium">{seatNumber}</span>
        )}
      </button>
    );
  };

  const renderSeats = () => {
    if (driver.carType === "5-seater") {
      return (
        <div className="space-y-8">
          {/* Front row: Driver (left) + Passenger (right) */}
          <div className="flex justify-between items-center px-8">
            <div className="w-14 h-14 rounded-lg bg-gray-800 text-white flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            {renderSeat(1)}
          </div>
          
          {/* Back row: 3 seats */}
          <div className="flex justify-around px-4">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderSeat(4)}
          </div>
        </div>
      );
    } else {
      // 7-seater: 2 front, 3 middle, 2 back
      return (
        <div className="space-y-6">
          {/* Front row: Driver (left) + Passenger (right) */}
          <div className="flex justify-between items-center px-8">
            <div className="w-14 h-14 rounded-lg bg-gray-800 text-white flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            {renderSeat(1)}
          </div>
          
          {/* Middle row: 3 seats */}
          <div className="flex justify-around px-4">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderSeat(4)}
          </div>
          
          {/* Back row: 2 seats */}
          <div className="flex justify-around px-12">
            {renderSeat(5)}
            {renderSeat(6)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-medium">Select Your Seat</h2>
          <Button variant="outline" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
        
        {/* Driver Info */}
        <Card className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {driver.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{driver.name}</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">{driver.rating}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span>{driver.quadrant}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">${driver.price}</p>
              <p className="text-xs text-muted-foreground">per seat</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seat Map */}
      <div className="p-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="mb-4 text-center">
            <Badge variant="secondary" className="mb-2">
              {driver.carType}
            </Badge>
            <p className="text-sm text-muted-foreground">{driver.car}</p>
          </div>
          
          {/* Car outline */}
          <div className="border-2 border-gray-300 rounded-3xl p-6 bg-gray-50">
            {renderSeats()}
          </div>

          {/* Legend */}
          <div className="flex justify-around mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-white border-2 border-border"></div>
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200 border-2 border-gray-300"></div>
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-primary border-2 border-primary"></div>
              <span className="text-muted-foreground">Selected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Departure</p>
            <p className="font-medium">{driver.departureTime}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="font-medium">${driver.price}</p>
          </div>
        </div>
        <Button 
          className="w-full" 
          disabled={selectedSeat === null}
          onClick={() => selectedSeat && onConfirm(selectedSeat)}
        >
          {selectedSeat ? `Confirm Seat ${selectedSeat}` : "Select a seat"}
        </Button>
      </div>
    </div>
  );
}