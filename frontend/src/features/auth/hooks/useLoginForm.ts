import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";

export function useLoginForm(initialMode: "login" | "signup", initialUserType: "rider" | "driver", onBack?: () => void) {
  const { login, register } = useAuth();

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [userType, setUserType] = useState<"rider" | "driver">(initialUserType);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // address
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // driver
  const [licenseNumber, setLicenseNumber] = useState("");
  const [driversLicense, setDriversLicense] = useState<File | null>(null);
  const [insurance, setInsurance] = useState<File | null>(null);
  const [carPhoto, setCarPhoto] = useState<File | null>(null);
  const [numberOfSeats, setNumberOfSeats] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files?.[0]) setter(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        if (!email || !password || !name || !phone) {
          toast.error("Please fill in all required fields");
          return;
        }

        await register({
          email,
          password,
          name,
          phone,
          userType,
          address,
          latitude: latitude ? parseFloat(latitude) : undefined,
          longitude: longitude ? parseFloat(longitude) : undefined,
          licenseNumber: userType === "driver" ? licenseNumber : undefined,
          insuranceProof: insurance?.name,
          carPhoto: carPhoto?.name,
          availableSeats: userType === "driver" ? parseInt(numberOfSeats) : undefined,
        });

        toast.success("Registration successful!");
        onBack?.();
      } else {
        if (!email || !password) {
          toast.error("Enter email + password");
          return;
        }

        await login(email, password);
        toast.success("Logged in");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // state  
    isSignUp,
    userType,
    email, password, name, phone,
    address, latitude, longitude,
    licenseNumber, driversLicense, insurance, carPhoto, numberOfSeats,
    isLoading,

    // setters  
    setIsSignUp, setUserType,
    setEmail, setPassword, setName, setPhone,
    setAddress, setLatitude, setLongitude,
    setLicenseNumber, setDriversLicense, setInsurance, setCarPhoto, setNumberOfSeats,

    handleFileChange,
    handleSubmit,
  };
}
