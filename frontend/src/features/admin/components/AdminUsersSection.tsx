import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye } from "lucide-react";
import type { adminUserProps } from "../../../serviceInterface";



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

export function AdminUsersSection({
  users,
  isLoading,
  userFilter,
  onUserFilterChange,
  onUserClick,
}: adminUserProps) {
  return (
    <>
      <Select value={userFilter} onValueChange={onUserFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter users" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Users</SelectItem>
          <SelectItem value="driver">Drivers</SelectItem>
          <SelectItem value="rider">Riders</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {u.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium truncate">{u.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {u.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{u.totalRides} Rides</span>
                    <span>•</span>
                    <span>{u.rating === "N/A" ? "N/A" : `★ ${u.rating}`}</span>
                    <span>•</span>
                    <Badge className={`text-xs ${getStatusColor(u.status)}`}>{u.status}</Badge>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onUserClick(u)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
