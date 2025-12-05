import { useReducer } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";

interface LoginFormState {
  isSignUp: boolean;
  userType: "rider" | "driver";
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  licenseNumber: string;
  driversLicense: File | null;
  insurance: File | null;
  carPhoto: File | null;
  numberOfSeats: string;
  isLoading: boolean;
}

type LoginFormAction =
  | { type: 'SET_IS_SIGN_UP'; payload: boolean }
  | { type: 'SET_USER_TYPE'; payload: "rider" | "driver" }
  | { type: 'SET_EMAIL'; payload: string }
  | { type: 'SET_PASSWORD'; payload: string }
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_PHONE'; payload: string }
  | { type: 'SET_ADDRESS'; payload: string }
  | { type: 'SET_CITY'; payload: string }
  | { type: 'SET_PROVINCE'; payload: string }
  | { type: 'SET_POSTAL_CODE'; payload: string }
  | { type: 'SET_LICENSE_NUMBER'; payload: string }
  | { type: 'SET_DRIVERS_LICENSE'; payload: File | null }
  | { type: 'SET_INSURANCE'; payload: File | null }
  | { type: 'SET_CAR_PHOTO'; payload: File | null }
  | { type: 'SET_NUMBER_OF_SEATS'; payload: string }
  | { type: 'SET_IS_LOADING'; payload: boolean };

function loginFormReducer(state: LoginFormState, action: LoginFormAction): LoginFormState {
  switch (action.type) {
    case 'SET_IS_SIGN_UP':
      return { ...state, isSignUp: action.payload };
    case 'SET_USER_TYPE':
      return { ...state, userType: action.payload };
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_PHONE':
      return { ...state, phone: action.payload };
    case 'SET_ADDRESS':
      return { ...state, address: action.payload };
    case 'SET_CITY':
      return { ...state, city: action.payload };
    case 'SET_PROVINCE':
      return { ...state, province: action.payload };
    case 'SET_POSTAL_CODE':
      return { ...state, postalCode: action.payload };
    case 'SET_LICENSE_NUMBER':
      return { ...state, licenseNumber: action.payload };
    case 'SET_DRIVERS_LICENSE':
      return { ...state, driversLicense: action.payload };
    case 'SET_INSURANCE':
      return { ...state, insurance: action.payload };
    case 'SET_CAR_PHOTO':
      return { ...state, carPhoto: action.payload };
    case 'SET_NUMBER_OF_SEATS':
      return { ...state, numberOfSeats: action.payload };
    case 'SET_IS_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export function useLoginForm(initialMode: "login" | "signup", initialUserType: "rider" | "driver", onBack?: () => void) {
  const { login, register } = useAuth();

  const [state, dispatch] = useReducer(loginFormReducer, {
    isSignUp: initialMode === "signup",
    userType: initialUserType,
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    licenseNumber: "",
    driversLicense: null,
    insurance: null,
    carPhoto: null,
    numberOfSeats: "",
    isLoading: false,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (file: File | null) => void) => {
    if (e.target.files?.[0]) {
      setter(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'SET_IS_LOADING', payload: true });
    try {
      if (state.isSignUp) {
        if (!state.email || !state.password || !state.name || !state.phone) {
          toast.error("Please fill in all required fields");
          dispatch({ type: 'SET_IS_LOADING', payload: false });
          return;
        }

        // Password validation
        if (state.password.length < 8) {
          toast.error("Password must be at least 8 characters long");
          dispatch({ type: 'SET_IS_LOADING', payload: false });
          return;
        }

        const hasUpperCase = /[A-Z]/.test(state.password);
        const hasLowerCase = /[a-z]/.test(state.password);
        const hasNumber = /[0-9]/.test(state.password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
          toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
          dispatch({ type: 'SET_IS_LOADING', payload: false });
          return;
        }

        await register({
          email: state.email,
          password: state.password,
          name: state.name,
          phone: state.phone,
          userType: state.userType,
          address: state.address,
          city: state.city || undefined,
          province: state.province || undefined,
          postalCode: state.postalCode || undefined,
          licenseNumber: state.userType === "driver" ? state.licenseNumber : undefined,
          insuranceProof: state.insurance?.name,
          carPhoto: state.carPhoto?.name,
          availableSeats: state.userType === "driver" ? parseInt(state.numberOfSeats) : undefined,
        });

        toast.success("Registration successful!");
        onBack?.();
      } else {
        if (!state.email || !state.password) {
          toast.error("Enter email + password");
          dispatch({ type: 'SET_IS_LOADING', payload: false });
          return;
        }

        await login(state.email, state.password);
        toast.success("Logged in");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      dispatch({ type: 'SET_IS_LOADING', payload: false });
    }
  };

  return {
    // state  
    isSignUp: state.isSignUp,
    userType: state.userType,
    email: state.email,
    password: state.password,
    name: state.name,
    phone: state.phone,
    address: state.address,
    city: state.city,
    province: state.province,
    postalCode: state.postalCode,
    licenseNumber: state.licenseNumber,
    driversLicense: state.driversLicense,
    insurance: state.insurance,
    carPhoto: state.carPhoto,
    numberOfSeats: state.numberOfSeats,
    isLoading: state.isLoading,

    // setters  
    setIsSignUp: (value: boolean) => dispatch({ type: 'SET_IS_SIGN_UP', payload: value }),
    setUserType: (value: "rider" | "driver") => dispatch({ type: 'SET_USER_TYPE', payload: value }),
    setEmail: (value: string) => dispatch({ type: 'SET_EMAIL', payload: value }),
    setPassword: (value: string) => dispatch({ type: 'SET_PASSWORD', payload: value }),
    setName: (value: string) => dispatch({ type: 'SET_NAME', payload: value }),
    setPhone: (value: string) => dispatch({ type: 'SET_PHONE', payload: value }),
    setAddress: (value: string) => dispatch({ type: 'SET_ADDRESS', payload: value }),
    setCity: (value: string) => dispatch({ type: 'SET_CITY', payload: value }),
    setProvince: (value: string) => dispatch({ type: 'SET_PROVINCE', payload: value }),
    setPostalCode: (value: string) => dispatch({ type: 'SET_POSTAL_CODE', payload: value }),
    setLicenseNumber: (value: string) => dispatch({ type: 'SET_LICENSE_NUMBER', payload: value }),
    setDriversLicense: (value: File | null) => dispatch({ type: 'SET_DRIVERS_LICENSE', payload: value }),
    setInsurance: (value: File | null) => dispatch({ type: 'SET_INSURANCE', payload: value }),
    setCarPhoto: (value: File | null) => dispatch({ type: 'SET_CAR_PHOTO', payload: value }),
    setNumberOfSeats: (value: string) => dispatch({ type: 'SET_NUMBER_OF_SEATS', payload: value }),

    handleFileChange,
    handleSubmit,
  };
}
