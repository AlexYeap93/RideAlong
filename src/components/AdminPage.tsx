import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  Search, 
  Users, 
  AlertTriangle, 
  UserCheck,
  Ban,
  CheckCircle2,
  XCircle,
  Eye,
  MoreVertical,
  FileText,
  Car,
  Shield
} from "lucide-react";
import { toast } from "sonner@2.0.3";

// Mock data for users
const mockUsers = [
  {
    id: 1,
    name: "Sarah Chen",
    email: "sarah.chen@email.com",
    type: "Driver",
    status: "Active",
    joinDate: "2024-08-15",
    totalRides: 45,
    rating: 4.9
  },
  {
    id: 2,
    name: "Mike Johnson",
    email: "mike.j@email.com",
    type: "Rider",
    status: "Active",
    joinDate: "2024-09-20",
    totalRides: 23,
    rating: 4.7
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.r@email.com",
    type: "Driver",
    status: "Active",
    joinDate: "2024-07-10",
    totalRides: 67,
    rating: 5.0
  },
  {
    id: 4,
    name: "James Wilson",
    email: "james.w@email.com",
    type: "Driver",
    status: "Suspended",
    joinDate: "2024-06-05",
    totalRides: 12,
    rating: 3.8
  },
  {
    id: 5,
    name: "Lisa Anderson",
    email: "lisa.a@email.com",
    type: "Rider",
    status: "Active",
    joinDate: "2024-10-01",
    totalRides: 8,
    rating: 4.5
  },
];

// Mock data for complaints/disputes
const mockComplaints = [
  {
    id: "C001",
    reporter: "Mike Johnson",
    reportedUser: "James Wilson",
    type: "Dispute",
    subject: "Driver arrived 20 minutes late",
    description: "The driver was very late and did not communicate. I missed my class.",
    date: "2024-10-20",
    status: "Open",
    priority: "High"
  },
  {
    id: "C002",
    reporter: "Sarah Chen",
    reportedUser: "David Lee",
    type: "Complaint",
    subject: "Rider was rude and disrespectful",
    description: "Passenger was eating in the car despite being asked not to.",
    date: "2024-10-19",
    status: "Under Review",
    priority: "Medium"
  },
  {
    id: "C003",
    reporter: "Emily Rodriguez",
    reportedUser: "System",
    type: "Technical",
    subject: "Payment not received",
    description: "Completed ride but payment hasn't been credited to my account.",
    date: "2024-10-18",
    status: "Resolved",
    priority: "High"
  },
  {
    id: "C004",
    reporter: "Lisa Anderson",
    reportedUser: "Tom Brown",
    type: "Safety",
    subject: "Unsafe driving behavior",
    description: "Driver was speeding and not following traffic rules.",
    date: "2024-10-21",
    status: "Open",
    priority: "Critical"
  },
];

// Mock data for pending driver applications
const mockPendingDrivers = [
  {
    id: "D001",
    name: "Alex Martinez",
    email: "alex.m@email.com",
    phone: "(403) 555-0123",
    appliedDate: "2024-10-21",
    carModel: "Honda Civic 2020",
    carSeats: 5,
    licenseNumber: "AB-1234567",
    documents: {
      license: true,
      insurance: true,
      carPhoto: true
    }
  },
  {
    id: "D002",
    name: "Rachel Green",
    email: "rachel.g@email.com",
    phone: "(403) 555-0456",
    appliedDate: "2024-10-20",
    carModel: "Toyota Camry 2021",
    carSeats: 5,
    licenseNumber: "AB-7654321",
    documents: {
      license: true,
      insurance: true,
      carPhoto: true
    }
  },
  {
    id: "D003",
    name: "Kevin Park",
    email: "kevin.p@email.com",
    phone: "(403) 555-0789",
    appliedDate: "2024-10-22",
    carModel: "Mazda CX-5 2022",
    carSeats: 7,
    licenseNumber: "AB-9876543",
    documents: {
      license: true,
      insurance: false,
      carPhoto: true
    }
  },
];

export function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [complaintFilter, setComplaintFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [showDriverDialog, setShowDriverDialog] = useState(false);

  // Filter users
  const filteredUsers = mockUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = userFilter === "all" || 
                         user.type.toLowerCase() === userFilter.toLowerCase() ||
                         user.status.toLowerCase() === userFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Filter complaints
  const filteredComplaints = mockComplaints.filter((complaint) => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = complaintFilter === "all" || 
                         complaint.status.toLowerCase() === complaintFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleSuspendUser = (user: any) => {
    toast.success(`User ${user.name} has been suspended`);
    setShowUserDialog(false);
  };

  const handleActivateUser = (user: any) => {
    toast.success(`User ${user.name} has been activated`);
    setShowUserDialog(false);
  };

  const handleResolveComplaint = (complaint: any) => {
    toast.success(`Complaint ${complaint.id} marked as resolved`);
    setShowComplaintDialog(false);
  };

  const handleApproveDriver = (driver: any) => {
    toast.success(`${driver.name} has been approved as a driver!`);
    setShowDriverDialog(false);
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
    <div className="pb-20 bg-background min-h-screen">
      {/* Admin Header */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-primary" />
            <h1>Admin Dashboard</h1>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
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
                <p className="font-medium">{mockUsers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-xs text-muted-foreground">Open Issues</p>
                <p className="font-medium">
                  {mockComplaints.filter(c => c.status === "Open").length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="font-medium">{mockPendingDrivers.length}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mx-4 my-4">
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
        <TabsContent value="users" className="px-4 space-y-4">
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
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{user.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {user.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{user.totalRides} rides</span>
                      <span>•</span>
                      <span>★ {user.rating}</span>
                      <span>•</span>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowUserDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Complaints Tab */}
        <TabsContent value="complaints" className="px-4 space-y-4">
          {/* Filter */}
          <Select value={complaintFilter} onValueChange={setComplaintFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter complaints" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="under review">Under Review</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Complaints List */}
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
        </TabsContent>

        {/* Pending Drivers Tab */}
        <TabsContent value="drivers" className="px-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Review and approve driver applications
          </p>

          {/* Pending Drivers List */}
          <div className="space-y-2">
            {mockPendingDrivers.map((driver) => (
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
                        <span className="text-sm">{driver.carModel}</span>
                        <Badge variant="secondary" className="text-xs">
                          {driver.carSeats}-seater
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mt-2">
                        <Badge className={driver.documents.license ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          <FileText className="w-3 h-3 mr-1" />
                          License
                        </Badge>
                        <Badge className={driver.documents.insurance ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          <FileText className="w-3 h-3 mr-1" />
                          Insurance
                        </Badge>
                        <Badge className={driver.documents.carPhoto ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                          <FileText className="w-3 h-3 mr-1" />
                          Car Photo
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Applied: {driver.appliedDate}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedDriver(driver);
                      setShowDriverDialog(true);
                    }}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {mockPendingDrivers.length === 0 && (
            <Card className="p-8 text-center">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No pending driver applications</p>
            </Card>
          )}
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
                  <p className="font-medium">★ {selectedUser.rating}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {selectedUser?.status === "Active" ? (
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
                  <p className="font-medium">{selectedComplaint.reportedUser}</p>
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
            {selectedComplaint?.status !== "Resolved" && (
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
