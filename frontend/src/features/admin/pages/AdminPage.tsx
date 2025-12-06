import { useEffect, useReducer } from "react";
import { Shield } from "lucide-react";
import { toast } from "sonner";

import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

import { usersAPI } from "../../../services/UserServices";
import { driversAPI } from "../../../services/DriverServices";
import { issuesAPI } from "../../../services/IssueServices";

import { useAuth } from "../../../contexts/AuthContext";

import { AdminUsersSection } from "../components/AdminUsersSection";
import { AdminIssuesSection } from "../components/AdminIssuesSection";
import { AdminDriversSection } from "../components/AdminDriversSection";
import { AdminUserDialog } from "../components/dialogs/AdminUserDialog";
import { AdminIssueDialog } from "../components/dialogs/AdminIssueDialog";
import { AdminDriverDialog } from "../components/dialogs/AdminDriverDialog";
import type { AdminUserView, AdminIssueView, AdminPendingDriverView, AdminPageState} from "../../../types/api_interfaces"; 


type AdminPageAction =
    | { type: 'SET_SEARCH_TERM'; payload: string }
    | { type: 'SET_USER_FILTER'; payload: string }
    | { type: 'SET_COMPLAINT_FILTER'; payload: string }
    | { type: 'SET_USERS'; payload: any[] }
    | { type: 'SET_PENDING_DRIVERS'; payload: any[] }
    | { type: 'SET_ISSUES'; payload: any[] }
    | { type: 'SET_IS_LOADING_USERS'; payload: boolean }
    | { type: 'SET_IS_LOADING_ISSUES'; payload: boolean }
    | { type: 'SET_SELECTED_USER'; payload: AdminUserView | null }
    | { type: 'SET_SELECTED_COMPLAINT'; payload: AdminIssueView | null }
    | { type: 'SET_SELECTED_DRIVER'; payload: AdminPendingDriverView | null }
    | { type: 'SET_SHOW_USER_DIALOG'; payload: boolean }
    | { type: 'SET_SHOW_COMPLAINT_DIALOG'; payload: boolean }
    | { type: 'SET_SHOW_DRIVER_DIALOG'; payload: boolean };

const initialState: AdminPageState = {
    searchTerm: "",
    userFilter: "all",
    complaintFilter: "all",
    users: [],
    pendingDrivers: [],
    issues: [],
    isLoadingUsers: false,
    isLoadingIssues: false,
    selectedUser: null,
    selectedComplaint: null,
    selectedDriver: null,
    showUserDialog: false,
    showComplaintDialog: false,
    showDriverDialog: false,
};

function adminPageReducer(state: AdminPageState, action: AdminPageAction): AdminPageState {
    switch (action.type) {
        case 'SET_SEARCH_TERM':
            return { ...state, searchTerm: action.payload };
        case 'SET_USER_FILTER':
            return { ...state, userFilter: action.payload };
        case 'SET_COMPLAINT_FILTER':
            return { ...state, complaintFilter: action.payload };
        case 'SET_USERS':
            return { ...state, users: action.payload };
        case 'SET_PENDING_DRIVERS':
            return { ...state, pendingDrivers: action.payload };
        case 'SET_ISSUES':
            return { ...state, issues: action.payload };
        case 'SET_IS_LOADING_USERS':
            return { ...state, isLoadingUsers: action.payload };
        case 'SET_IS_LOADING_ISSUES':
            return { ...state, isLoadingIssues: action.payload };
        case 'SET_SELECTED_USER':
            return { ...state, selectedUser: action.payload };
        case 'SET_SELECTED_COMPLAINT':
            return { ...state, selectedComplaint: action.payload };
        case 'SET_SELECTED_DRIVER':
            return { ...state, selectedDriver: action.payload };
        case 'SET_SHOW_USER_DIALOG':
            return { ...state, showUserDialog: action.payload };
        case 'SET_SHOW_COMPLAINT_DIALOG':
            return { ...state, showComplaintDialog: action.payload };
        case 'SET_SHOW_DRIVER_DIALOG':
            return { ...state, showDriverDialog: action.payload };
        default:
            return state;
    }
}

