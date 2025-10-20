import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Star, Edit, Settings, CreditCard, History, HelpCircle, ChevronRight } from "lucide-react";

export function ProfilePage() {
  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Profile Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary-foreground text-primary text-xl">
              JD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-medium">John Doe</h2>
            <p className="text-primary-foreground/80">john.doe@email.com</p>
            <div className="flex items-center gap-2 mt-2">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>4.8 Rating</span>
              <Badge variant="secondary" className="ml-2">Verified</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-primary-foreground">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 p-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-medium text-primary">23</p>
          <p className="text-sm text-muted-foreground">Rides Taken</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-medium text-primary">12</p>
          <p className="text-sm text-muted-foreground">Rides Offered</p>
        </Card>
      </div>

      {/* Menu Options */}
      <div className="px-4 space-y-2">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Payment Methods</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Ride History</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Settings</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1">Help & Support</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="font-medium mb-3">Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Music Preferences</span>
              <Badge variant="outline">Pop, Rock</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Smoking Policy</span>
              <Badge variant="outline">No Smoking</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Pet Policy</span>
              <Badge variant="outline">No Pets</Badge>
            </div>
          </div>
        </Card>

        <Button variant="outline" className="w-full">
          Become a Driver
        </Button>
      </div>
    </div>
  );
}