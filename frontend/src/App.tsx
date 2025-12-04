import { useState, useEffect, useRef } from "react";
import { AppHeader } from "./features/shared/ui/AppHeader";
import { HomePage } from "./components/HomePage";
import { DriversPage } from "./features/driver/components/DriversPage";
import { UsersPage } from "./components/UsersPage";
import { ProfilePage } from "./components/ProfilePage";
import { AdminPage } from "./features/admin/pages/AdminPage";
import { LoginPage } from "./features/auth/pages/LoginPage";
import { RideHistory } from "./features/ride/components/RideHistory";
import { PaymentMethods } from "./components/PaymentMethods";
import { SettingsPage } from "./components/SettingsPage";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./contexts/AuthContext";

type SubPage = "rideHistory" | "paymentMethods" | "settings" | null;

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showDriverSignup, setShowDriverSignup] = useState(false);
  const [subPage, setSubPage] = useState<SubPage>(null);
  const [usersPageMode, setUsersPageMode] = useState<"main" | "browseRides">("main");
  const [usersPageRefreshTrigger, setUsersPageRefreshTrigger] = useState(0);
  const [autoSelectDestination, setAutoSelectDestination] = useState<string | undefined>(undefined);
  const isUpdatingHashRef = useRef(false);

  // Function to parse hash and update state
  const parseHashAndUpdateState = (hash: string) => {
    const hashValue = hash.startsWith('#') ? hash.slice(1) : hash;
    if (hashValue) {
      const [tab, sub, mode] = hashValue.split('/');
      if (tab && ['home', 'drivers', 'users', 'profile', 'admin'].includes(tab)) {
        setActiveTab(tab);
      }
      if (sub && ['rideHistory', 'paymentMethods', 'settings'].includes(sub)) {
        setSubPage(sub as SubPage);
      } else {
        setSubPage(null);
      }
      if (mode && ['main', 'browseRides'].includes(mode)) {
        setUsersPageMode(mode as "main" | "browseRides");
      } else if (tab === 'users' && !mode) {
        setUsersPageMode("main");
      }
    } else {
      // Default to home if no hash
      setActiveTab("home");
      setSubPage(null);
      setUsersPageMode("main");
    }
  };

  // Initialize from URL hash on mount
  useEffect(() => {
    if (isAuthenticated) {
      const hash = window.location.hash.slice(1); // Remove #
      if (hash) {
        parseHashAndUpdateState(hash);
      } else {
        // Set initial hash if none exists
        window.location.hash = 'home';
      }
    }
  }, [isAuthenticated]);

  // Listen to browser back/forward buttons and hash changes
  useEffect(() => {
    const handleHashChange = () => {
      if (isAuthenticated && !isUpdatingHashRef.current) {
        parseHashAndUpdateState(window.location.hash);
      }
      isUpdatingHashRef.current = false;
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isAuthenticated]);

  // Update URL hash when navigation state changes
  useEffect(() => {
    if (isAuthenticated) {
      let hash = `${activeTab}`;
      if (subPage) {
        hash += `/${subPage}`;
      }
      if (activeTab === 'users' && usersPageMode) {
        hash += `/${usersPageMode}`;
      }
      
      const currentHash = window.location.hash.slice(1); // Remove #
      // Only update if hash is different to avoid unnecessary history entries
      if (currentHash !== hash) {
        isUpdatingHashRef.current = true;
        window.location.hash = hash;
      }
    }
  }, [isAuthenticated, activeTab, subPage, usersPageMode]);

  const isAdmin = user?.role === 'admin';
  const isDriver = user?.role === 'driver' || user?.role === 'admin';

  const renderPage = () => {
    // Handle sub-pages
    if (subPage === "rideHistory") {
      return <RideHistory onBack={() => handleSubPageChange(null)} />;
    }
    if (subPage === "paymentMethods") {
      return <PaymentMethods onBack={() => handleSubPageChange(null)} />;
    }
    if (subPage === "settings") {
      return <SettingsPage onBack={() => handleSubPageChange(null)} />;
    }

    // Handle main pages
    switch (activeTab) {
      case "home":
        return (
          <HomePage 
            onNavigateToUsers={() => {
              setActiveTab("users");
              setUsersPageMode("main");
              setUsersPageRefreshTrigger(prev => prev + 1); // Trigger refresh
            }}
            onBookingCreated={() => {
              // Trigger refresh of UsersPage when booking is created
              setUsersPageRefreshTrigger(prev => prev + 1);
            }}
            autoSelectDestination={autoSelectDestination}
          />
        );
      case "drivers":
        return <DriversPage />;
      case "users":
        return (
          <UsersPage 
            initialMode={usersPageMode}
            onModeChange={handleUsersModeChange}
            refreshTrigger={usersPageRefreshTrigger}
            onNavigateToHome={() => {
              // Navigate to home tab and auto-select University of Calgary
              setActiveTab("home");
              // Set auto-select destination after tab change
              setTimeout(() => {
                setAutoSelectDestination("University of Calgary");
                // Clear after a moment to allow it to trigger again if needed
                setTimeout(() => setAutoSelectDestination(undefined), 200);
              }, 50);
            }}
          />
        );
      case "profile":
        return (
          <ProfilePage 
            onNavigateToRideHistory={() => handleSubPageChange("rideHistory")}
            onNavigateToPaymentMethods={() => handleSubPageChange("paymentMethods")}
            onNavigateToSettings={() => {
              // Always navigate to Settings page for editing user information
              handleSubPageChange("settings");
            }}
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

  // Show loading state
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

  // Show driver signup flow
  if (showDriverSignup) {
    return (
      <>
        <LoginPage 
          initialMode="signup"
          initialUserType="driver"
          onBack={() => setShowDriverSignup(false)}
        />
        <Toaster />
      </>
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

  const handleTabChange = (tab: string) => {
    // Clear sub-page when switching tabs
    setSubPage(null);
    setActiveTab(tab);
    // Update URL hash (will trigger hashchange event, but we'll ignore it)
    isUpdatingHashRef.current = true;
    window.location.hash = tab;
  };

  const handleSubPageChange = (newSubPage: SubPage) => {
    setSubPage(newSubPage);
    let hash = activeTab;
    if (newSubPage) {
      hash += `/${newSubPage}`;
    }
    if (activeTab === 'users' && usersPageMode) {
      hash += `/${usersPageMode}`;
    }
    isUpdatingHashRef.current = true;
    window.location.hash = hash;
  };

  const handleUsersModeChange = (mode: "main" | "browseRides") => {
    setUsersPageMode(mode);
    let hash = activeTab;
    if (subPage) {
      hash += `/${subPage}`;
    }
    hash += `/${mode}`;
    isUpdatingHashRef.current = true;
    window.location.hash = hash;
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {renderPage()}
      <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} isAdmin={isAdmin} />
      <Toaster />
    </div>
  );
}