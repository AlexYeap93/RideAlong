import { useState } from "react";
import { Button } from "./ui/button";
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
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  
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
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
        if (!phoneRegex.test(phone.trim())) {
          toast.error("Invalid phone number format");
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
        if (password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          setIsLoading(false);
          return;
        }

        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
          toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
          setIsLoading(false);
          return;
        }

        // Postal code validation if provided (Canadian format: A1A 1A1)
        if (postalCode && postalCode.trim()) {
          const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
          if (!postalRegex.test(postalCode.trim())) {
            toast.error("Invalid postal code format. Use format: A1A 1A1");
            setIsLoading(false);
            return;
          }
        }

        // Validate that if any location field is provided, all are provided
        const hasAnyLocation = address.trim() || city.trim() || province.trim() || postalCode.trim();
        const hasAllLocation = address.trim() && city.trim() && province.trim() && postalCode.trim();
        
        if (hasAnyLocation && !hasAllLocation) {
          toast.error("Please fill in all location fields (address, city, province, postal code)");
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
          city: city.trim() || undefined,
          province: province.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
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

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {isSignUp && (
                <>
                  {/* User Type Selection - Keeping Tabs component for complex UI */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label className="form-label">Register as</label>
                    <Tabs value={userType} onValueChange={(value: string) => setUserType(value as "rider" | "driver")} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="rider">Rider</TabsTrigger>
                        <TabsTrigger value="driver">Driver</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Name Field - Bootstrap */}
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      className="form-control"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                    />
                  </div>

                  {/* Phone Field - Bootstrap */}
                  <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-control"
                      placeholder="e.g., +1-403-555-1234"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                    />
                    <p className="text-muted text-sm mt-1 mb-0">Format: +1-XXX-XXX-XXXX or (XXX) XXX-XXXX</p>
                  </div>
                </>
              )}

              {/* Email Field - Bootstrap */}
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  className="form-control"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                />
              </div>

              {/* Password Field - Bootstrap */}
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                />
                {isSignUp && (
                  <p className="text-muted text-sm mt-1 mb-0">
                    Must be at least 8 characters with uppercase, lowercase, and number
                  </p>
                )}
              </div>

              {/* Address fields - for all users */}
              {isSignUp && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="mb-4">Address Information</h3>
                    
                    {/* Address Field - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Address</label>
                      <input
                        id="address"
                        type="text"
                        className="form-control"
                        placeholder="e.g., 123 Main St, Calgary, AB"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                      />
                      <p className="text-muted text-sm mt-1 mb-0">Your home or primary location address</p>
                    </div>

                    {/* City/Province/Postal Code - Bootstrap Grid */}
                    <div className="row g-3 mb-3">
                      <div className="col-4">
                        <label htmlFor="city" className="form-label">City</label>
                        <input
                          id="city"
                          type="text"
                          className="form-control"
                          placeholder="e.g., Calgary"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                      </div>
                      <div className="col-4">
                        <label htmlFor="province" className="form-label">Province</label>
                        <input
                          id="province"
                          type="text"
                          className="form-control"
                          placeholder="e.g., AB"
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                      </div>
                      <div className="col-4">
                        <label htmlFor="postalCode" className="form-label">Postal Code</label>
                        <input
                          id="postalCode"
                          type="text"
                          className="form-control"
                          placeholder="A1A 1A1"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                          maxLength={7}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                        <p className="text-muted text-sm mt-1 mb-0" style={{ fontSize: '0.75rem' }}>Format: A1A 1A1</p>
                      </div>
                    </div>
              <p className="text-muted-foreground text-sm">
                Optional location details for better ride matching.
              </p>
                  </div>
                </>
              )}

              {/* Driver-specific fields */}
              {isSignUp && userType === "driver" && (
                <>
                  <div className="pt-4 border-t border-border">
                    <h3 className="mb-4">Driver Information</h3>
                    
                    {/* License Number - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="licenseNumber" className="form-label">Driver's License Number</label>
                      <input
                        id="licenseNumber"
                        type="text"
                        className="form-control"
                        placeholder="Enter license number"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                        style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                      />
                    </div>
                    
                    {/* Driver's License File - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="license" className="form-label">Driver's License (File)</label>
                      <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                        <input
                          id="license"
                          type="file"
                          className="form-control"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setDriversLicense)}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                        {driversLicense && (
                          <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>✓</span>
                        )}
                      </div>
                      <p className="text-muted text-sm mt-1 mb-0">Upload a photo or PDF of your license (optional)</p>
                    </div>

                    {/* Proof of Insurance - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="insurance" className="form-label">Proof of Insurance</label>
                      <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                        <input
                          id="insurance"
                          type="file"
                          className="form-control"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileChange(e, setInsurance)}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                        {insurance && (
                          <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>✓</span>
                        )}
                      </div>
                      <p className="text-muted text-sm mt-1 mb-0">Upload proof of vehicle insurance (optional)</p>
                    </div>

                    {/* Car Photo - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="carPhoto" className="form-label">Car Photo</label>
                      <div className="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                        <input
                          id="carPhoto"
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setCarPhoto)}
                          style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                        />
                        {carPhoto && (
                          <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>✓</span>
                        )}
                      </div>
                      <p className="text-muted text-sm mt-1 mb-0">Upload a photo of your vehicle (optional)</p>
                    </div>

                    {/* Number of Seats - Bootstrap */}
                    <div className="mb-3">
                      <label htmlFor="seats" className="form-label">Number of Available Seats</label>
                      <input
                        id="seats"
                        type="number"
                        className="form-control"
                        min="1"
                        max="8"
                        placeholder="e.g., 4"
                        value={numberOfSeats}
                        onChange={(e) => setNumberOfSeats(e.target.value)}
                        required
                        style={{ backgroundColor: '#f3f3f5', borderColor: 'rgba(0, 0, 0, 0.1)' }}
                      />
                      <p className="text-muted text-sm mt-1 mb-0">How many passengers can you accommodate?</p>
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

              <button 
                type="submit" 
                className="btn btn-primary w-100 mt-4" 
                disabled={isLoading}
                style={{ 
                  backgroundColor: '#030213', 
                  borderColor: '#030213', 
                  color: '#ffffff',
                  paddingTop: '0.75rem',
                  paddingBottom: '0.75rem'
                }}
              >
                {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
              </button>
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
