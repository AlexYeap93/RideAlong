import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Ban, CheckCircle2, MapPin } from "lucide-react";
import type { adminUserDialogProps } from "../../../../serviceInterface";

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-800";
    case "suspended":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};


export function AdminUserDialog({ open, user, onOpenChange, onSuspendUser, onActivateUser,}: adminUserDialogProps) 
{
  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Manage user account and activity</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge className={`text-xs mt-1 ${getStatusColor(user.status)}`}>{user.status}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">User Type</p>
              <p className="font-medium">{user.type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Join Date</p>
              <p className="font-medium">{user.joinDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Rides</p>
              <p className="font-medium">{user.totalRides}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rating</p>
              <p className="font-medium">
                {user.rating === "N/A" ? "N/A" : `★ ${user.rating}`}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location Information
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-sm">
                  {user.address || <span className="text-muted-foreground">Not set</span>}
                </p>
              </div>
              {user.city || user.province || user.postalCode ? (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">City</p>
                    <p className="text-sm">
                      {user.city || <span className="text-muted-foreground">N/A</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Province</p>
                    <p className="text-sm">
                      {user.province || <span className="text-muted-foreground">N/A</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postal Code</p>
                    <p className="text-sm">
                      {user.postalCode || <span className="text-muted-foreground">N/A</span>}
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Location Details</p>
                  <p className="text-sm text-muted-foreground">Not set</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isAdmin && (
            user.status === "Active" ? (
              <Button  variant="destructive"  onClick={() => onSuspendUser(user)}  className="w-full sm:w-auto">
                <Ban className="w-4 h-4 mr-2" />
                Suspend User
              </Button>
            ) : (
              <Button  variant="default"  onClick={() => onActivateUser(user)}  className="w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Activate User
              </Button>
            )
          )}
          {isAdmin && (
            <p className="text-sm text-muted-foreground">
              Admin users cannot be suspended
            </p>
          )}
          <Button  variant="outline"  onClick={() => onOpenChange(false)}  className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
