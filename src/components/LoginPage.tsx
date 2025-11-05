import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Car, Upload, ArrowLeft } from "lucide-react";

interface LoginPageProps {
  onLogin: (email: string) => void;
  initialMode?: "login" | "signup";
  initialUserType?: "rider" | "driver";
  onBack?: () => void;
}

export function LoginPage({ onLogin, initialMode = "login", initialUserType = "rider", onBack }: LoginPageProps) {
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [userType, setUserType] = useState<"rider" | "driver">(initialUserType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  
  // Driver-specific fields
  const [driversLicense, setDriversLicense] = useState<File | null>(null);
  const [insurance, setInsurance] = useState<File | null>(null);
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [numberOfSeats, setNumberOfSeats] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Pass the email to the onLogin callback
    onLogin(email);
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
                    <Tabs value={userType} onValueChange={(value) => setUserType(value as "rider" | "driver")} className="w-full">
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

              {/* Driver-specific fields */}
              {isSignUp && userType === "driver" && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="mb-4">Driver Information</h3>
                    
                    {/* Driver's License */}
                    <div className="space-y-2 mb-4">
                      <Label htmlFor="license">Driver's License</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="license"
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setDriversLicense)}
                          required
                          className="bg-input-background"
                        />
                        {driversLicense && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">Upload a photo or PDF of your license</p>
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
                          required
                          className="bg-input-background"
                        />
                        {insurance && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">Upload proof of vehicle insurance</p>
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
                          required
                          className="bg-input-background"
                        />
                        {carPhoto && (
                          <span className="text-muted-foreground whitespace-nowrap">✓</span>
                        )}
                      </div>
                      <p className="text-muted-foreground">Upload a photo of your vehicle</p>
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
                      <p className="text-muted-foreground">How many passengers can you accommodate?</p>
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

              <Button type="submit" className="w-full mt-6">
                {isSignUp ? "Sign Up" : "Log In"}
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