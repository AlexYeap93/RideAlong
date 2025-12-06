import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./features/home/pages/HomePage";
import { DriversPage } from "./features/driver/components/DriversPage";
import { UsersPage } from "./features/settings/pages/UsersPage";
import { ProfilePage } from "./features/profile/pages/ProfilePage";
import { AdminPage } from "./features/admin/pages/AdminPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RideHistory } from "./features/ride/components/RideHistory";
import { PaymentMethods } from "./features/payments/pages/PaymentMethods";
import { SettingsPage } from "./features/shared/pages/SettingsPage";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";



export default function App() {
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("home");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const seg = location.pathname.split("/")[1];
    const tab = seg && seg !== "" ? seg : "home";
    setActiveTab(tab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const route = tab === "home" ? "/" : `/${tab}`;
    navigate(route);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/drivers" element={<DriversPage />} />
        <Route path="/users" element={<UsersPage onNavigateToHome={() => { 
          navigate("/");
          setTimeout(() => {
            window.location.hash = `home/timeslots/${encodeURIComponent("University of Calgary")}`;
          }, 0);
        }} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={isAdmin ? <AdminPage /> : <Navigate to="/" />} />
        <Route path="/rideHistory" element={<RideHistory />} />
        <Route path="/paymentMethods" element={<PaymentMethods />} />
        <Route path="/settings" element={<SettingsPage user={user} onUserUpdated={(updated: any) => { updateUser(updated);}} />} />
      </Routes>
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} isAdmin={isAdmin} />
      <Toaster />
    </div>
  );
}