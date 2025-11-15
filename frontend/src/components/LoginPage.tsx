import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Car, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface LoginPageProps {
  initialMode?: "login" | "signup";
  initialUserType?: "rider" | "driver";
  onBack?: () => void;
}
//Login Page for the app
export function LoginPage({ initialMode = "login", initialUserType = "rider", onBack }: LoginPageProps) {
  const { login, register } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [userType, setUserType] = useState<"rider" | "driver">(initialUserType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Address fields
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  
  // Driver-specific fields
  const [licenseNumber, setLicenseNumber] = useState("");
  const [driversLicense, setDriversLicense] = useState<File | null>(null);
  const [insurance, setInsurance] = useState<File | null>(null);
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [numberOfSeats, setNumberOfSeats] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validation
        if (!email || !password || !name || !phone) {
          toast.error("Please fill in all required fields");
          setIsLoading(false);
          return;
        }

        // Phone validation (basic format check)
        const phoneRegex = /^[\d\s\-\+\(\)]+$/;
        if (!phoneRegex.test(phone.trim()) || phone.trim().length < 10) {
          toast.error("Please enter a valid phone number");
          setIsLoading(false);
          return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          toast.error("Please enter a valid email address");
          setIsLoading(false);
          return;
        }

        // Password validation
        if (password.length < 6) {
          toast.error("Password must be at least 6 characters long");
          setIsLoading(false);
          return;
        }

        // Driver-specific validation
        if (userType === "driver" && !licenseNumber) {
          toast.error("License number is required for driver registration");
          setIsLoading(false);
          return;
        }

        // Registration
        await register({
          email,
          password,
          name,
          phone: phone.trim(),
          userType,
          address: address.trim() || undefined,
          latitude: latitude.trim() ? parseFloat(latitude.trim()) : undefined,
          longitude: longitude.trim() ? parseFloat(longitude.trim()) : undefined,
          licenseNumber: userType === "driver" ? licenseNumber : undefined,
          insuranceProof: insurance ? insurance.name : undefined,
          carPhoto: carPhoto ? carPhoto.name : undefined,
          availableSeats: userType === "driver" ? parseInt(numberOfSeats) || 4 : undefined,
        });
        toast.success("Registration successful!", {
          description: "Your account has been created.",
        });
        if (onBack) {
          onBack();
        }
      } else {
        // Login validation
        if (!email || !password) {
          toast.error("Please enter your email and password");
          setIsLoading(false);
          return;
        }

        // Login
        await login(email, password);
        toast.success("Login successful!", {
          description: "Welcome back!",
        });
      }
    } catch (error: any) {
      // Show user-friendly error messages
      const errorMessage = error.message || "An error occurred. Please try again.";
      toast.error(errorMessage, {
        description: errorMessage.includes("connect") 
          ? "Make sure the backend server is running"
          : "Please check your input and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <Car className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-primary">RideAlong</h1>
        </div>
        <p className="text-center text-muted-foreground mt-2">
          {isSignUp && userType === "driver" && onBack 
            ? "Complete your driver registration" 
            : "Carpooling to University of Calgary"}
        </p>
      </div>

      {/* Form Container */}
      <div className="flex-1 px-6 pb-8 overflow-y-auto">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="mb-6 text-center">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  {/* User Type Selection */}
                  <div className="space-y-3">
                    <Label>Register as</Label>
                    <Tabs value={userType} onValueChange={(value: string) => setUserType(value as "rider" | "driver")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rider">Rider</TabsTrigger>
                        <TabsTrigger value="driver">Driver</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g., (403) 555-1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
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

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-input-background"
                />
              </div>

              {/* Address fields - for all users */}
              {isSignUp && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="mb-4">Address Information</h3>
                    
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
                      <p className="text-muted-foreground text-sm">Your home or primary location address</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
              <p className="text-muted-foreground text-sm">
                Optional coordinates. You can find them using Google Maps or leave blank.
              </p>
                  </div>
                </>
              )}

              {/* Driver-specific fields */}
              {isSignUp && userType === "driver" && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="mb-4">Driver Information</h3>
                    
                    {/* License Number */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="licenseNumber">Driver's License Number</Label>
                      <Input
                        id="licenseNumber"
                        type="text"
                        placeholder="Enter license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                        className="bg-input-background"
                      />
                    </div>
                    
                    {/* Driver's License File */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="license">Driver's License (File)</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="license"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setDriversLicense)}
                          className="bg-input-background"
                        />
                        {driversLicense && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">Upload a photo or PDF of your license (optional)</p>
                    </div>

                    {/* Proof of Insurance */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="insurance">Proof of Insurance</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="insurance"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setInsurance)}
                          className="bg-input-background"
                        />
                        {insurance && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">Upload proof of vehicle insurance (optional)</p>
                    </div>

                    {/* Car Photo */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="carPhoto">Car Photo</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="carPhoto"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setCarPhoto)}
                          className="bg-input-background"
                        />
                        {carPhoto && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm">Upload a photo of your vehicle (optional)</p>
                    </div>

                    {/* Number of Seats */}
                    <div className="space-y-2">
                      <Label htmlFor="seats">Number of Available Seats</Label>
                      <Input
                        id="seats"
                        type="number"
                        min="1"
                        max="8"
                        placeholder="e.g., 4"
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(e.target.value)}
                        required
                        className="bg-input-background"
                      />
                      <p className="text-muted-foreground text-sm">How many passengers can you accommodate?</p>
                    </div>
                  </div>
                </>
              )}

              {!isSignUp && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                {" "}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary hover:underline"
                >
                  {isSignUp ? "Log In" : "Sign Up"}
                </button>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
            {!isSignUp && (
              <div className="pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  Admin? Sign in with <span className="font-mono bg-muted px-2 py-1 rounded">admin@admin.com</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
