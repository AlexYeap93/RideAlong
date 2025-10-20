import { useState } from "react";
import { AppHeader } from "./components/AppHeader";
import { HomePage } from "./components/HomePage";
import { DriversPage } from "./components/DriversPage";
import { UsersPage } from "./components/UsersPage";
import { ProfilePage } from "./components/ProfilePage";
import { BottomNavigation } from "./components/BottomNavigation";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [activeTab, setActiveTab] = useState("home");

  const renderPage = () => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "drivers":
        return <DriversPage />;
      case "users":
        return <UsersPage />;
      case "profile":
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      {renderPage()}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Toaster />
    </div>
  );
}