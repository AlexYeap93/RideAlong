import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";

export function AddCardDialog({ children, onSubmit }: {
  children: React.ReactNode;
  onSubmit: (input: any) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const formatCardNumber = (value: string) =>
    value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();

  const formatExpiry = (value: string) =>
    value.replace(/\D/g, "").replace(/(\d{2})(\d{0,2})/, (_, m, y) =>
      y ? `${m}/${y}` : m
    );

  const getBrand = (num: string) => {
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "Mastercard";
    if (num.startsWith("3")) return "American Express";
    return "Card";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const clean = cardNumber.replace(/\s/g, "");
      if (clean.length !== 16) {
        toast.error("Invalid card number");
        return;
      }

      const [mm, yy] = expiry.split("/");
      if (!mm || !yy || mm.length !== 2 || yy.length !== 2) {
        toast.error("Invalid expiry date");
        return;
      }

      await onSubmit({
        type: "credit",
        brand: getBrand(clean),
        last4: clean.slice(-4),
        expiryMonth: Number(mm),
        expiryYear: 2000 + Number(yy),
        cardholderName: cardName,
        isDefault: false,
      });

      setOpen(false);
      setCardNumber("");
      setCardName("");
      setExpiry("");
      setCvv("");
      toast.success("Card added!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Enter your card details to add a new payment method.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Card Number</Label>
            <Input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              maxLength={19}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Cardholder Name</Label>
            <Input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Expiry</Label>
              <Input
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                maxLength={5}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>CVV</Label>
              <Input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                maxLength={3}
                required
              />
            </div>
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Adding..." : "Add Card"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
