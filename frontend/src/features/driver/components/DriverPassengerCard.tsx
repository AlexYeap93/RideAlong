import { useState } from "react";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { MapPin, Clock, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { bookingsAPI } from "../../../services/api";
import type { DriverPassengerCardProps } from "../../../serviceInterface";
import { timeSlots } from "../../../types/const";


export function DriverPassengerCard({ 
  passenger, 
  pickupTime, 
  onPickupTimeChange,
  onSave 
}: DriverPassengerCardProps) {
  const [additionalAmountInput, setAdditionalAmountInput] = useState<string>("");
  const [isRequestingAmount, setIsRequestingAmount] = useState<boolean>(false);

  const handleRequestAdditionalAmount = async () => {
    if (!additionalAmountInput || parseFloat(additionalAmountInput) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsRequestingAmount(true);
    try {
      await bookingsAPI.requestAdditionalAmount(String(passenger.id), parseFloat(additionalAmountInput));
      toast.success("Additional amount request sent!", {
        description: "The rider will be notified and can accept or decline.",
      });
      setAdditionalAmountInput("");
      if (onSave) {
        onSave();
      }
    } catch (error: any) {
      toast.error("Failed to request additional amount", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsRequestingAmount(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {passenger.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{passenger.name}</span>
            <Badge variant="secondary" className="text-xs">
              Seat {passenger.seatNumber}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-3 h-3 text-muted-foreground" />
            <span>{passenger.pickupLocation}</span>
          </div>
          
          {passenger.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Phone: {passenger.phone}</span>
            </div>
          )}

          {/* Additional Amount Request Status */}
          {passenger.additionalAmountRequested && passenger.additionalAmountStatus && (
            <div className="mt-2">
              {passenger.additionalAmountStatus === 'pending' && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  $ {passenger.additionalAmountRequested} requested - Pending
                </Badge>
              )}
              {passenger.additionalAmountStatus === 'accepted' && (
                <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                  <DollarSign className="w-3 h-3 mr-1" />
                  $ {passenger.additionalAmountRequested} accepted
                </Badge>
              )}
              {passenger.additionalAmountStatus === 'declined' && (
                <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  $ {passenger.additionalAmountRequested} declined - Booking cancelled
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Request Additional Amount */}
      {passenger.additionalAmountStatus !== 'pending' && passenger.additionalAmountStatus !== 'accepted' && (
        <div className="mt-3 pt-3 border-t space-y-2">
          <Label className="text-sm flex items-center gap-2">
            <DollarSign className="w-3 h-3" />
            Request Additional Amount (Optional):
          </Label>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 10.00"
              value={additionalAmountInput}
              onChange={(e) => setAdditionalAmountInput(e.target.value)}
              className="flex-1 text-sm"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestAdditionalAmount}
              disabled={isRequestingAmount}
              className="text-xs sm:text-sm whitespace-nowrap"
            >
              {isRequestingAmount ? "Requesting..." : "Request"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Request additional payment if rider is far from your location
          </p>
        </div>
      )}

      {/* Pickup Time Selector */}
      <div className="space-y-2">
        <label className="text-sm flex items-center gap-2">
          <Clock className="w-3 h-3" />
          Pickup Time:
        </label>
        <Select 
          value={pickupTime} 
          onValueChange={(value: string) => onPickupTimeChange(passenger.id, value)}
        >
          <SelectTrigger>
            <SelectValue />
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
    </Card>
  );
}

