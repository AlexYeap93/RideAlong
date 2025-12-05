import { useReducer } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Textarea } from "../../../../components/ui/textarea";
import { toast } from "sonner";
import { driversAPI } from "../../../../services/DriverServices";
import type { DriverApplicationDialogProps, FormState } from "../../../../serviceInterface";

type FormAction =
  | { type: 'SET_LICENSE_NUMBER'; payload: string }
  | { type: 'SET_INSURANCE_PROOF'; payload: string }
  | { type: 'SET_CAR_PHOTO'; payload: File | null }
  | { type: 'SET_AVAILABLE_SEATS'; payload: string }
  | { type: 'SET_SUBMITTING'; payload: boolean }
  | { type: 'RESET_FORM' };

const initialState: FormState = {
  licenseNumber: "",
  insuranceProof: "",
  carPhoto: null,
  availableSeats: "4",
  isSubmitting: false,
};

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_LICENSE_NUMBER':
      return { ...state, licenseNumber: action.payload };
    case 'SET_INSURANCE_PROOF':
      return { ...state, insuranceProof: action.payload };
    case 'SET_CAR_PHOTO':
      return { ...state, carPhoto: action.payload };
    case 'SET_AVAILABLE_SEATS':
      return { ...state, availableSeats: action.payload };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.payload };
    case 'RESET_FORM':
      return initialState;
    default:
      return state;
  }
}
//Driver Application Dialog for Driver to apply to become a driver
export function DriverApplicationDialog({ open, onClose, onSuccess }: DriverApplicationDialogProps) {
  const [formState, dispatch] = useReducer(formReducer, initialState);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      dispatch({ type: 'SET_CAR_PHOTO', payload: e.target.files[0] });
    }
  };

  // Needs license number, insurance proof, and total seats
  const handleSubmit = async () => {
    if (!formState.licenseNumber.trim()) {
      toast.error("License number is required");
      return;
    }

    if (!formState.insuranceProof.trim()) {
      toast.error("Insurance proof is required");
      return;
    }

    if (!formState.availableSeats || parseInt(formState.availableSeats) < 1) {
      toast.error("Please enter a valid number of available seats");
      return;
    }

    dispatch({ type: 'SET_SUBMITTING', payload: true });
    try {
      await driversAPI.createDriver({
        licenseNumber: formState.licenseNumber.trim(),
        insuranceProof: formState.insuranceProof.trim(),
        carPhoto: formState.carPhoto ? formState.carPhoto.name : undefined, // For now, just store filename (this is not implemented yet)
        availableSeats: parseInt(formState.availableSeats),
      });

      toast.success("Driver application submitted!", {
        description: "Your application is pending admin approval. You will be notified once approved.",
      });

      // Reset form
      dispatch({ type: 'RESET_FORM' });
      
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to submit application", {
        description: error.message || "Please try again.",
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
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
              value={formState.licenseNumber}
              onChange={(e) => dispatch({ type: 'SET_LICENSE_NUMBER', payload: e.target.value })}
              required
            />
          </div>

          {/* Insurance Proof */}
          <div className="space-y-2">
            <Label htmlFor="insurance">Insurance Proof *</Label>
            <Textarea
              id="insurance"
              placeholder="Enter insurance information"
              value={formState.insuranceProof}
              onChange={(e) => dispatch({ type: 'SET_INSURANCE_PROOF', payload: e.target.value })}
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
              onChange={handleFileChange}
            />
            {formState.carPhoto && (
              <p className="text-sm text-muted-foreground">Selected: {formState.carPhoto.name}</p>
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
              value={formState.availableSeats}
              onChange={(e) => dispatch({ type: 'SET_AVAILABLE_SEATS', payload: e.target.value })}
              required
            />
            <p className="text-xs text-muted-foreground">Number of passenger seats available in your vehicle</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={formState.isSubmitting || !formState.licenseNumber.trim() || !formState.insuranceProof.trim()}>
            {formState.isSubmitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

