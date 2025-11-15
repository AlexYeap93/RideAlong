import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { driversAPI } from "../services/api";

interface DriverApplicationDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
//Driver Application Dialog for Driver to apply to become a driver
export function DriverApplicationDialog({ open, onClose, onSuccess }: DriverApplicationDialogProps) {
  const [licenseNumber, setLicenseNumber] = useState("");
  const [insuranceProof, setInsuranceProof] = useState("");
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [availableSeats, setAvailableSeats] = useState("4");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  // Needs license number, insurance proof, and total seats
  const handleSubmit = async () => {
    if (!licenseNumber.trim()) {
      toast.error("License number is required");
      return;
    }

    if (!insuranceProof.trim()) {
      toast.error("Insurance proof is required");
      return;
    }

    if (!availableSeats || parseInt(availableSeats) < 1) {
      toast.error("Please enter a valid number of available seats");
      return;
    }

    setIsSubmitting(true);
    try {
      await driversAPI.createDriver({
        licenseNumber: licenseNumber.trim(),
        insuranceProof: insuranceProof.trim(),
        carPhoto: carPhoto ? carPhoto.name : undefined, // For now, just store filename (this is not implemented yet)
        availableSeats: parseInt(availableSeats),
      });

      toast.success("Driver application submitted!", {
        description: "Your application is pending admin approval. You will be notified once approved.",
      });

      // Reset form
      setLicenseNumber("");
      setInsuranceProof("");
      setCarPhoto(null);
      setAvailableSeats("4");
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to submit application", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to Become a Driver</DialogTitle>
          <DialogDescription>
            Submit your driver application for admin approval. You'll be able to list rides once approved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="license">Driver's License Number *</Label>
            <Input
              id="license"
              placeholder="Enter your license number"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
            />
          </div>

          {/* Insurance Proof */}
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Proof *</Label>
            <Textarea
              id="insurance"
              placeholder="Enter insurance information"
              value={insuranceProof}
              onChange={(e) => setInsuranceProof(e.target.value)}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">Insurance proof is required for driver applications</p>
          </div>

          {/* Car Photo */}
          <div className="space-y-2">
            <Label htmlFor="carPhoto">Car Photo (Optional)</Label>
            <Input
              id="carPhoto"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setCarPhoto)}
            />
            {carPhoto && (
              <p className="text-sm text-muted-foreground">Selected: {carPhoto.name}</p>
            )}
          </div>

          {/* Available Seats */}
          <div className="space-y-2">
            <Label htmlFor="seats">Available Seats *</Label>
            <Input
              id="seats"
              type="number"
              min="1"
              max="8"
              placeholder="4"
              value={availableSeats}
              onChange={(e) => setAvailableSeats(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">Number of passenger seats available in your vehicle</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !licenseNumber.trim() || !insuranceProof.trim()}>
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

