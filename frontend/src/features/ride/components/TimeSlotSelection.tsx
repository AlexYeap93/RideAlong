import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { ridesAPI } from "../../../services/RideServices";
import { toast } from "sonner";
import type { TimeSlot } from "../../../serviceInterface";
import type { TimeSlotSelectionProps } from "../../../serviceInterface";
import { ScrollableDatePicker } from "../../../components/ScrollableDatePicker";
import { UNIVERSITY_DESTINATION } from "../../../types/const";


export function TimeSlotSelection({ onTimeSlotSelect, onBack, destination = UNIVERSITY_DESTINATION.name, selectedDate: propSelectedDate = new Date(), onDateChange }: TimeSlotSelectionProps) {
  const navigate = useNavigate();
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(propSelectedDate);

  // Sync with prop changes
  useEffect(() => {
    if (propSelectedDate) {
      setSelectedDate(propSelectedDate);
    }
  }, [propSelectedDate]);

  useEffect(() => {
    fetchRidesByTimeSlot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, selectedDate?.toISOString().split('T')[0]]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const fetchRidesByTimeSlot = async () => {
    setIsLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await ridesAPI.getAvailableRides({
        destination: destination,
        date: dateStr,
      });

      // Group rides by time slot
      const ridesByTime: { [key: string]: number } = {};
      
      response.data.forEach((ride: any) => {
        const rideTime = ride.ride_time || ride.time || '12:00:00';
        // Extract HH:MM from HH:MM:SS
        const timeHM = rideTime.split(':').slice(0, 2).join(':');
        const [hours, minutes] = timeHM.split(':').map(Number);
        
        // Round to nearest 30 minutes for grouping
        const roundedMinutes = minutes < 30 ? 0 : 30;
        
        // Determine period (AM/PM)
        const period = hours < 12 ? 'AM' : 'PM';
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const timeKey = `${displayHours}:${roundedMinutes.toString().padStart(2, '0')} ${period}`;
        
        ridesByTime[timeKey] = (ridesByTime[timeKey] || 0) + 1;
      });

      // Convert to TimeSlot array
      const slots: TimeSlot[] = Object.entries(ridesByTime).map(([timeKey, count]) => {
        const [time, period] = timeKey.split(' ');
        const [hours] = time.split(':').map(Number);
        
        // Determine period group
        let periodGroup = 'morning';
        if (period === 'PM') {
          if (hours < 5) {
            periodGroup = 'afternoon';
          } else {
            periodGroup = 'evening';
          }
        }
        
        return {
          id: `${periodGroup}-${timeKey.replace(/\s/g, '-')}`,
          time: time,
          period: period,
          available: count > 0,
          driverCount: count,
        };
      });

      // Sort by time
      slots.sort((a, b) => {
        const aHours = parseInt(a.time.split(':')[0]);
        const aMinutes = parseInt(a.time.split(':')[1]);
        const bHours = parseInt(b.time.split(':')[0]);
        const bMinutes = parseInt(b.time.split(':')[1]);
        
        // Convert to 24-hour for comparison
        const a24 = a.period === 'PM' && aHours !== 12 ? aHours + 12 : (a.period === 'AM' && aHours === 12 ? 0 : aHours);
        const b24 = b.period === 'PM' && bHours !== 12 ? bHours + 12 : (b.period === 'AM' && bHours === 12 ? 0 : bHours);
        
        if (a24 !== b24) return a24 - b24;
        return aMinutes - bMinutes;
      });

      setTimeSlots(slots);
    } catch (error: any) {
      toast.error("Failed to load ride times", {
        description: error.message || "Please try again.",
      });
      setTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  const morningSlots = timeSlots.filter(slot => slot.period === "AM");
  const afternoonSlots = timeSlots.filter(slot => {
    if (slot.period !== "PM") return false;
    const hours = parseInt(slot.time.split(":")[0]);
    return hours < 5;
  });
  const eveningSlots = timeSlots.filter(slot => {
    if (slot.period !== "PM") return false;
    const hours = parseInt(slot.time.split(":")[0]);
    return hours >= 5;
  });

  const renderTimeSlotGroup = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-6">
        <h3 className="font-medium text-muted-foreground mb-3 px-4">{title}</h3>
        <div className="grid grid-cols-2 gap-3 px-4">
          {slots.map((slot) => (
            <Card
              key={slot.id}
              className={`p-4 cursor-pointer transition-colors border ${
                slot.available 
                  ? "hover:bg-accent border-border" 
                  : "bg-muted border-muted cursor-not-allowed opacity-60"
              }`}
              onClick={() => slot.available && onTimeSlotSelect(`${slot.time} ${slot.period}`)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex items-center gap-1 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{slot.time}</span>
                  <span className="text-sm text-muted-foreground">{slot.period}</span>
                </div>
                
                {slot.available ? (
                  <Badge variant="secondary" className="text-xs">
                    {slot.driverCount} {slot.driverCount === 1 ? 'driver' : 'drivers'}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    No rides
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = today;

  return (
    <div className="bg-background">
      <div className="p-4 bg-white border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-medium">University of Calgary</h2>
              <p className="text-sm text-muted-foreground">Select departure time</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onBack ? onBack() : navigate(-1)}
          >
            Back
          </Button>
        </div>
        
        {/* Date Picker */}
        <ScrollableDatePicker
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          minDate={minDate}
          label="Select Date:"
        />
      </div>

      <div className="py-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ride times...</p>
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No rides available for this date.</p>
          </div>
        ) : (
          <>
            {renderTimeSlotGroup(morningSlots, "Morning")}
            {renderTimeSlotGroup(afternoonSlots, "Afternoon")}
            {renderTimeSlotGroup(eveningSlots, "Evening")}
          </>
        )}
      </div>
    </div>
  );
}