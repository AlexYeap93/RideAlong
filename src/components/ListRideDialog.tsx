import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Clock, Calendar as CalendarIcon } from "lucide-react";

interface ListRideDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { date: Date; time: string; destination: string }) => void;
}

export function ListRideDialog({ open, onClose, onSubmit }: ListRideDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");

  const timeSlots = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
    "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  const handleSubmit = () => {
    if (date && time) {
      onSubmit({ date, time, destination: "University of Calgary" });
      onClose();
      // Reset form
      setDate(new Date());
      setTime("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>List a Ride to University of Calgary</DialogTitle>
          <DialogDescription>
            Choose a date and time for your ride to the University of Calgary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Destination - Fixed */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <div className="p-3 bg-muted rounded-md">
              <p>University of Calgary</p>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Date
            </Label>
            <div className="border rounded-md p-3">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time
            </Label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger>
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
