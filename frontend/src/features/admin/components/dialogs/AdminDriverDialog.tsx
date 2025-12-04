import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Button } from "../../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { Car, CheckCircle2, FileText, XCircle } from "lucide-react";
import type {  adminDriverDialogProps } from "../../../../serviceInterface";


export function AdminDriverDialog({ open, driver, onOpenChange, onApprove, onReject,}: adminDriverDialogProps) 
{
  if (!driver) return null;

  const documents = { license: !!driver.license_number, insurance: !!driver.insurance_proof, carPhoto: !!driver.car_photo,};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Driver Application</DialogTitle>
          <DialogDescription>Review application and documents</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-16 h-16">
              <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                {driver.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{driver.name}</p>
              <p className="text-sm text-muted-foreground">{driver.email}</p>
              <p className="text-sm text-muted-foreground">{driver.phone}</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">Vehicle</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Available Seats</p>
              <p className="font-medium">{driver.available_seats} seats</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">License Number</p>
              <p className="font-medium font-mono">{driver.license_number || "-"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Documents</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={ documents.license ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {documents.license ? (<CheckCircle2 className="w-3 h-3 mr-1" /> ) : ( <XCircle className="w-3 h-3 mr-1" /> )}
                  Driver&apos;s License
                </Badge>
                <Badge className={ documents.insurance ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {documents.insurance ? ( <CheckCircle2 className="w-3 h-3 mr-1" /> ) : ( <XCircle className="w-3 h-3 mr-1" /> )}
                  Insurance
                </Badge>
                <Badge className={ documents.carPhoto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                  {documents.carPhoto ? ( <CheckCircle2 className="w-3 h-3 mr-1" /> ) : ( <XCircle className="w-3 h-3 mr-1" /> )}
                  Car Photo
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applied On</p>
              <p className="font-medium">{driver.appliedDate}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button onClick={() => onApprove(driver)} className="w-full sm:w-auto">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Approve Driver
          </Button>
          <Button variant="destructive" onClick={() => onReject(driver)} className="w-full sm:w-auto">
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
