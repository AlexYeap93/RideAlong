import { ListRideDialog } from "../../ride/components/ListRideDialog";
import { DriverRideDetailDialog } from "./dialog/DriverRideDetailDialog";
import { useAuth } from "../../../contexts/AuthContext";
import { useDriverRides } from "../hooks/useDriverRides";
import { DriverStatsSection, DriverCompletedRidesSection } from "./DriverStatsSection";
import { DriverApprovalStatus } from "./DriverApprovalStatus";
import { DriverActiveRidesSection } from "./DriverActiveRidesSection";
import { DriverCompleteRideDialog } from "./dialog/DriverCompleteRideDialog";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { DriverLoadingStateProps, DriversPageHeaderProps } from "../../../serviceInterface";


export function DriversPage() {
  const { user } = useAuth();
  const { dialogs, rides, driver, actions } = useDriverRides();

  const handleRefresh = async () => {
    if (driver.driverId) {
      await actions.fetchRides(driver.driverId);
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      <DriversPageHeader
        isApprovedDriver={driver.isApprovedDriver}
        userRole={user?.role}
        onListRideClick={() => dialogs.setShowListDialog(true)}
      />

      <DriverStatsSection
        activeRidesCount={rides.activeRides.length}
        completedRides={rides.completedRides}
        totalEarnings={driver.totalEarnings}
      />

      <DriverApprovalStatus
        hasDriverApplication={driver.hasDriverApplication}
        isApprovedDriver={driver.isApprovedDriver}
        isCheckingDriver={driver.isCheckingDriver}
      />

      {/* Active Rides Section */}
      {driver.isCheckingDriver ? (
        <DriverLoadingState message="Checking driver status..." />
      ) : rides.isLoading ? (
        <DriverLoadingState message="Loading rides..." />
      ) : (
        <DriverActiveRidesSection
          activeRides={rides.activeRides}
          driverId={driver.driverId}
          onViewDetails={actions.handleViewDetails}
          onCompleteClick={actions.handleCompleteRideClick}
          onRefresh={handleRefresh}
        />
      )}

      <DriverCompletedRidesSection completedRides={rides.completedRides} />

      <ListRideDialog
        open={dialogs.showListDialog}
        onClose={() => dialogs.setShowListDialog(false)}
        onSubmit={actions.handleListRide}
      />

      {dialogs.selectedRide && (
        <DriverRideDetailDialog
          onSave={handleRefresh}
          open={dialogs.showDetailDialog}
          onClose={() => {
            dialogs.setShowDetailDialog(false);
            dialogs.setSelectedRide(null);
          }}
          rideId={dialogs.selectedRide.id}
          destination={dialogs.selectedRide.destination}
          date={dialogs.selectedRide.date}
          departureTime={dialogs.selectedRide.time}
          passengers={dialogs.selectedRide.passengers}
        />
      )}

      <DriverCompleteRideDialog
        open={dialogs.showCompleteDialog}
        onOpenChange={dialogs.setShowCompleteDialog}
        rideToComplete={dialogs.rideToComplete}
        onConfirm={actions.handleConfirmComplete}
      />
    </div>
  );
}

export function DriversPageHeader({ isApprovedDriver, userRole, onListRideClick }: DriversPageHeaderProps) {
  return (
    <div className="bg-primary text-primary-foreground py-4 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium mb-0.5">For Drivers</h1>
          <p className="text-sm text-primary-foreground/80">Manage your rides to University of Calgary</p>
        </div>
        {(isApprovedDriver || userRole === 'admin') ? (
          <Button 
            size="sm" 
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
            onClick={onListRideClick}
          >
            <Plus className="w-4 h-4 mr-1" />
            List a Ride
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline"
            className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20"
            onClick={() => {
              toast.info("Please apply to become a driver in your Profile tab");
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            List a Ride
          </Button>
        )}
      </div>
    </div>
  );
}

export function DriverLoadingState({ message }: DriverLoadingStateProps) {
  return (
    <div className="p-8 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <p className="mt-4 text-muted-foreground">{message}</p>
    </div>
  );
}

