import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { ArrowLeft, Trash2, CreditCard, Wallet, Plus, MoreVertical,Check} from "lucide-react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogTrigger} from "./ui/dialog";
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger} from "./ui/dropdown-menu";
import { toast } from "sonner";
import { paymentMethodsAPI } from "../services/api";

interface PaymentMethodsProps {
  onBack: () => void;
}
export function PaymentMethods({ onBack }: PaymentMethodsProps) {
  // from api.ts
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await paymentMethodsAPI.getPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCardBrand = (cardNumber: string): string => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "Mastercard";
    if (num.startsWith("3")) return "American Express";
    return "Card";
  };

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const cardNumberClean = cardNumber.replace(/\s/g, "");
      if (cardNumberClean.length !== 16) {
        toast.error("Please enter a valid 16-digit card number");
        setIsSubmitting(false);
        return;
      }

      const [expMonth, expYear] = expiryDate.split("/");
      if (!expMonth || !expYear || expMonth.length !== 2 || expYear.length !== 2) {
        toast.error("Please enter a valid expiry date (MM/YY)");
        setIsSubmitting(false);
        return;
      }
      //Saves payment method to database
      await paymentMethodsAPI.createPaymentMethod({
        type: "credit",
        brand: getCardBrand(cardNumberClean),
        last4: cardNumberClean.slice(-4),
        expiryMonth: parseInt(expMonth),
        expiryYear: 2000 + parseInt(expYear), // Convert YY to YYYY
        cardholderName: cardName,
        isDefault: paymentMethods.length === 0, // Set as default if first card
      });

      toast.success("Payment method added successfully!");
      setShowAddCard(false);
      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCvv("");
      await fetchPaymentMethods(); // Refresh the list
    } catch (error: any) {
      toast.error("Failed to add payment method", {
        description: error.message || "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  // Handles setting a payment method as default
  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodsAPI.updatePaymentMethod(id, { isDefault: true });
      toast.success("Default payment method updated");
      await fetchPaymentMethods(); // Refresh the list
    } catch (error: any) {
      toast.error("Failed to update default payment method", {
        description: error.message || "Please try again.",
      });
    }
  };
  // Handles removing a payment method
  const handleRemove = async (id: string) => {
    try {
      await paymentMethodsAPI.deletePaymentMethod(id);
      toast.success("Payment method removed");
      await fetchPaymentMethods(); // Refresh the list
    } catch (error: any) {
      toast.error("Failed to remove payment method", {
        description: error.message || "Please try again.",
      });
    }
  };
  // Formats the card number to be displayed in the UI
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  // Formats the expiry date to be displayed in the UI
  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
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
            <h1 className="text-xl font-medium">Payment Methods</h1>
            <p className="text-sm text-primary-foreground/80">
              Manage your payment options
            </p>
          </div>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Saved Cards</h2>
          <Dialog open={showAddCard} onOpenChange={setShowAddCard}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Payment Method</DialogTitle>
                <DialogDescription>
                  Enter your card details to add a new payment method.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddCard} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                      className="bg-input-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                      maxLength={3}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Card"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading payment methods...</p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No saved payment methods</p>
            <p className="text-sm text-muted-foreground">
              Add a payment method to get started
            </p>
          </Card>
        ) : (
          paymentMethods.map((method) => (
            <Card key={method.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{method.brand || 'Card'}</p>
                    {method.is_default && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    •••• •••• •••• {method.last4}
                  </p>
                  {method.cardholder_name && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.cardholder_name}
                    </p>
                  )}
                  {method.expiry_month && method.expiry_year && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires {String(method.expiry_month).padStart(2, '0')}/{String(method.expiry_year).slice(-2)}
                    </p>
                  )}
                </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemove(method.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Remove
              </Button>
              </div>
            </Card>
          ))
        )}

      </div>

      {/* Security Info */}
      <div className="px-4 mt-6">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h3 className="font-medium mb-2 text-blue-900">Secure Payments</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All payment information is encrypted</li>
            <li>• We never store your CVV</li>
            <li>• PCI-DSS compliant processing</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
