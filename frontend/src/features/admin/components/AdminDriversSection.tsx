import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Car, FileText, Eye, UserCheck } from "lucide-react";
import type { AdminPendingDriverView } from "../../../types/index";

interface Props { pendingDrivers: AdminPendingDriverView[]; onDriverClick: (driver: AdminPendingDriverView) => void;}

export function AdminDriversSection({ pendingDrivers, onDriverClick }: Props) {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        Review and approve driver applications
      </p>

      <div className="space-y-2">
        {pendingDrivers.map((driver) => (
          <Card key={driver.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-blue-100 text-blue-800">
                  {driver.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{driver.name}</p>
                <p className="text-sm text-muted-foreground truncate">{driver.email}</p>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">Vehicle</span>
                    <Badge variant="secondary" className="text-xs">
                      {driver.available_seats}-seater
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <Badge className={ driver.license_number ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }>
                      <FileText className="w-3 h-3 mr-1" />
                      License
                    </Badge>
                    <Badge className={ driver.insurance_proof ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }>
                      <FileText className="w-3 h-3 mr-1" />
                      Insurance
                    </Badge>
                    <Badge className={ driver.car_photo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800" }>
                      <FileText className="w-3 h-3 mr-1" />
                      Car Photo
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Applied: {driver.appliedDate}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => onDriverClick(driver)}>
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {pendingDrivers.length === 0 && (
        <Card className="p-8 text-center">
          <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No pending driver applications</p>
        </Card>
      )}
    </>
  );
}
