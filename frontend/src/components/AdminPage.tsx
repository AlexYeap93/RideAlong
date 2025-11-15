import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter} from "./ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "./ui/select";
import { Users, AlertTriangle, UserCheck, Ban, CheckCircle2, XCircle, Eye, FileText, Car, Shield, MapPin } from "lucide-react";
import { toast } from "sonner";
import { usersAPI, driversAPI, issuesAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Admin Page for Admin to manage users, drivers, and issues
export function AdminPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingIssues, setIsLoadingIssues] = useState(false);

  //Fetch for the 3 tabs
  useEffect(() => { // Fetch users, pending drivers, and issues when the page loads
    if (user?.role === 'admin') {
      fetchUsers();
      fetchPendingDrivers();
      fetchIssues();
    }
  }, [user?.role, complaintFilter]);

  // Fetch users from database
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await usersAPI.getUsers();
      setUsers(response.data);
    } 
    catch (error: any) {
      toast.error("Failed to load users", {
        description: error.message || "Please try again.",
      });
    } 
    finally {
      setIsLoading(false);
    }
  };

  // Fetch pending driver application from database
  const fetchPendingDrivers = async () => {
    try {
      const response = await driversAPI.getDrivers();
      // Filter for unapproved drivers
      const pending = response.data.filter((d: any) => !d.is_approved);
      setPendingDrivers(pending);
    } 
    catch (error: any) {
      console.error("Failed to load pending drivers:", error);
    }
  };

  // Fetch issues from database
  const fetchIssues = async () => {
    setIsLoadingIssues(true);
    try {
      // Map filter value to database status
      let statusFilter = undefined;
      if (complaintFilter === 'open') {
        statusFilter = 'open';
      } 
      else if (complaintFilter === 'under_review') {
        statusFilter = 'under_review';
      } 
      else if (complaintFilter === 'resolved') {
        statusFilter = 'resolved';
      }
      
      const response = await issuesAPI.getIssues({
        status: statusFilter,
      });
      setIssues(response.data);
    } catch (error: any) {
      toast.error("Failed to load issues", {
        description: error.message || "Please try again.",
      });
    } 
    finally {
      setIsLoadingIssues(false);
    }
  };

  // Filter users - show all users including drivers
  const filteredUsers = users.filter((userItem: any) => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (userFilter === "driver") {
      matchesFilter = userItem.role === 'driver';
    } 
    else if (userFilter === "rider") {
      matchesFilter = userItem.role === 'user';
    } 
    else if (userFilter === "active") {
      matchesFilter = !userItem.is_suspended;
    } 
    else if (userFilter === "suspended") {
      matchesFilter = userItem.is_suspended === true;
    }
    // "all" shows everyone
    
    return matchesSearch && matchesFilter;
  }).map((userItem: any) => {
    // Get rating for drivers - average all ratings for that driver
    // Check for both driver role AND admin role (since admin can have driver profile)
    let rating: string | number = 'N/A';
    
    // If user has a driver_id, they have a driver profile and can have ratings
    if (userItem.driver_id) {
      // Check if average_rating exists and is a valid number
      const avgRatingValue = userItem.average_rating;
      
      if (avgRatingValue != null && avgRatingValue !== undefined && avgRatingValue !== '') {
        // Handle both string and number types
        const numericRating = typeof avgRatingValue === 'string' 
          ? parseFloat(avgRatingValue) 
          : Number(avgRatingValue);
        
        // If it's a valid number and greater than 0, use it
        if (!isNaN(numericRating) && numericRating > 0) {
          rating = parseFloat(numericRating.toFixed(1));
        }
      }
    }
    
    return {
      id: userItem.id,
      name: userItem.name,
      email: userItem.email,
      type: userItem.role === 'driver' ? 'Driver' : userItem.role === 'admin' ? 'Admin' : 'Rider',
      status: userItem.is_suspended ? 'Suspended' : 'Active',
      is_suspended: userItem.is_suspended || false,
      role: userItem.role,
      address: userItem.address || null,
      latitude: userItem.latitude || null,
      longitude: userItem.longitude || null,
      joinDate: new Date(userItem.created_at).toISOString().split('T')[0],
      totalRides: userItem.total_rides_offered || 0,
      rating: rating, //from rating database after fetching the average ratings from riders
    };
  });

  // Filter complaints from database
  const filteredComplaints = issues.filter((complaint: any) => {
    const matchesSearch = (complaint.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (complaint.reporter_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Map database status to filter status
    const dbStatus = complaint.status || 'open';
    
    const matchesFilter = complaintFilter === "all" || dbStatus === complaintFilter;
    return matchesSearch && matchesFilter;
  }).map((complaint: any) => ({
    id: complaint.id,
    reporter: complaint.reporter_name || 'Unknown',
    reportedUser: complaint.reported_user_name || 'N/A',
    type: complaint.issue_type || 'Other',
    subject: complaint.subject,
    description: complaint.description,
    date: new Date(complaint.created_at).toLocaleDateString(),
    status: complaint.status === 'open' ? 'Open' : 
            complaint.status === 'under_review' ? 'Under Review' :
            complaint.status === 'resolved' ? 'Resolved' : 'Closed',
    priority: complaint.priority || 'medium',
    dbStatus: complaint.status, // Keep original for API calls
  }));

  const handleSuspendUser = async (user: any) => {
    try {
      await usersAPI.suspendUser(user.id);
      toast.success(`User ${user.name} has been suspended`);
      setShowUserDialog(false);
      await fetchUsers(); // Refresh users list
    } 
    catch (error: any) {
      toast.error("Failed to suspend user", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleActivateUser = async (user: any) => {
    try {
      await usersAPI.unsuspendUser(user.id);
      toast.success(`User ${user.name} has been activated`);
      setShowUserDialog(false);
      await fetchUsers(); // Refresh users list
    } 
    catch (error: any) {
      toast.error("Failed to activate user", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleResolveComplaint = async (complaint: any) => {
    try {
      await issuesAPI.updateIssue(complaint.id, {
        status: 'resolved',
      });
      toast.success(`Issue marked as resolved`);
      setShowComplaintDialog(false);
      await fetchIssues();
    } 
    catch (error: any) {
      toast.error("Failed to resolve issue", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleApproveDriver = async (driver: any) => {
    try {
      await driversAPI.approveDriver(driver.id);
      toast.success(`${driver.name} has been approved as a driver!`);
      setShowDriverDialog(false);
      await fetchPendingDrivers();
    } 
    catch (error: any) {
      toast.error("Failed to approve driver", {
        description: error.message || "Please try again.",
      });
    }
  };

  const handleRejectDriver = (driver: any) => {
    toast.error(`${driver.name}'s application has been rejected`);
    setShowDriverDialog(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      case "open":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-gray-100 text-gray-800";
      case "under review":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="pb-24 bg-background min-h-screen w-full max-w-full overflow-x-hidden">
      {/* Admin Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1>Admin Dashboard</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Cards */}
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
                  {issues.filter((c: any) => c.status === 'open').length}
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
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full max-w-full">
        <TabsList className="grid w-full grid-cols-4 mx-4 my-4 max-w-full overflow-hidden">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="complaints">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="drivers">
            <UserCheck className="w-4 h-4 mr-2" />
            Drivers
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
          {/* Filter */}
          <Select value={userFilter} onValueChange={setUserFilter}>
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

          {/* Users List */}
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((userItem) => (
                <Card key={userItem.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {userItem.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{userItem.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {userItem.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{userItem.email}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span>{userItem.totalRides} rides</span>
                        <span>•</span>
                        <span>{userItem.rating === 'N/A' ? 'N/A' : `★ ${userItem.rating}`}</span>
                        <span>•</span>
                        <Badge className={`text-xs ${getStatusColor(userItem.status)}`}>
                          {userItem.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(userItem);
                        setShowUserDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
          {/* Filter */}
          <Select value={complaintFilter} onValueChange={setComplaintFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter complaints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Complaints List */}
          {isLoadingIssues ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading issues...</p>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No issues found</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredComplaints.map((complaint) => (
              <Card key={complaint.id} className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{complaint.subject}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {complaint.description}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {complaint.type}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        • {complaint.date}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Reported by: {complaint.reporter}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedComplaint(complaint);
                      setShowComplaintDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            </div>
          )}
        </TabsContent>

        {/* Pending Drivers Tab */}
        <TabsContent value="drivers" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
          <p className="text-sm text-muted-foreground">
            Review and approve driver applications
          </p>

          {/* Pending Drivers List */}
          <div className="space-y-2">
            {pendingDrivers.map((driver: any) => {
              // Get user info for this driver
              const driverUser = users.find((u: any) => u.id === driver.user_id);
              return (
                <Card key={driver.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-blue-100 text-blue-800">
                        {driverUser?.name?.charAt(0) || 'D'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{driverUser?.name || 'Driver'}</p>
                      <p className="text-sm text-muted-foreground truncate">{driverUser?.email || ''}</p>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2">
                          <Car className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">Vehicle</span>
                          <Badge variant="secondary" className="text-xs">
                            {driver.available_seats}-seater
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mt-2">
                          <Badge className={driver.license_number ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            <FileText className="w-3 h-3 mr-1" />
                            License
                          </Badge>
                          <Badge className={driver.insurance_proof ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            <FileText className="w-3 h-3 mr-1" />
                            Insurance
                          </Badge>
                          <Badge className={driver.car_photo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            <FileText className="w-3 h-3 mr-1" />
                            Car Photo
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Applied: {new Date(driver.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedDriver({
                          id: driver.id,
                          name: driverUser?.name || 'Driver',
                          email: driverUser?.email || '',
                          phone: driverUser?.phone || '',
                          appliedDate: new Date(driver.created_at).toLocaleDateString(),
                          carModel: 'Vehicle',
                          carSeats: driver.available_seats,
                          licenseNumber: driver.license_number || '',
                          documents: {
                            license: !!driver.license_number,
                            insurance: !!driver.insurance_proof,
                            carPhoto: !!driver.car_photo,
                          },
                        });
                        setShowDriverDialog(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {pendingDrivers.length === 0 && (
            <Card className="p-8 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending driver applications</p>
            </Card>
          )}
        </TabsContent>

        {/* Settings/Addresses Tab */}
        <TabsContent value="settings" className="px-4 space-y-4">
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={userFilter} onValueChange={setUserFilter}>
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading addresses...</p>
              </div>
            ) : (
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
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((userItem: any) => {
                        return (
                          <TableRow key={userItem.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {userItem.name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                {userItem.name}
                              </div>
                            </TableCell>
                            <TableCell>{userItem.email}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={userItem.type === 'Driver' ? 'default' : userItem.type === 'Admin' ? 'secondary' : 'outline'}
                              >
                                {userItem.type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={userItem.status === 'Active' ? 'default' : 'destructive'}>
                                {userItem.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {userItem.address ? (
                                <div className="flex items-center gap-1 text-sm">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span>{userItem.address}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              {userItem.latitude && userItem.longitude ? (
                                <div className="text-xs font-mono">
                                  <div>{parseFloat(userItem.latitude).toFixed(6)},</div>
                                  <div>{parseFloat(userItem.longitude).toFixed(6)}</div>
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-sm">Not set</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedUser(userItem);
                                  setShowUserDialog(true);
                                }}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Summary Statistics */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Total Users</div>
                <div className="text-2xl font-bold mt-1">{users.length}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">Drivers</div>
                <div className="text-2xl font-bold mt-1">
                  {users.filter((u: any) => u.role === 'driver').length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">With Address</div>
                <div className="text-2xl font-bold mt-1">
                  {users.filter((u: any) => u.address).length}
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground">With Coordinates</div>
                <div className="text-2xl font-bold mt-1">
                  {users.filter((u: any) => u.latitude && u.longitude).length}
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Manage user account and activity
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {selectedUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <Badge className={`text-xs mt-1 ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">User Type</p>
                  <p className="font-medium">{selectedUser.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Join Date</p>
                  <p className="font-medium">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Rides</p>
                  <p className="font-medium">{selectedUser.totalRides}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="font-medium">{selectedUser.rating === 'N/A' ? 'N/A' : `★ ${selectedUser.rating}`}</p>
                </div>
              </div>

              {/* Address Information */}
              <div className="pt-4 border-t space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Information
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-sm">
                      {selectedUser.address || <span className="text-muted-foreground">Not set</span>}
                    </p>
                  </div>
                  {(selectedUser.latitude && selectedUser.longitude) ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Latitude</p>
                        <p className="font-mono text-sm">{parseFloat(selectedUser.latitude).toFixed(6)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Longitude</p>
                        <p className="font-mono text-sm">{parseFloat(selectedUser.longitude).toFixed(6)}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground">Coordinates</p>
                      <p className="text-sm text-muted-foreground">Not set</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedUser?.role !== 'admin' && (
              selectedUser?.status === "Active" ? (
                <Button 
                  variant="destructive" 
                  onClick={() => handleSuspendUser(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  <Ban className="w-4 h-4 mr-2" />
                  Suspend User
                </Button>
              ) : (
                <Button 
                  variant="default" 
                  onClick={() => handleActivateUser(selectedUser)}
                  className="w-full sm:w-auto"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Activate User
                </Button>
              )
            )}
            {selectedUser?.role === 'admin' && (
              <p className="text-sm text-muted-foreground">Admin users cannot be suspended</p>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowUserDialog(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Details Dialog */}
      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Issue Details</DialogTitle>
            <DialogDescription>
              Review and resolve complaint
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`text-xs ${getPriorityColor(selectedComplaint.priority)}`}>
                    {selectedComplaint.priority}
                  </Badge>
                  <Badge className={`text-xs ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </Badge>
                </div>
                <h3 className="font-medium">{selectedComplaint.subject}</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedComplaint.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Reporter</p>
                  <p className="font-medium">{selectedComplaint.reporter}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reported User</p>
                  <p className="font-medium">{selectedComplaint.reportedUser || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">{selectedComplaint.type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{selectedComplaint.date}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedComplaint?.dbStatus !== "resolved" && (
              <Button 
                onClick={() => handleResolveComplaint(selectedComplaint)}
                className="w-full sm:w-auto"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowComplaintDialog(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Driver Application Dialog */}
      <Dialog open={showDriverDialog} onOpenChange={setShowDriverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Application</DialogTitle>
            <DialogDescription>
              Review application and documents
            </DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-blue-100 text-blue-800 text-xl">
                    {selectedDriver.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedDriver.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.email}</p>
                  <p className="text-sm text-muted-foreground">{selectedDriver.phone}</p>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle</p>
                  <p className="font-medium">{selectedDriver.carModel}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available Seats</p>
                  <p className="font-medium">{selectedDriver.carSeats} seats</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-medium font-mono">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Documents</p>
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={selectedDriver.documents.license ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedDriver.documents.license ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Driver's License
                    </Badge>
                    <Badge className={selectedDriver.documents.insurance ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedDriver.documents.insurance ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Insurance
                    </Badge>
                    <Badge className={selectedDriver.documents.carPhoto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {selectedDriver.documents.carPhoto ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                      Car Photo
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applied On</p>
                  <p className="font-medium">{selectedDriver.appliedDate}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              onClick={() => handleApproveDriver(selectedDriver)}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve Driver
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => handleRejectDriver(selectedDriver)}
              className="w-full sm:w-auto"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowDriverDialog(false)}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
