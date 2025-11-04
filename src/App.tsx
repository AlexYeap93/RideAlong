import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./components/HomePage";
import { DriversPage } from "./components/DriversPage";
import { UsersPage } from "./components/UsersPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPage } from "./components/AdminPage";
import { LoginPage } from "./components/LoginPage";
import { RideHistory } from "./components/RideHistory";
import { PaymentMethods } from "./components/PaymentMethods";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";

type SubPage = "rideHistory" | "paymentMethods" | null;

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showDriverSignup, setShowDriverSignup] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [usersPageMode, setUsersPageMode] = useState<"main" | "browseRides">("main");

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    // Check if user is admin based on email
    setIsAdmin(email.toLowerCase() === "admin@admin.com");
  };

  const renderPage = () => {
    // Handle sub-pages
    if (subPage === "rideHistory") {
      return <RideHistory onBack={() => setSubPage(null)} />;
    }
    if (subPage === "paymentMethods") {
      return <PaymentMethods onBack={() => setSubPage(null)} />;
    }

    // Handle main pages
    switch (activeTab) {
      case "home":
        return (
          <HomePage 
            onNavigateToUsers={() => {
              setActiveTab("users");
              setUsersPageMode("main");
            }}
          />
        );
      case "drivers":
        return <DriversPage />;
      case "users":
        return (
          <UsersPage 
            initialMode={usersPageMode}
            onModeChange={(mode) => setUsersPageMode(mode)}
          />
        );
      case "profile":
        return (
          <ProfilePage 
            onBecomeDriver={() => setShowDriverSignup(true)}
            onNavigateToRideHistory={() => setSubPage("rideHistory")}
            onNavigateToPaymentMethods={() => setSubPage("paymentMethods")}
          />
        );
      case "admin":
        return <AdminPage />;
      default:
        return (
          <HomePage 
            onNavigateToUsers={() => {
              setActiveTab("users");
              setUsersPageMode("main");
            }}
          />
        );
    }
  };

  // Show driver signup flow
  if (showDriverSignup) {
    return (
      <>
        <LoginPage 
          onLogin={(email) => {
            setShowDriverSignup(false);
            handleLogin(email);
          }}
          initialMode="signup"
          initialUserType="driver"
          onBack={() => setShowDriverSignup(false)}
        />
        <Toaster />
      </>
    );
  }

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {renderPage()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />
      <Toaster />
    </div>
  );
}