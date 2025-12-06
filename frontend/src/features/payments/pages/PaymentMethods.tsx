import { useState } from "react";
import { ArrowLeft, CreditCard, Plus, Trash2, Check } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,} from "../../../components/ui/dialog";
import { Badge } from "../../../components/ui/badge";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import type { PaymentMethodsProps } from "../../../serviceInterface";


const formatCardNumber = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts: string[] = [];

  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  return parts.length ? parts.join(" ") : value;
};

const formatExpiryDate = (value: string) => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  if (v.length >= 3) {
    return v.slice(0, 2) + "/" + v.slice(2, 4);
  }
  return v;
};

export function PaymentMethods({ onBack }: PaymentMethodsProps) {
  const navigate = useNavigate();

  const {paymentMethods,loading, submitting, addCard, remove, setDefault,} = usePaymentMethods();
  const [showAddCard, setShowAddCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleAddCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await addCard({ cardNumber, cardName, expiryDate, cvv,});

    if (success) {
      setShowAddCard(false);
      setCardNumber("");
      setCardName("");
      setExpiryDate("");
      setCvv("");
    }
  };

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onBack ? onBack() : navigate(-1)} className="text-primary-foreground hover:bg-primary-foreground/10">
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

              <form onSubmit={handleAddCardSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value)) } maxLength={19} required className="bg-input-background"/>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input id="cardName" placeholder="John Doe" value={cardName} onChange={(e) => setCardName(e.target.value)} required className="bg-input-background"/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <Input id="expiry" placeholder="MM/YY" value={expiryDate} onChange={(e) =>setExpiryDate(formatExpiryDate(e.target.value)) } maxLength={5} required className="bg-input-background" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" type="password" value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, "")) } maxLength={3} required className="bg-input-background" />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting} >
                  {submitting ? "Adding..." : "Add Card"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">
              Loading payment methods...
            </p>
          </div>
        ) : paymentMethods.length === 0 ? (
          <Card className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              No saved payment methods
            </p>
            <p className="text-sm text-muted-foreground">
              Add a payment method to get started.
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
                    <p className="font-medium">{method.brand || "Card"}</p>
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

                  {method.cardholderName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {method.cardholderName}
                    </p>
                  )}

                  {method.expiryMonth && method.expiryYear && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires{" "}
                      {String(method.expiryMonth).padStart(2, "0")}/
                      {String(method.expiryYear).slice(-2)}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {!method.isDefault && (
                    <Button variant="outline" size="sm" onClick={() => setDefault(method.id)} disabled={submitting}>
                      Set Default
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" onClick={() => remove(method.id)} disabled={submitting} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
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
