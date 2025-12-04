import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../../../components/ui/alert-dialog";
import type { DriverCompleteRideDialogProps } from "../../../../serviceInterface";


export function DriverCompleteRideDialog({ open, onOpenChange, rideToComplete, onConfirm }: DriverCompleteRideDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Complete Ride?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to mark this ride as completed? This action cannot be undone.
            {rideToComplete && (
              <div className="mt-3 p-3 bg-muted rounded-md">
                <p className="font-medium text-foreground mb-1">Ride Details:</p>
                <p className="text-sm">Destination: {rideToComplete.destination}</p>
                <p className="text-sm">Date: {rideToComplete.date}</p>
                <p className="text-sm">Passengers: {rideToComplete.passengers.length}</p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Complete Ride
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

