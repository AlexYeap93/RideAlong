import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { MapPin, Clock } from "lucide-react";
import { ScrollableDatePicker } from "../../../components/ScrollableDatePicker";
import { toast } from "sonner";

interface ListRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { date: Date; time: string; destination: string }) => void;
}

export function ListRideDialog({ open, onClose, onSubmit }: ListRideDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");

  const allTimeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
    "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  // Filter time slots based on selected date
  const timeSlots = useMemo(() => {
    if (!date) return allTimeSlots;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    // If date is today, filter out past times
    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      return allTimeSlots.filter((slot) => {
        const [timePart, modifier] = slot.split(' ');
        let [hours, minutes] = timePart.split(':');
        let hour24 = parseInt(hours);
        
        if (modifier === 'PM' && hour24 !== 12) {
          hour24 += 12;
        }
        if (modifier === 'AM' && hour24 === 12) {
          hour24 = 0;
        }
        
        const slotTimeInMinutes = hour24 * 60 + parseInt(minutes || '0');
        return slotTimeInMinutes > currentTimeInMinutes;
      });
    }

    // If date is in the future, show all time slots
    return allTimeSlots;
  }, [date]);

  const handleSubmit = () => {
    if (!date || !time) {
      toast.error("Please select both date and time");
      return;
    }

    // Check if the selected date/time is in the past
    const selectedDateTime = new Date(date);
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    
    if (modifier === 'PM' && hours !== '12') {
      hours = String(parseInt(hours) + 12);
    }
    if (modifier === 'AM' && hours === '12') {
      hours = '00';
    }
    
    selectedDateTime.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0);
    const now = new Date();

    if (selectedDateTime <= now) {
      toast.error("Cannot list a ride in the past", {
        description: "Please select a date and time in the future.",
      });
      return;
    }

    onSubmit({ date, time, destination: "University of Calgary" });
    onClose();
    // Reset form
    setDate(new Date());
    setTime("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto flex flex-col">
        <DialogHeader>
          <DialogTitle>List a Ride to University of Calgary</DialogTitle>
          <DialogDescription>
            Choose a date and time for your ride to the University of Calgary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 overflow-y-auto flex-1">
          {/* Destination - Fixed */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              Destination
            </Label>
            <div className="p-3 bg-muted rounded-md border">
              <p className="text-sm">University of Calgary</p>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              Date
            </Label>
            <ScrollableDatePicker
              selectedDate={date || new Date()}
              onDateChange={(newDate) => {
                setDate(newDate);
                // Reset time when date changes to ensure valid selection
                setTime("");
              }}
              minDate={new Date()}
              label=""
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Time
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!date || !time}
          >
            List Ride
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
