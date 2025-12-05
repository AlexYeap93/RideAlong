import { useReducer, useEffect } from "react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import { Checkbox } from "../../../components/ui/checkbox";
import { CreditCard, ArrowLeft, MapPin, Clock, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { paymentMethodsAPI } from "../../../services/PaymentServices";
import { toast } from "sonner";
import { useAuth } from "../../../contexts/AuthContext";
import type { PaymentPageProps, PaymentPageState } from "../../../serviceInterface";


type PaymentPageAction =
  | { type: 'SET_PAYMENT_SOURCE'; payload: "saved" | "manual" }
  | { type: 'SET_SELECTED_SAVED_METHOD'; payload: string }
  | { type: 'SET_SAVED_PAYMENT_METHODS'; payload: any[] }
  | { type: 'SET_IS_LOADING_METHODS'; payload: boolean }
  | { type: 'SET_CARD_NUMBER'; payload: string }
  | { type: 'SET_EXPIRY_DATE'; payload: string }
  | { type: 'SET_CVV'; payload: string }
  | { type: 'SET_CARD_NAME'; payload: string }
  | { type: 'SET_SAVE_PAYMENT_METHOD'; payload: boolean }
  | { type: 'SET_IS_PROCESSING'; payload: boolean }
  | { type: 'SET_ADDRESS_SOURCE'; payload: "saved" | "manual" }
  | { type: 'SET_PICKUP_ADDRESS'; payload: string }
  | { type: 'SET_PICKUP_CITY'; payload: string }
  | { type: 'SET_PICKUP_PROVINCE'; payload: string }
  | { type: 'SET_PICKUP_POSTAL_CODE'; payload: string };

function paymentPageReducer(state: PaymentPageState, action: PaymentPageAction): PaymentPageState {
  switch (action.type) {
    case 'SET_PAYMENT_SOURCE':
      return { ...state, paymentSource: action.payload };
    case 'SET_SELECTED_SAVED_METHOD':
      return { ...state, selectedSavedMethod: action.payload };
    case 'SET_SAVED_PAYMENT_METHODS':
      return { ...state, savedPaymentMethods: action.payload };
    case 'SET_IS_LOADING_METHODS':
      return { ...state, isLoadingMethods: action.payload };
    case 'SET_CARD_NUMBER':
      return { ...state, cardNumber: action.payload };
    case 'SET_EXPIRY_DATE':
      return { ...state, expiryDate: action.payload };
    case 'SET_CVV':
      return { ...state, cvv: action.payload };
    case 'SET_CARD_NAME':
      return { ...state, cardName: action.payload };
    case 'SET_SAVE_PAYMENT_METHOD':
      return { ...state, savePaymentMethod: action.payload };
    case 'SET_IS_PROCESSING':
      return { ...state, isProcessing: action.payload };
    case 'SET_ADDRESS_SOURCE':
      return { ...state, addressSource: action.payload };
    case 'SET_PICKUP_ADDRESS':
      return { ...state, pickupAddress: action.payload };
    case 'SET_PICKUP_CITY':
      return { ...state, pickupCity: action.payload };
    case 'SET_PICKUP_PROVINCE':
      return { ...state, pickupProvince: action.payload };
    case 'SET_PICKUP_POSTAL_CODE':
      return { ...state, pickupPostalCode: action.payload };
    default:
      return state;
  }
}

export function PaymentPage({ bookingDetails, onBack, onConfirm }: PaymentPageProps) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(paymentPageReducer, {
    paymentSource: "saved",
    selectedSavedMethod: "",
    savedPaymentMethods: [],
    isLoadingMethods: true,
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    savePaymentMethod: false,
    isProcessing: false,
    addressSource: "saved",
    pickupAddress: "",
    pickupCity: "",
    pickupProvince: "",
    pickupPostalCode: "",
  });

  // Load saved address on mount
  useEffect(() => {
    if (user?.address && user?.city && user?.province && user?.postalCode) {
      dispatch({ type: 'SET_ADDRESS_SOURCE', payload: "saved" });
      dispatch({ type: 'SET_PICKUP_ADDRESS', payload: user.address });
      dispatch({ type: 'SET_PICKUP_CITY', payload: user.city });
      dispatch({ type: 'SET_PICKUP_PROVINCE', payload: user.province });
      dispatch({ type: 'SET_PICKUP_POSTAL_CODE', payload: user.postalCode });
    } else {
      dispatch({ type: 'SET_ADDRESS_SOURCE', payload: "manual" });
    }
  }, [user]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodsAPI.getPaymentMethods();
        dispatch({ type: 'SET_SAVED_PAYMENT_METHODS', payload: response.data || [] });
        const defaultMethod = response.data?.find((m: any) => m.is_default);
        if (defaultMethod)
          dispatch({ type: 'SET_SELECTED_SAVED_METHOD', payload: defaultMethod.id });
        else if (response.data?.length > 0) 
          dispatch({ type: 'SET_SELECTED_SAVED_METHOD', payload: response.data[0].id });
        else 
          dispatch({ type: 'SET_PAYMENT_SOURCE', payload: "manual" });
      } catch (error: any) {
        console.error("Failed to fetch payment methods:", error);
        dispatch({ type: 'SET_PAYMENT_SOURCE', payload: "manual" });
      } finally {
        dispatch({ type: 'SET_IS_LOADING_METHODS', payload: false });
      }
    };

    fetchPaymentMethods();
  }, []);

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4)
      parts.push(match.substring(i, i + 4));

    if (parts.length) 
      return parts.join(" ");
    else 
      return value;
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2)
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    return v;
  };
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16)
      dispatch({ type: 'SET_CARD_NUMBER', payload: formatted });
  };
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) 
      dispatch({ type: 'SET_EXPIRY_DATE', payload: formatted });
  };
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 3)
      dispatch({ type: 'SET_CVV', payload: value });
  };
  const handlePayment = async () => {
    dispatch({ type: 'SET_IS_PROCESSING', payload: true });
    try {
      let paymentMethodString = "";

      if (state.paymentSource === "saved" && state.selectedSavedMethod) {
        const selectedMethod = state.savedPaymentMethods.find(m => m.id === state.selectedSavedMethod);
        if (selectedMethod)
          paymentMethodString = `${selectedMethod.brand || 'Card'} •••• ${selectedMethod.last4}`;
      } else {
        if (!isFormValid()) {
          toast.error("Please fill in all card details");
          dispatch({ type: 'SET_IS_PROCESSING', payload: false });
          return;
        }

        paymentMethodString = `Card •••• ${state.cardNumber.slice(-4)}`;

        if (state.savePaymentMethod) {
          try {
            const cardNumberClean = state.cardNumber.replace(/\s/g, "");
            const [expMonth, expYear] = state.expiryDate.split("/");

            await paymentMethodsAPI.createPaymentMethod({
              type: "credit",
              brand: "Card",
              last4: cardNumberClean.slice(-4),
              expiryMonth: parseInt(expMonth),
              expiryYear: 2000 + parseInt(expYear), 
              cardholderName: state.cardName,
              isDefault: state.savedPaymentMethods.length === 0,
            });
          } catch (error: any) {
            console.error("Failed to save payment method:", error);
          }
        }
      }

      if (!state.pickupAddress.trim() || !state.pickupCity.trim() || !state.pickupProvince.trim() || !state.pickupPostalCode.trim()) {
        toast.error("Please enter your complete pickup address to proceed");
        dispatch({ type: 'SET_IS_PROCESSING', payload: false });
        return;
      }

      // Validate postal code format
      const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
      if (!postalRegex.test(state.pickupPostalCode.trim())) {
        toast.error("Invalid postal code format. Use format: A1A 1A1");
        dispatch({ type: 'SET_IS_PROCESSING', payload: false });
        return;
      }

      setTimeout(() => {
        dispatch({ type: 'SET_IS_PROCESSING', payload: false });
        onConfirm(paymentMethodString, state.pickupAddress.trim(), state.pickupCity.trim(), state.pickupProvince.trim(), state.pickupPostalCode.trim());
      }, 1500);
    } catch (error: any) {
      dispatch({ type: 'SET_IS_PROCESSING', payload: false });
      toast.error("Payment failed", {
        description: error.message || "Please try again.",
      });
    }
  };

  //validate
  const isFormValid = () => {
    // Address is required - all fields must be filled
    if (!state.pickupAddress.trim() || !state.pickupCity.trim() || !state.pickupProvince.trim() || !state.pickupPostalCode.trim()) {
      return false;
    }

    // Validate postal code format
    const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
    if (!postalRegex.test(state.pickupPostalCode.trim())) {
      return false;
    }

    // Payment method validation
    if (state.paymentSource === "saved") {
      return state.selectedSavedMethod !== "";
    }
    return (
      state.cardNumber.replace(/\s/g, "").length === 16 &&
      state.expiryDate.length === 5 &&
      state.cvv.length === 3 &&
      state.cardName.trim().length > 0
    );
  };

  const serviceFee = 2.50;
  const total = bookingDetails.price + serviceFee;

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="flex-1">Payment</h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Pickup Address Section - Required */}
        <Card className="p-4 border-2 border-primary">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="font-medium">Pickup Address <span className="text-red-500">*</span></h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter your pickup location. This will be your pickup point for the ride.
          </p>

          {/* Address Source Selection */}
          {user?.address && user?.city && user?.province && user?.postalCode && (
            <RadioGroup value={state.addressSource} onValueChange={(value: string) => {
              dispatch({ type: 'SET_ADDRESS_SOURCE', payload: value as "saved" | "manual" });
              if (value === "saved" && user) {
                dispatch({ type: 'SET_PICKUP_ADDRESS', payload: user.address || "" });
                dispatch({ type: 'SET_PICKUP_CITY', payload: user.city || "" });
                dispatch({ type: 'SET_PICKUP_PROVINCE', payload: user.province || "" });
                dispatch({ type: 'SET_PICKUP_POSTAL_CODE', payload: user.postalCode || "" });
              } else if (value === "manual") {
                dispatch({ type: 'SET_PICKUP_ADDRESS', payload: "" });
                dispatch({ type: 'SET_PICKUP_CITY', payload: "" });
                dispatch({ type: 'SET_PICKUP_PROVINCE', payload: "" });
                dispatch({ type: 'SET_PICKUP_POSTAL_CODE', payload: "" });
              }
            }} className="mb-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="saved" id="savedAddress" />
                  <Label htmlFor="savedAddress" className="cursor-pointer flex-1">
                    <div>
                      <p className="font-medium">Use Saved Address</p>
                      <p className="text-sm text-muted-foreground">
                        {user.address}, {user.city}, {user.province} {user.postalCode}
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="manual" id="manualAddress" />
                  <Label htmlFor="manualAddress" className="cursor-pointer flex-1">
                    <p className="font-medium">Enter Different Address</p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          )}

          {/* Address Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Street Address</Label>
              <Input id="pickupAddress" type="text" placeholder="e.g., 123 Main St" value={state.pickupAddress} onChange={(e) => dispatch({ type: 'SET_PICKUP_ADDRESS', payload: e.target.value })} required disabled={state.addressSource === "saved"} className="bg-input-background" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pickupCity">City</Label>
                <Input id="pickupCity" type="text" placeholder="Calgary" value={state.pickupCity} onChange={(e) => dispatch({ type: 'SET_PICKUP_CITY', payload: e.target.value })} required disabled={state.addressSource === "saved"} className="bg-input-background"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupProvince">Province</Label>
                <Input id="pickupProvince" type="text" placeholder="AB" value={state.pickupProvince} onChange={(e) => dispatch({ type: 'SET_PICKUP_PROVINCE', payload: e.target.value })} required disabled={state.addressSource === "saved"} className="bg-input-background"/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pickupPostalCode">Postal Code</Label>
                <Input id="pickupPostalCode" type="text" placeholder="A1A 1A1" value={state.pickupPostalCode} onChange={(e) => dispatch({ type: 'SET_PICKUP_POSTAL_CODE', payload: e.target.value.toUpperCase() })} required maxLength={7} disabled={state.addressSource === "saved"} className="bg-input-background"/>
                <p className="text-xs text-muted-foreground">Format: A1A 1A1</p>
              </div>
            </div>

            {(!state.pickupAddress.trim() || !state.pickupCity.trim() || !state.pickupProvince.trim() || !state.pickupPostalCode.trim()) && (
              <div className="flex items-center gap-2 text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>All address fields are required to proceed with booking</span>
              </div>
            )}
          </div>
        </Card>

        {/* Booking Summary */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Booking Summary</h2>

          {/* Driver Info */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {bookingDetails.driverName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{bookingDetails.driverName}</p>
                <Badge variant="secondary" className="text-xs">
                  {bookingDetails.rating} ★
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{bookingDetails.car}</p>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Pickup Location</p>
                <p className="font-medium">
                  {state.pickupAddress && state.pickupCity && state.pickupProvince && state.pickupPostalCode
                    ? `${state.pickupAddress}, ${state.pickupCity}, ${state.pickupProvince} ${state.pickupPostalCode}`
                    : "Not set"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{bookingDetails.destination}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{bookingDetails.bookingDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Departure Time</p>
                <p className="font-medium">{bookingDetails.departureTime}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Seat Number</p>
                <p className="font-medium">Seat {bookingDetails.seatNumber}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Payment Method */}
        <Card className="p-4">
          <h2 className="font-medium mb-4">Payment Method</h2>

          <RadioGroup value={state.paymentSource} onValueChange={(value: string) => dispatch({ type: 'SET_PAYMENT_SOURCE', payload: value as "saved" | "manual" })}>
            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="saved" id="saved" />
                <Label htmlFor="saved" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Use Saved Payment Method</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-4 h-4" />
                  <span>Enter Payment Information</span>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {/* Saved Payment Methods */}
          {state.paymentSource === "saved" && (
            <div className="mt-4 space-y-3">
              {state.isLoadingMethods ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
                </div>
              ) : state.savedPaymentMethods.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No saved payment methods</p>
                  <p className="text-xs mt-1">Switch to manual entry to add one</p>
                </div>
              ) : (
                <RadioGroup value={state.selectedSavedMethod} onValueChange={(value: string) => dispatch({ type: 'SET_SELECTED_SAVED_METHOD', payload: value })}>
                  <div className="space-y-2">
                    {state.savedPaymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent">
                        <RadioGroupItem value={method.id} id={`saved-${method.id}`} />
                        <Label htmlFor={`saved-${method.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {method.brand || 'Card'} •••• {method.last4}
                              </span>
                              {method.is_default && (<Badge variant="secondary" className="text-xs">Default</Badge> )}
                            </div>
                            {method.cardholder_name && (<p className="text-xs text-muted-foreground">{method.cardholder_name}</p>)}
                            {method.expiry_month && method.expiry_year && (
                              <p className="text-xs text-muted-foreground">
                                Expires {String(method.expiry_month).padStart(2, '0')}/{String(method.expiry_year).slice(-2)}
                              </p>
                            )}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          {state.paymentSource === "manual" && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={state.cardNumber} onChange={handleCardNumberChange} maxLength={19}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input id="cardName" placeholder="John Doe" value={state.cardName} onChange={(e) => dispatch({ type: 'SET_CARD_NAME', payload: e.target.value })}/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" value={state.expiryDate} onChange={handleExpiryChange} maxLength={5}/>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" type="password" placeholder="123" value={state.cvv} onChange={handleCvvChange} maxLength={3}/>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Checkbox id="savePayment" checked={state.savePaymentMethod} onCheckedChange={(checked: boolean) => dispatch({ type: 'SET_SAVE_PAYMENT_METHOD', payload: checked })} className="mr-1"/>
                <Label htmlFor="savePayment" className="text-sm cursor-pointer">
                  Save this payment method for future use
                </Label>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-4">
          <h2 className="font-medium mb-4">Price Details</h2>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ride fare</span>
              <span>${bookingDetails.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Service fee</span>
              <span>${serviceFee.toFixed(2)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <Button className="w-full" onClick={handlePayment} disabled={!isFormValid() || state.isProcessing}>
          {state.isProcessing ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Pay ${total.toFixed(2)}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}