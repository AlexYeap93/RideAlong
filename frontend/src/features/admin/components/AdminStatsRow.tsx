import { Card } from "../../../components/ui/card";
import { Users, AlertTriangle, UserCheck } from "lucide-react";
import { useAdminUsers } from "../hooks/useAdminUsers";
import { useAdminIssues } from "../hooks/useAdminIssues";
import { useAdminDrivers } from "../hooks/useAdminDrivers";

export function AdminStatsRow() {
  const { users } = useAdminUsers();
  const { issues } = useAdminIssues();
  const { pendingDrivers } = useAdminDrivers();

  return (
    <div className="grid grid-cols-3 gap-2 px-4 pb-4">
      <Card className="p-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="font-medium">{users.length}</p>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-orange-600" />
          <div>
            <p className="text-xs text-muted-foreground">Open Issues</p>
            <p className="font-medium">
              {issues.filter(i => i.status === "open").length}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="font-medium">{pendingDrivers.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
