import { MapPin } from "lucide-react";
import { Input } from "../../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { settingsProps } from "../../../serviceInterface";


export function AdminSettingsSection({ users, isLoading, userFilter, onUserFilterChange, searchTerm, onSearchTermChange, onUserClick,}: settingsProps) 
{
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            User Addresses & Locations
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and compare addresses for all drivers and riders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-64"
          />
          <Select value={userFilter} onValueChange={onUserFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="driver">Drivers Only</SelectItem>
              <SelectItem value="rider">Riders Only</SelectItem>
              <SelectItem value="admin">Admins Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading addresses...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Coordinates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {u.name.split(" ").map((n: string) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          {u.name}
                        </div>
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge variant={u.type === "Driver" ? "default" : u.type === "Admin" ? "secondary" : "outline"}>
                          {u.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.status === "Active" ? "default" : "destructive"}>
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.address ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            <span>{u.address}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.city || u.province || u.postalCode ? (
                          <div className="text-xs">
                            <div>{u.city || 'N/A'}, {u.province || 'N/A'}</div>
                            <div>{u.postalCode || 'N/A'}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => onUserClick(u)}>
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Total Users</div>
              <div className="text-2xl font-bold mt-1">{users.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Drivers</div>
              <div className="text-2xl font-bold mt-1">
                {users.filter((u) => u.type === "Driver").length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">With Address</div>
              <div className="text-2xl font-bold mt-1">
                {users.filter((u) => u.address).length}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">With Coordinates</div>
              <div className="text-2xl font-bold mt-1">
                {users.filter((u) => u.city || u.province || u.postalCode).length}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
