import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { MapPin, Clock, Calendar as CalendarIcon } from "lucide-react";
import { RequestRideDialogProps } from "../serviceInterface";
import { TIME_SLOTS, DESTINATIONS } from "../const";

export function RequestRideDialog({ open, onClose, onSubmit }: RequestRideDialogProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [destination, setDestination] = useState<string>("");

  const timeSlots = TIME_SLOTS;

  const destinations = DESTINATIONS;

  const handleSubmit = () => {
    if (date && time && destination) {
      onSubmit({ date, time, destination });
      onClose();
      // Reset form
      setDate(new Date());
      setTime("");
      setDestination("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Ride</DialogTitle>
          <DialogDescription>
            Choose your ride details to request a ride to the University of Calgary.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Destination */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Destination
            </Label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {destinations.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                disabled={(date: Date) => date < new Date()}
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
            disabled={!date || !time || !destination}
          >
            Request Ride
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}