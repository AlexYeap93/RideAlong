import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Checkbox } from "./ui/checkbox";
import { CreditCard, ArrowLeft, MapPin, Clock, User, Calendar, CheckCircle2, AlertCircle } from "lucide-react";
import { paymentMethodsAPI } from "../services/api";
import { toast } from "sonner";

interface PaymentPageProps {
  bookingDetails: {
    driverName: string;
    rating: number;
    departureTime: string;
    destination: string;
    quadrant: string;
    seatNumber: number;
    price: number;
    car: string;
    carType: string;
    bookingDate: string;
    rideId?: string;
  };
  onBack: () => void;
  onConfirm: (paymentMethod: string, pickupAddress: string) => void;
}

export function PaymentPage({ bookingDetails, onBack, onConfirm }: PaymentPageProps) {
  const [paymentSource, setPaymentSource] = useState<"saved" | "manual">("saved");
  const [selectedSavedMethod, setSelectedSavedMethod] = useState<string>("");
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<any[]>([]);
  const [isLoadingMethods, setIsLoadingMethods] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Address fields
  const [pickupAddress, setPickupAddress] = useState("");

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await paymentMethodsAPI.getPaymentMethods();
        setSavedPaymentMethods(response.data || []);
        // Auto-select default payment method if available
        const defaultMethod = response.data?.find((m: any) => m.is_default);
        if (defaultMethod) {
          setSelectedSavedMethod(defaultMethod.id);
        } else if (response.data?.length > 0) {
          setSelectedSavedMethod(response.data[0].id);
        } else {
          // No saved methods, switch to manual entry
          setPaymentSource("manual");
        }
      } catch (error: any) {
        console.error("Failed to fetch payment methods:", error);
        // If no saved methods, default to manual entry
        setPaymentSource("manual");
      } finally {
        setIsLoadingMethods(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Formats the card number to be displayed in the UI
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.slice(0, 2) + "/" + v.slice(2, 4);
    }
    return v;
  };
// Formats the card number to be displayed in the UI
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };
// Formats the expiry date to be displayed in the UI
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.length <= 5) {
      setExpiryDate(formatted);
    }
  };
// Formats the CVV to be displayed in the UI
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, "");
    if (value.length <= 3) {
      setCvv(value);
    }
  };
// Handles the payment process
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      let paymentMethodString = "";

      if (paymentSource === "saved" && selectedSavedMethod) {
        const selectedMethod = savedPaymentMethods.find(m => m.id === selectedSavedMethod);
        if (selectedMethod) {
          paymentMethodString = `${selectedMethod.brand || 'Card'} •••• ${selectedMethod.last4}`;
        }
      } else {
        // Manual entry
        if (!isFormValid()) {
          toast.error("Please fill in all card details");
          setIsProcessing(false);
          return;
        }

        paymentMethodString = `Card •••• ${cardNumber.slice(-4)}`;

        // Save payment method if user opted to save
        if (savePaymentMethod) {
          try {
            const cardNumberClean = cardNumber.replace(/\s/g, "");
            const [expMonth, expYear] = expiryDate.split("/");
            
            await paymentMethodsAPI.createPaymentMethod({
              type: "credit",
              brand: "Card",
              last4: cardNumberClean.slice(-4),
              expiryMonth: parseInt(expMonth),
              expiryYear: 2000 + parseInt(expYear), // Convert YY to YYYY
              cardholderName: cardName,
              isDefault: savedPaymentMethods.length === 0, // Set as default if first card
            });
          } catch (error: any) {
            console.error("Failed to save payment method:", error);
            // Continue with payment even if saving fails
          }
        }
      }

      // Validate address is entered
      if (!pickupAddress.trim()) {
        toast.error("Please enter your pickup address to proceed");
        setIsProcessing(false);
        return;
      }

      // Simulate payment processing
      setTimeout(() => {
        setIsProcessing(false);
        onConfirm(paymentMethodString, pickupAddress.trim());
      }, 1500);
    } catch (error: any) {
      setIsProcessing(false);
      toast.error("Payment failed", {
        description: error.message || "Please try again.",
      });
    }
  };

  // Validates the form for user inputs 
  const isFormValid = () => {
    // Address is required
    if (!pickupAddress.trim()) {
      return false;
    }
    
    // Payment method validation
    if (paymentSource === "saved") {
      return selectedSavedMethod !== "";
    }
    return (
      cardNumber.replace(/\s/g, "").length === 16 &&
      expiryDate.length === 5 &&
      cvv.length === 3 &&
      cardName.trim().length > 0
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
            Enter your pickup location address. This will be your pickup location for the ride.
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickupAddress">Address</Label>
              <Input
                id="pickupAddress"
                type="text"
                placeholder="e.g., 123 Main St, Calgary, AB"
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                required
                className="bg-input-background"
              />
              <p className="text-xs text-muted-foreground">
                This address will be used as your pickup location
              </p>
            </div>

            {!pickupAddress.trim() && (
              <div className="flex items-center gap-2 text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded">
                <AlertCircle className="w-4 h-4" />
                <span>Address is required to proceed with booking</span>
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
                <p className="font-medium">{pickupAddress || "Not set"}</p>
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
          
          <RadioGroup value={paymentSource} onValueChange={(value: string) => setPaymentSource(value as "saved" | "manual")}>
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
          {paymentSource === "saved" && (
            <div className="mt-4 space-y-3">
              {isLoadingMethods ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading payment methods...</p>
                </div>
              ) : savedPaymentMethods.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No saved payment methods</p>
                  <p className="text-xs mt-1">Switch to manual entry to add one</p>
                </div>
              ) : (
                <RadioGroup value={selectedSavedMethod} onValueChange={setSelectedSavedMethod}>
                  <div className="space-y-2">
                    {savedPaymentMethods.map((method) => (
                      <div
                        key={method.id}
                        className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-accent"
                      >
                        <RadioGroupItem value={method.id} id={`saved-${method.id}`} />
                        <Label htmlFor={`saved-${method.id}`} className="flex items-center gap-2 cursor-pointer flex-1">
                          <CreditCard className="w-4 h-4" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                {method.brand || 'Card'} •••• {method.last4}
                              </span>
                              {method.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                            </div>
                            {method.cardholder_name && (
                              <p className="text-xs text-muted-foreground">{method.cardholder_name}</p>
                            )}
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

          {/* Manual Card Details Form */}
          {paymentSource === "manual" && (
            <div className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  maxLength={19}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    placeholder="123"
                    value={cvv}
                    onChange={handleCvvChange}
                    maxLength={3}
                  />
                </div>
              </div>

              {/* Save Payment Method Option */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="savePayment"
                  checked={savePaymentMethod}
                  onCheckedChange={(checked: boolean) => setSavePaymentMethod(checked)}
                />
                <Label htmlFor="savePayment" className="text-sm cursor-pointer">
                  Save this payment method for future use
                </Label>
              </div>
            </div>
          )}
        </Card>

        {/* Price Breakdown */}
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

      {/* Fixed Payment Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t">
        <Button 
          className="w-full" 
          onClick={handlePayment}
          disabled={!isFormValid() || isProcessing}
        >
          {isProcessing ? (
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