import { Clock, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface TimeSlot {
  id: string;
  time: string;
  period: string;
  available: boolean;
  rideCount: number;
}

interface TimeSlotSelectionProps {
  onTimeSlotSelect: (timeSlot: string) => void;
  onBack: () => void;
}

export function TimeSlotSelection({ onTimeSlotSelect, onBack }: TimeSlotSelectionProps) {
  const timeSlots: TimeSlot[] = [
    {
      id: "morning1",
      time: "8:00",
      period: "AM",
      available: true,
      rideCount: 5
    },
    {
      id: "morning2",
      time: "8:30",
      period: "AM",
      available: true,
      rideCount: 3
    },
    {
      id: "morning3",
      time: "9:00",
      period: "AM",
      available: true,
      rideCount: 7
    },
    {
      id: "morning4",
      time: "9:30",
      period: "AM",
      available: false,
      rideCount: 0
    },
    {
      id: "afternoon1",
      time: "2:00",
      period: "PM",
      available: true,
      rideCount: 4
    },
    {
      id: "afternoon2",
      time: "2:30",
      period: "PM",
      available: true,
      rideCount: 6
    },
    {
      id: "afternoon3",
      time: "3:00",
      period: "PM",
      available: true,
      rideCount: 8
    },
    {
      id: "afternoon4",
      time: "3:30",
      period: "PM",
      available: true,
      rideCount: 2
    },
    {
      id: "afternoon5",
      time: "4:00",
      period: "PM",
      available: true,
      rideCount: 5
    },
    {
      id: "afternoon6",
      time: "4:30",
      period: "PM",
      available: true,
      rideCount: 3
    },
    {
      id: "evening1",
      time: "5:00",
      period: "PM",
      available: true,
      rideCount: 9
    },
    {
      id: "evening2",
      time: "5:30",
      period: "PM",
      available: true,
      rideCount: 4
    }
  ];

  const morningSlots = timeSlots.filter(slot => slot.period === "AM");
  const afternoonSlots = timeSlots.filter(slot => slot.period === "PM" && parseInt(slot.time.split(":")[0]) < 5);
  const eveningSlots = timeSlots.filter(slot => slot.period === "PM" && parseInt(slot.time.split(":")[0]) >= 5);

  const renderTimeSlotGroup = (slots: TimeSlot[], title: string) => (
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
                  {slot.rideCount} rides
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

  return (
    <div className="bg-background">
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="font-medium">University of Calgary</h2>
            <p className="text-sm text-muted-foreground">Select departure time</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={onBack}
        >
          Back
        </Button>
      </div>

      <div className="py-4">
        {renderTimeSlotGroup(morningSlots, "Morning")}
        {renderTimeSlotGroup(afternoonSlots, "Afternoon")}
        {renderTimeSlotGroup(eveningSlots, "Evening")}
      </div>
    </div>
  );
}