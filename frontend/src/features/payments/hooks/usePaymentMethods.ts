import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { paymentMethodsAPI } from "../../../services/PaymentServices";
import type { FrontendPaymentMethod as PaymentMethod } from "../../../types/api_interfaces";
import type { AddCardParams } from "../../../serviceInterface";

export function usePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const getCardBrand = (cardNumber: string): string => {
    const num = cardNumber.replace(/\s/g, "");
    if (num.startsWith("4")) return "Visa";
    if (num.startsWith("5")) return "Mastercard";
    if (num.startsWith("3")) return "American Express";
    return "Card";
  };

  const fetchPaymentMethods = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentMethodsAPI.getPaymentMethods();
      setPaymentMethods(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch payment methods:", error);
      toast.error("Failed to load payment methods", {
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const addCard = async ({
    cardNumber,
    cardName,
    expiryDate,
    cvv,
  }: AddCardParams): Promise<boolean> => {
    setSubmitting(true);
    try {
      const cardNumberClean = cardNumber.replace(/\s/g, "");

      // basic validation
      if (cardNumberClean.length !== 16) {
        toast.error("Please enter a valid 16-digit card number");
        return false;
      }

      if (!/^\d{3}$/.test(cvv)) {
        toast.error("Please enter a valid 3-digit CVV");
        return false;
      }

      const [expMonthStr, expYearStr] = expiryDate.split("/");
      if (
        !expMonthStr ||
        !expYearStr ||
        expMonthStr.length !== 2 ||
        expYearStr.length !== 2
      ) {
        toast.error("Please enter a valid expiry date (MM/YY)");
        return false;
      }

      const expiryMonth = parseInt(expMonthStr, 10);
      const expiryYear = 2000 + parseInt(expYearStr, 10);

      if (
        isNaN(expiryMonth) ||
        isNaN(expiryYear) ||
        expiryMonth < 1 ||
        expiryMonth > 12
      ) {
        toast.error("Please enter a valid expiry date (MM/YY)");
        return false;
      }

      await paymentMethodsAPI.createPaymentMethod({
        type: "credit",
        brand: getCardBrand(cardNumberClean),
        last4: cardNumberClean.slice(-4),
        expiryMonth,
        expiryYear,
        cardholderName: cardName,
        isDefault: paymentMethods.length === 0,
      });

      toast.success("Payment method added successfully!");
      await fetchPaymentMethods();
      return true;
    } catch (error: any) {
      toast.error("Failed to add payment method", {
        description: error.message || "Please try again.",
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const setDefault = async (id: string) => {
    setSubmitting(true);
    try {
      await paymentMethodsAPI.updatePaymentMethod(id, { isDefault: true });
      toast.success("Default payment method updated");
      await fetchPaymentMethods();
    } catch (error: any) {
      toast.error("Failed to update default payment method", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id: string) => {
    setSubmitting(true);
    try {
      await paymentMethodsAPI.deletePaymentMethod(id);
      toast.success("Payment method removed");
      await fetchPaymentMethods();
    } catch (error: any) {
      toast.error("Failed to remove payment method", {
        description: error.message || "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    paymentMethods,
    loading,
    submitting,
    fetchPaymentMethods,
    addCard,
    setDefault,
    remove,
  };
}
