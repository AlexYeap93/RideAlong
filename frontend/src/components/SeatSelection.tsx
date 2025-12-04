import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { X, Star, MapPin } from "lucide-react";
import { bookingsAPI, usersAPI } from "../services/api";
import { toast } from "sonner";
import type { SeatSelectionProps } from "../serviceInterface";
import { TOTAL_SEATS } from "../types/const";

// Seat Selection component for the ride checks for number of seat and shows the composition of the car
//Checks if seat is taken and if it is, it is disabled and if it is not, it is enabled
export function SeatSelection({ driver, onBack, onConfirm }: SeatSelectionProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookedSeats, setBookedSeats] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [driverAddress, setDriverAddress] = useState<string>("");
  
  const totalSeats = TOTAL_SEATS[driver.carType];
  
  useEffect(() => {
    const fetchBookedSeats = async () => {
      if (!driver.rideId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const response = await bookingsAPI.getBookedSeats(driver.rideId);
        setBookedSeats(response.data || []);
      } catch (error: any) {
        console.error("Failed to fetch booked seats:", error);
        toast.error("Failed to load seat availability");
      } finally {
        setIsLoading(false);
      }
    };
    // Fetches the driver address from the database and list it out from where they will be coming from
    const fetchDriverAddress = async () => {
      if (driver.driverId) {
        try {
          const response = await usersAPI.getUserById(driver.driverId);
          if (response.data && response.data.address) {
            setDriverAddress(response.data.address);
          }
        } catch (error: any) {
          console.error("Failed to fetch driver address:", error);
        }
      }
    };
    
    fetchBookedSeats();
    fetchDriverAddress();
  }, [driver.rideId, driver.driverId]);
  
  const isFullyBooked = bookedSeats.length >= totalSeats;
  
  const renderSeat = (seatNumber: number, showSeatbelt: boolean = true) => {
    const isBooked = bookedSeats.includes(seatNumber);
    const isSelected = selectedSeat === seatNumber;
    
    return (
      <button
        key={seatNumber}
        disabled={isBooked}
        onClick={() => setSelectedSeat(seatNumber)}
        className={`
          w-16 h-20 rounded-xl border-2 flex flex-col items-center justify-center transition-all relative
          ${isBooked ? 'bg-gray-300/50 border-gray-400 cursor-not-allowed' : ''}
          ${isSelected ? 'bg-cyan-400 border-cyan-600' : 'border-cyan-600 hover:border-cyan-500'}
          ${!isBooked && !isSelected ? 'bg-cyan-50' : ''}
        `}
      >
        {showSeatbelt && !isBooked && (
          <div className="absolute top-1 left-1">
            <svg width="12" height="16" viewBox="0 0 12 16" fill="none" className={isSelected ? "text-white" : "text-cyan-700"}>
              <circle cx="6" cy="3" r="2.5" stroke="currentColor" strokeWidth="1"/>
              <path d="M6 6 L6 13" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M3 13 L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        )}
        {isBooked ? (
          <X className="w-5 h-5 text-gray-500" />
        ) : (
          <span className={`font-medium mt-2 ${isSelected ? 'text-white' : 'text-cyan-900'}`}>{seatNumber}</span>
        )}
      </button>
    );
  };
  // Renders the seats based on the car type for html layout
  const renderSeats = () => {
    if (driver.carType === "5-seater") {
      return (
        <div className="space-y-8">
          {/* Front row: Driver with steering wheel + Front passenger */}
          <div className="flex justify-between items-center px-2">
            {/* Steering wheel */}
            <div className="w-16 h-16 rounded-full border-[3px] border-cyan-600 bg-white flex items-center justify-center">
              <div className="w-11 h-11 rounded-full border-[3px] border-cyan-600 flex items-center justify-center">
                <div className="w-1.5 h-7 bg-cyan-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {renderSeat(1)}
            </div>
          </div>
          
          {/* Back row: 3 seats spread out */}
          <div className="flex justify-between px-2">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderSeat(4)}
          </div>
        </div>
      );
    } else {
      // 7-seater van layout
      return (
        <div className="space-y-6">
          {/* Front row: Driver with steering wheel + Front passenger */}
          <div className="flex justify-between items-center px-2">
            {/* Steering wheel */}
            <div className="w-16 h-16 rounded-full border-[3px] border-cyan-600 bg-white flex items-center justify-center">
              <div className="w-11 h-11 rounded-full border-[3px] border-cyan-600 flex items-center justify-center">
                <div className="w-1.5 h-7 bg-cyan-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {renderSeat(1)}
            </div>
          </div>
          
          {/* Middle row: 3 seats spread out */}
          <div className="flex justify-between px-2">
            {renderSeat(2)}
            {renderSeat(3)}
            {renderSeat(4)}
          </div>
          
          {/* Back row: 2 seats */}
          <div className="flex justify-around px-8">
            {renderSeat(5)}
            {renderSeat(6)}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="pb-32 bg-background min-h-screen">
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
                {driver.rating > 0 ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{driver.rating.toFixed(1)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-gray-300" />
                    <span className="text-xs text-muted-foreground">No rating yet</span>
                  </div>
                )}
              </div>
              {driverAddress && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  <span className="break-words">{driverAddress}</span>
                </div>
              )}
              {!driverAddress && driver.quadrant && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{driver.quadrant}</span>
                </div>
              )}
            </div>
            <div className="text-right">
              <p className="font-medium">${driver.price}</p>
              <p className="text-xs text-muted-foreground">per seat</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Seat Map */}
      <div className="p-6 pb-24 flex justify-center">
        <div className="bg-white rounded-lg p-6 shadow-sm w-full max-w-md">
          <div className="mb-4 text-center">
            <Badge variant="secondary" className="mb-2">
              {driver.carType}
            </Badge>
            <p className="text-sm text-muted-foreground">{driver.car}</p>
            {isFullyBooked && (
              <Badge variant="destructive" className="mt-2">
                Fully Booked
              </Badge>
            )}
          </div>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading seat availability...</p>
            </div>
          ) : (
            <>
              {/* Van outline */}
              <div className="relative">
            {/* Van body */}
            <div className="border-[3px] border-cyan-600 bg-white rounded-[32px] p-8 relative">
              {/* Side mirrors - swapped sides */}
              <div className="absolute -left-3 top-6 w-6 h-4 border-2 border-cyan-600 bg-white rounded-r-lg"></div>
              <div className="absolute -right-3 top-6 w-6 h-4 border-2 border-cyan-600 bg-white rounded-l-lg"></div>
              
              {/* Door outline on left side (driver door) */}
              <div className="absolute left-0 top-6 w-1 h-20 bg-cyan-600 rounded-r"></div>
              
              {/* Door outlines on right side (passenger doors) */}
              <div className="absolute right-0 top-6 w-1 h-20 bg-cyan-600 rounded-l"></div>
              
              {/* Additional passenger door separators for back rows */}
              <div className="absolute right-0 top-32 w-1 h-20 bg-cyan-600 rounded-l"></div>
              {driver.carType === "7-seater" && (
                <div className="absolute right-0 top-56 w-1 h-20 bg-cyan-600 rounded-l"></div>
              )}
              
              {/* Windshield indicator at top */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-3 border-2 border-cyan-600 bg-cyan-100 rounded-b-xl"></div>
              </div>
              
              {/* Rear window/bumper at bottom */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="w-24 h-2 border-2 border-cyan-600 bg-cyan-100 rounded-t-lg"></div>
              </div>
              
              {renderSeats()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-around mt-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-50 border-2 border-cyan-600"></div>
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-300/50 border-2 border-gray-400"></div>
              <span className="text-muted-foreground">Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-cyan-400 border-2 border-cyan-600"></div>
              <span className="text-muted-foreground">Selected</span>
            </div>
          </div>
            </>
          )}
        </div>
      </div>

      {/* Booking Summary */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t shadow-lg z-10">
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