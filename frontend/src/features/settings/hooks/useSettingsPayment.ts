import { useEffect, useState } from "react";
import { paymentMethodsAPI } from "../../../services/PaymentServices";
import { toast } from "sonner";
import type { AddCardInput, FrontendPaymentMethod as PaymentMethod } from "../../../types/api_interfaces";

export function useSettingsPayment() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPaymentMethods = async () => {
    setLoading(true);
    try {
      const res = await paymentMethodsAPI.getPaymentMethods(); 
      const methods = (res.data || []).map((m: any) => ({
        id: m.id,
        type: m.type,
        brand: m.brand,
        last4: m.last4,
        expiryMonth: m.expiry_month,
        expiryYear: m.expiry_year,
        cardholderName: m.cardholder_name,
        isDefault: m.is_default,
      })) as PaymentMethod[];

      setPaymentMethods(methods);
    } catch (error: any) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const addCard = async (input: AddCardInput) => {
    setLoading(true);
    try {
      const res = await paymentMethodsAPI.createPaymentMethod({
        type: input.type,
        brand: input.brand,
        last4: input.last4,
        expiryMonth: input.expiryMonth,
        expiryYear: input.expiryYear,
        cardholderName: input.cardholderName,
        isDefault: input.isDefault,
      });

      const method = res.data;

      setPaymentMethods((prev) => [
        ...prev,
        {
          id: method.id,
          type: method.type,
          brand: method.brand,
          last4: method.last4,
          expiryMonth: method.expiry_month,
          expiryYear: method.expiry_year,
          cardholderName: method.cardholder_name,
          isDefault: method.is_default,
        },
      ]);

      toast.success("Card added");
    } catch (error: any) {
      console.error("Failed to add card:", error);
      toast.error(error.message || "Failed to add card");
    } finally {
      setLoading(false);
    }
  };

  // Remove card
  const removeCard = async (id: string) => {
    setLoading(true);
    try {
      await paymentMethodsAPI.deletePaymentMethod(id);

      setPaymentMethods((prev) => prev.filter((m) => m.id !== id));

      toast.success("Payment method removed");
    } catch (error: any) {
      console.error("Failed to remove card:", error);
      toast.error(error.message || "Failed to remove card");
    } finally {
      setLoading(false);
    }
  };

  // Set default card
  const setDefaultCard = async (id: string) => {
    setLoading(true);
    try {
      await paymentMethodsAPI.updatePaymentMethod(id, { isDefault: true });

      setPaymentMethods((prev) =>
        prev.map((m) => ({
          ...m,
          isDefault: m.id === id,
        }))
      );

      toast.success("Default card updated");
    } catch (error: any) {
      console.error("Failed to set default card:", error);
      toast.error(error.message || "Failed to update card");
    } finally {
      setLoading(false);
    }
  };

  return {
    paymentMethods,
    loading,
    addCard,
    removeCard,
    setDefaultCard,
    reload: loadPaymentMethods,
  };
}
