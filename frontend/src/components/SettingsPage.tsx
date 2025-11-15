import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { MapPin, ArrowLeft, User, Mail, Phone, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { usersAPI, driversAPI } from "../services/api";

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [isDriver, setIsDriver] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserInfo();
    }
  }, [user?.id]);

  const fetchUserInfo = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await usersAPI.getUserById(user.id);
      if (response.data) {
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        setPhone(response.data.phone || "");
        setAddress(response.data.address || "");
        setLatitude(response.data.latitude ? String(response.data.latitude) : "");
        setLongitude(response.data.longitude ? String(response.data.longitude) : "");
      }

      // Check if user is a driver and fetch rating
      if (user.role !== 'admin') {
        try {
          const driverResponse = await driversAPI.getMyDriverProfile();
          if (driverResponse.data) {
            setIsDriver(true);
            const rating = driverResponse.data.average_rating 
              ? parseFloat(driverResponse.data.average_rating) 
              : null;
            setAverageRating(rating);
          }
        } catch (error: any) {
          // User is not a driver, that's okay
          setIsDriver(false);
        }
      }
    } catch (error: any) {
      console.error("Failed to fetch user information:", error);
      toast.error("Failed to load user information", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    // Validation
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    // Phone validation (basic format check)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(phone.trim()) || phone.trim().length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSaving(true);
    try {
      await usersAPI.updateUser(user.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        latitude: latitude.trim() ? parseFloat(latitude.trim()) : undefined,
        longitude: longitude.trim() ? parseFloat(longitude.trim()) : undefined,
      });

      toast.success("Profile updated successfully!");
      await refreshUser();
      onBack();
    } catch (error: any) {
      toast.error("Failed to save profile", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-medium">Settings</h1>
            <p className="text-sm text-primary-foreground/80">
              Manage your profile information
            </p>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="p-4 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-medium">Profile Information</h2>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading profile...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Driver Rating Display */}
              {isDriver && averageRating !== null && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <div>
                      <p className="text-sm font-medium text-yellow-900">Driver Rating</p>
                      <p className="text-lg font-semibold text-yellow-800">
                        {averageRating.toFixed(1)} / 5.0
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Average rating from {averageRating > 0 ? 'your' : 'all'} completed rides
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., (403) 555-1234"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-input-background"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h3 className="text-md font-medium">Address Information</h3>
                </div>

                {/* Address */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="e.g., 123 Main St, Calgary, AB"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-input-background"
                  />
                  <p className="text-sm text-muted-foreground">
                    Your home or primary location address
                  </p>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude (Optional)</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g., 51.0447"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude (Optional)</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g., -114.0719"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="bg-input-background"
                    />
                  </div>
                </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Optional coordinates. You can find them using Google Maps or leave blank.
                    </p>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full"
                  >
                    {isSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Info Card */}
            <Card className="p-4 bg-blue-50 border-blue-200">
              <h3 className="font-medium mb-2 text-blue-900">Why set your address?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Helps drivers know your location</li>
                <li>• Improves ride matching accuracy</li>
                <li>• Better communication with drivers</li>
              </ul>
            </Card>
      </div>
    </div>
  );
}

