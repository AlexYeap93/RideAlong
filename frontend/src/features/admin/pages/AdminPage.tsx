import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

import { usersAPI, driversAPI, issuesAPI } from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";

import { AdminUsersSection } from "../components/AdminUsersSection";
import { AdminIssuesSection } from "../components/AdminIssuesSection";
import { AdminDriversSection } from "../components/AdminDriversSection";
import { AdminUserDialog } from "../components/dialogs/AdminUserDialog";
import { AdminIssueDialog } from "../components/dialogs/AdminIssueDialog";
import { AdminDriverDialog } from "../components/dialogs/AdminDriverDialog";
import type { AdminUserView, AdminIssueView, AdminPendingDriverView} from "../../../types/index"; 

export function AdminPage() {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [userFilter, setUserFilter] = useState("all");
    const [complaintFilter, setComplaintFilter] = useState("all");

    const [users, setUsers] = useState<any[]>([]);
    const [pendingDrivers, setPendingDrivers] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [isLoadingIssues, setIsLoadingIssues] = useState(false);

    const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
    const [selectedComplaint, setSelectedComplaint] = useState<AdminIssueView | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<AdminPendingDriverView | null>(null);

    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showComplaintDialog, setShowComplaintDialog] = useState(false);
    const [showDriverDialog, setShowDriverDialog] = useState(false);

    // Fetch users, pending drivers, and issues when the page loads or filters change
    useEffect(() => {
        if (user?.role === "admin") {
            fetchUsers();
            fetchPendingDrivers();
            fetchIssues();
        }
    }, [user?.role, complaintFilter]);

    //fetchers
    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const response = await usersAPI.getUsers();
            setUsers(response.data);
        }
        catch (error: any) {
            toast.error("Failed to load users", { description: error.message || "Please try again." });
        }
        finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchPendingDrivers = async () => {
        try {
            const response = await driversAPI.getDrivers();
            const pending = response.data.filter((d: any) => !d.is_approved);
            setPendingDrivers(pending);
        }
        catch (error: any) {
            console.error("Failed to load pending drivers:", error);
        }
    };

    const fetchIssues = async () => {
        setIsLoadingIssues(true);
        try {
            let statusFilter: string | undefined = undefined;
            if (complaintFilter === "open") statusFilter = "open";
            else if (complaintFilter === "under_review") statusFilter = "under_review";
            else if (complaintFilter === "resolved") statusFilter = "resolved";

            const response = await issuesAPI.getIssues({ status: statusFilter, });
            setIssues(response.data);
        }
        catch (error: any) {
            toast.error("Failed to load issues", {
                description: error.message || "Please try again.",
            });
        }
        finally {
            setIsLoadingIssues(false);
        }
    };

    //actions

    const handleSuspendUser = async (u: AdminUserView) => {
        try {
            await usersAPI.suspendUser(u.id.toString());
            toast.success(`User ${u.name} has been suspended`);
            setShowUserDialog(false);
            await fetchUsers();
        }
        catch (error: any) {
            toast.error("Failed to suspend user", {
                description: error.message || "Please try again.",
            });
        }
    };

    const handleActivateUser = async (u: AdminUserView) => {
        try {
            await usersAPI.unsuspendUser(u.id.toString());
            toast.success(`User ${u.name} has been activated`);
            setShowUserDialog(false);
            await fetchUsers();
        }
        catch (error: any) {
            toast.error("Failed to activate user", { description: error.message || "Please try again.", });
        }
    };

    const handleResolveComplaint = async (c: AdminIssueView) => {
        try {
            await issuesAPI.updateIssue(c.id.toString(), { status: "resolved", });
            toast.success("Issue marked as resolved");
            setShowComplaintDialog(false);
            await fetchIssues();
        }
        catch (error: any) {
            toast.error("Failed to resolve issue", { description: error.message || "Please try again.", });
        }
    };

    const handleApproveDriver = async (d: AdminPendingDriverView) => {
        try {
            await driversAPI.approveDriver(d.id.toString());
            toast.success(`${d.name} has been approved as a driver!`);
            setShowDriverDialog(false);
            await fetchPendingDrivers();
        }
        catch (error: any) {
            toast.error("Failed to approve driver", { description: error.message || "Please try again.", });
        }
    };

    const handleRejectDriver = (d: AdminPendingDriverView) => {
        toast.error(`${d.name}'s application has been rejected`);
        setShowDriverDialog(false);
    };

    //derived view models

    const filteredUsers: AdminUserView[] = users.filter((userItem: any) => {
        const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) || userItem.email.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesFilter = true;

        if (userFilter === "driver")
            matchesFilter = userItem.role === "driver";
        else if (userFilter === "rider")
            matchesFilter = userItem.role === "user";
        else if (userFilter === "active")
            matchesFilter = !userItem.is_suspended;
        else if (userFilter === "suspended")
            matchesFilter = !!userItem.is_suspended;

        return matchesSearch && matchesFilter;
    })
        .map((userItem: any): AdminUserView => {
            let rating: number | "N/A" = "N/A";

            if (userItem.driver_id) {
                const avgRatingValue = userItem.average_rating;
                if (avgRatingValue != null && avgRatingValue !== undefined && avgRatingValue !== "") {
                    const numericRating = typeof avgRatingValue === "string" ? parseFloat(avgRatingValue) : Number(avgRatingValue);
                    if (!isNaN(numericRating) && numericRating > 0)
                        rating = parseFloat(numericRating.toFixed(1));
                }
            }

            return {
                id: userItem.id,
                name: userItem.name,
                email: userItem.email,
                type:
                    userItem.role === "driver" ? "Driver" : userItem.role === "admin" ? "Admin" : ("Rider" as const),
                status: userItem.is_suspended ? "Suspended" : "Active",
                is_suspended: !!userItem.is_suspended,
                role: userItem.role,
                address: userItem.address || null,
                city: userItem.city || null,
                province: userItem.province || null,
                postalCode: userItem.postal_code || null,
                joinDate: new Date(userItem.created_at).toISOString().split("T")[0],
                totalRides: userItem.total_rides_offered || 0,
                rating,
            };
        });

    const filteredComplaints: AdminIssueView[] = issues.filter((complaint: any) => {
        const matchesSearch = (complaint.subject || "").toLowerCase().includes(searchTerm.toLowerCase()) || (complaint.reporter_name || "").toLowerCase().includes(searchTerm.toLowerCase());
        const dbStatus = complaint.status || "open";
        const matchesFilter = complaintFilter === "all" || dbStatus === complaintFilter;
        return matchesSearch && matchesFilter;
    })
        .map(
            (complaint: any): AdminIssueView => ({
                id: complaint.id,
                reporter: complaint.reporter_name || "Unknown",
                reportedUser: complaint.reported_user_name || "N/A",
                type: complaint.issue_type || "Other",
                subject: complaint.subject,
                description: complaint.description,
                date: new Date(complaint.created_at).toLocaleDateString(),
                status:
                    complaint.status === "open" ? "Open" : complaint.status === "under_review" ? "Under Review" : complaint.status === "resolved" ? "Resolved" : "Closed",
                priority: complaint.priority || "medium",
                dbStatus: complaint.status,
            })
        );

    const pendingDriversView: AdminPendingDriverView[] = pendingDrivers.map((driver: any) => {
        const driverUser = users.find((u: any) => u.id === driver.user_id);

        return {
            id: driver.id,
            user_id: driver.user_id,
            name: driverUser?.name || "Driver",
            email: driverUser?.email || "",
            phone: driverUser?.phone || "",
            appliedDate: new Date(driver.created_at).toLocaleDateString(),
            available_seats: driver.available_seats,
            license_number: driver.license_number || null,
            insurance_proof: driver.insurance_proof || null,
            car_photo: driver.car_photo || null,
        };
    });

    if (user?.role !== "admin")
        return null;

    const openIssuesCount = issues.filter((c: any) => c.status === "open").length;

    //render

    return (
        <div className="pb-24 bg-background min-h-screen w-full max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b">
                <div className="p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Shield className="w-6 h-6 text-primary" />
                        <h1>Admin Dashboard</h1>
                    </div>

                    {/* Global Search */}
                    <div className="relative">
                        <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Users</p>
                                <p className="font-medium">{users.length}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-orange-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Open Issues</p>
                                <p className="font-medium">{openIssuesCount}</p>
                            </div>
                        </div>
                    </Card>
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Pending Drivers</p>
                                <p className="font-medium">{pendingDriversView.length}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="users" className="w-full max-w-full">
                <TabsList className="grid w-full grid-cols-3 mx-4 my-4 max-w-full overflow-hidden">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="complaints">Issues</TabsTrigger>
                    <TabsTrigger value="drivers">Drivers</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminUsersSection
                        users={filteredUsers}
                        isLoading={isLoadingUsers}
                        userFilter={userFilter}
                        onUserFilterChange={setUserFilter}
                        onUserClick={(u) => {
                            setSelectedUser(u);
                            setShowUserDialog(true);
                        }}
                    />
                </TabsContent>

                <TabsContent value="complaints" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminIssuesSection
                        complaints={filteredComplaints}
                        isLoading={isLoadingIssues}
                        complaintFilter={complaintFilter}
                        onComplaintFilterChange={setComplaintFilter}
                        onComplaintClick={(c) => {
                            setSelectedComplaint(c);
                            setShowComplaintDialog(true);
                        }}
                    />
                </TabsContent>

                <TabsContent value="drivers" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminDriversSection
                        pendingDrivers={pendingDriversView}
                        onDriverClick={(d) => {
                            setSelectedDriver(d);
                            setShowDriverDialog(true);
                        }}
                    />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AdminUserDialog
                open={showUserDialog}
                user={selectedUser}
                onOpenChange={setShowUserDialog}
                onSuspendUser={handleSuspendUser}
                onActivateUser={handleActivateUser}
            />

            <AdminIssueDialog
                open={showComplaintDialog}
                issue={selectedComplaint}
                onOpenChange={setShowComplaintDialog}
                onResolve={handleResolveComplaint}
            />

            <AdminDriverDialog
                open={showDriverDialog}
                driver={selectedDriver}
                onOpenChange={setShowDriverDialog}
                onApprove={handleApproveDriver}
                onReject={handleRejectDriver}
            />
        </div>
    );
}