export function AdminPage() {
    const { user } = useAuth();
    const [state, dispatch] = useReducer(adminPageReducer, initialState);

    // Fetch users, pending drivers, and issues when the page loads or filters change
    useEffect(() => {
        if (user?.role === "admin") {
            fetchUsers();
            fetchPendingDrivers();
            fetchIssues();
        }
    }, [user?.role, state.complaintFilter]);

    //fetchers
    const fetchUsers = async () => {
        dispatch({ type: 'SET_IS_LOADING_USERS', payload: true });
        try {
            const response = await usersAPI.getUsers();
            dispatch({ type: 'SET_USERS', payload: response.data });
        }
        catch (error: any) {
            toast.error("Failed to load users", { description: error.message || "Please try again." });
        }
        finally {
            dispatch({ type: 'SET_IS_LOADING_USERS', payload: false });
        }
    };

    const fetchPendingDrivers = async () => {
        try {
            const response = await driversAPI.getDrivers();
            const pending = response.data.filter((d: any) => !d.is_approved);
            dispatch({ type: 'SET_PENDING_DRIVERS', payload: pending });
        }
        catch (error: any) {
            console.error("Failed to load pending drivers:", error);
        }
    };

    const fetchIssues = async () => {
        dispatch({ type: 'SET_IS_LOADING_ISSUES', payload: true });
        try {
            let statusFilter: string | undefined = undefined;
            if (state.complaintFilter === "open") statusFilter = "open";
            else if (state.complaintFilter === "under_review") statusFilter = "under_review";
            else if (state.complaintFilter === "resolved") statusFilter = "resolved";

            const response = await issuesAPI.getIssues({ status: statusFilter, });
            dispatch({ type: 'SET_ISSUES', payload: response.data });
        }
        catch (error: any) {
            toast.error("Failed to load issues", {
                description: error.message || "Please try again.",
            });
        }
        finally {
            dispatch({ type: 'SET_IS_LOADING_ISSUES', payload: false });
        }
    };

    //actions

    const handleSuspendUser = async (u: AdminUserView) => {
        try {
            await usersAPI.suspendUser(u.id.toString());
            toast.success(`User ${u.name} has been suspended`);
            dispatch({ type: 'SET_SHOW_USER_DIALOG', payload: false });
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
            dispatch({ type: 'SET_SHOW_USER_DIALOG', payload: false });
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
            dispatch({ type: 'SET_SHOW_COMPLAINT_DIALOG', payload: false });
            await fetchIssues();
        }
        catch (error: any) {
            toast.error("Failed to resolve issue", { description: error.message || "Please try again.", });
        }
    };

    const handleReopenComplaint = async (c: AdminIssueView) => {
        try {
            await issuesAPI.updateIssue(c.id.toString(), { status: "open", });
            toast.success("Issue reopened");
            dispatch({ type: 'SET_SHOW_COMPLAINT_DIALOG', payload: false });
            await fetchIssues();
        }
        catch (error: any) {
            toast.error("Failed to reopen issue", { description: error.message || "Please try again.", });
        }
    };

    const handleUnderReviewComplaint = async (c: AdminIssueView) => {
        try {
            await issuesAPI.updateIssue(c.id.toString(), { status: "under_review", });
            toast.success("Issue marked as under review");
            dispatch({ type: 'SET_SHOW_COMPLAINT_DIALOG', payload: false });
            await fetchIssues();
        }
        catch (error: any) {
            toast.error("Failed to update issue", { description: error.message || "Please try again.", });
        }
    };

    const handleApproveDriver = async (d: AdminPendingDriverView) => {
        try {
            await driversAPI.approveDriver(d.id.toString());
            toast.success(`${d.name} has been approved as a driver!`);
            dispatch({ type: 'SET_SHOW_DRIVER_DIALOG', payload: false });
            await fetchPendingDrivers();
        }
        catch (error: any) {
            toast.error("Failed to approve driver", { description: error.message || "Please try again.", });
        }
    };

    const handleRejectDriver = (d: AdminPendingDriverView) => {
        toast.error(`${d.name}'s application has been rejected`);
        dispatch({ type: 'SET_SHOW_DRIVER_DIALOG', payload: false });
    };

    //derived view models

    const filteredUsers: AdminUserView[] = state.users.filter((userItem: any) => {
        const matchesSearch = userItem.name.toLowerCase().includes(state.searchTerm.toLowerCase()) || userItem.email.toLowerCase().includes(state.searchTerm.toLowerCase());

        let matchesFilter = true;

        if (state.userFilter === "driver")
            matchesFilter = userItem.role === "driver";
        else if (state.userFilter === "rider")
            matchesFilter = userItem.role === "user";
        else if (state.userFilter === "active")
            matchesFilter = !userItem.is_suspended;
        else if (state.userFilter === "suspended")
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

    const filteredComplaints: AdminIssueView[] = state.issues.filter((complaint: any) => {
        const searchLower = state.searchTerm.toLowerCase();
        const matchesSearch = state.searchTerm === "" || 
            (complaint.subject || "").toLowerCase().includes(searchLower) || 
            (complaint.reporter_name || "").toLowerCase().includes(searchLower) ||
            (complaint.reported_user_name || "").toLowerCase().includes(searchLower) ||
            (complaint.description || "").toLowerCase().includes(searchLower) ||
            (complaint.issue_type || "").toLowerCase().includes(searchLower);
        const dbStatus = complaint.status || "open";
        const matchesFilter = state.complaintFilter === "all" || dbStatus === state.complaintFilter;
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

    const pendingDriversView: AdminPendingDriverView[] = state.pendingDrivers.map((driver: any) => {
        const driverUser = state.users.find((u: any) => u.id === driver.user_id);

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

    const openIssuesCount = state.issues.filter((c: any) => c.status === "open").length;

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
                        <Input placeholder="Search..." value={state.searchTerm} onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}/>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                    <Card className="p-3">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-xs text-muted-foreground">Total Users</p>
                                <p className="font-medium">{state.users.length}</p>
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
                                <p className="text-xs text-muted-foreground">Pending Applications</p>
                                <p className="font-medium">{pendingDriversView.length}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="users" className="w-full max-w-full">
                <TabsList className="flex w-full overflow-x-auto px-4 my-4 gap-2 max-w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <TabsTrigger value="users" className="min-w-[110px]">Users</TabsTrigger>
                    <TabsTrigger value="complaints" className="min-w-[110px]">Issues</TabsTrigger>
                    <TabsTrigger value="drivers" className="min-w-[130px]">Applications</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminUsersSection
                        users={filteredUsers}
                        isLoading={state.isLoadingUsers}
                        userFilter={state.userFilter}
                        onUserFilterChange={(filter) => dispatch({ type: 'SET_USER_FILTER', payload: filter })}
                        onUserClick={(u) => {
                            dispatch({ type: 'SET_SELECTED_USER', payload: u });
                            dispatch({ type: 'SET_SHOW_USER_DIALOG', payload: true });
                        }}
                    />
                </TabsContent>

                <TabsContent value="complaints" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminIssuesSection
                        complaints={filteredComplaints}
                        isLoading={state.isLoadingIssues}
                        complaintFilter={state.complaintFilter}
                        onComplaintFilterChange={(filter) => dispatch({ type: 'SET_COMPLAINT_FILTER', payload: filter })}
                        onComplaintClick={(c) => {
                            dispatch({ type: 'SET_SELECTED_COMPLAINT', payload: c });
                            dispatch({ type: 'SET_SHOW_COMPLAINT_DIALOG', payload: true });
                        }}
                    />
                </TabsContent>

                <TabsContent value="drivers" className="px-4 space-y-4 w-full max-w-full overflow-x-hidden">
                    <AdminDriversSection
                        pendingDrivers={pendingDriversView}
                        onDriverClick={(d) => {
                            dispatch({ type: 'SET_SELECTED_DRIVER', payload: d });
                            dispatch({ type: 'SET_SHOW_DRIVER_DIALOG', payload: true });
                        }}
                    />
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <AdminUserDialog
                open={state.showUserDialog}
                user={state.selectedUser}
                onOpenChange={(open) => dispatch({ type: 'SET_SHOW_USER_DIALOG', payload: open })}
                onSuspendUser={handleSuspendUser}
                onActivateUser={handleActivateUser}
            />

            <AdminIssueDialog
                open={state.showComplaintDialog}
                issue={state.selectedComplaint}
                onOpenChange={(open) => dispatch({ type: 'SET_SHOW_COMPLAINT_DIALOG', payload: open })}
                onResolve={handleResolveComplaint}
                onReopen={handleReopenComplaint}
                onUnderReview={handleUnderReviewComplaint}
            />

            <AdminDriverDialog
                open={state.showDriverDialog}
                driver={state.selectedDriver}
                onOpenChange={(open) => dispatch({ type: 'SET_SHOW_DRIVER_DIALOG', payload: open })}
                onApprove={handleApproveDriver}
                onReject={handleRejectDriver}
            />
        </div>
    );
}
