import React from "react";
import { Button } from "../../../components/ui/button";
import { Tabs } from "../../../components/ui/tabs";

type Props = {
  isSignUp: boolean;
  setIsSignUp: (v: boolean) => void;
  userType: "rider" | "driver";
  setUserType: (v: "rider" | "driver") => void;
  email: string;
  setEmail: (s: string) => void;
  password: string;
  setPassword: (s: string) => void;
  name: string;
  setName: (s: string) => void;
  phone: string;
  setPhone: (s: string) => void;
  address: string;
  setAddress: (s: string) => void;
  latitude?: number | null;
  setLatitude: (n: number | null) => void;
  longitude?: number | null;
  setLongitude: (n: number | null) => void;
  licenseNumber: string;
  setLicenseNumber: (s: string) => void;
  driversLicense: File | null;
  setDriversLicense: (f: File | null) => void;
  insurance: File | null;
  setInsurance: (f: File | null) => void;
  carPhoto: File | null;
  setCarPhoto: (f: File | null) => void;
  numberOfSeats?: number;
  setNumberOfSeats: (n?: number) => void;
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export function LoginForm(props: Props) {
  const {
    isSignUp, setIsSignUp,
    userType, setUserType,
    email, setEmail,
    password, setPassword,
    name, setName,
    phone, setPhone,
    address, setAddress,
    latitude, setLatitude,
    longitude, setLongitude,
    licenseNumber, setLicenseNumber,
    driversLicense, setDriversLicense,
    insurance, setInsurance,
    carPhoto, setCarPhoto,
    numberOfSeats, setNumberOfSeats,
    isLoading,
    handleSubmit,
    handleFileChange,
  } = props;
  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {isSignUp && (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <label className="form-label">Register as</label>
            <Tabs value={userType} onValueChange={(value: string) => setUserType(value as "rider" | "driver")} className="w-full">
              {/* tab items */}
            </Tabs>
          </div>

          <div className="mb-3">
            <input
              id="name"
              type="text"
              className="form-control"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ backgroundColor: "#f3f3f5", borderColor: "rgba(0, 0, 0, 0.1)" }}
            />
          </div>

          {/* OTHER signup-specific fields: phone, address, driver extras, file inputs etc */}
          {/* e.g.
              <input value={phone} onChange={e => setPhone(e.target.value)} />
              <input type="file" onChange={handleFileChange} />
          */}
        </>
      )}

      {/* Shared login fields */}
      <div>
        <input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <input
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {/* submit */}
      <div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Processing..." : isSignUp ? "Sign up" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}