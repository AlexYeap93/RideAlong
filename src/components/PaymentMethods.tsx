import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Plus, 
  MoreVertical,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { toast } from "sonner@2.0.3";

interface PaymentMethodsProps {
  onBack: () => void;
}

export function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  // Mock saved payment methods
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: "credit",
      brand: "Visa",
      last4: "4242",
      expiry: "12/26",
      isDefault: true
    },
    {
      id: 2,
      type: "credit",
      brand: "Mastercard",
      last4: "8888",
      expiry: "03/25",
      isDefault: false
    }
  ]);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Payment method added successfully!");
    setShowAddCard(false);
    setCardNumber("");
    setCardName("");
    setExpiryDate("");
    setCvv("");
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast.success("Default payment method updated");
  };

  const handleRemove = (id: number) => {
    setPaymentMethods(methods => methods.filter(method => method.id !== id));
    toast.success("Payment method removed");
  };

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

                <Button type="submit" className="w-full">
                  Add Card
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {paymentMethods.map((method) => (
          <Card key={method.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{method.brand}</p>
                  {method.isDefault && (
                    <Badge variant="secondary" className="text-xs">
                      <Check className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  •••• •••• •••• {method.last4}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {method.expiry}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!method.isDefault && (
                    <DropdownMenuItem onClick={() => handleSetDefault(method.id)}>
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => handleRemove(method.id)}>
                    Remove Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}

        {/* RideAlong Wallet */}
        <Card className="p-4 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            
            <div className="flex-1">
              <p className="font-medium mb-1">RideAlong Wallet</p>
              <p className="text-2xl font-medium mb-2">$25.00</p>
              <p className="text-xs text-primary-foreground/80">
                Available balance
              </p>
            </div>

            <Button 
              variant="secondary" 
              size="sm"
              className="bg-white text-primary hover:bg-white/90"
            >
              Add Funds
            </Button>
          </div>
        </Card>
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
