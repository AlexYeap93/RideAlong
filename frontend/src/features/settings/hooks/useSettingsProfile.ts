import { useState, useEffect } from "react";
import { usersAPI } from "../../../services/api";
import { toast } from "sonner";

export function useSettingsProfile(initialUser: any, onUserUpdated?: (u: any) => void) {
  const [name, setName] = useState(initialUser?.name || "");
  const [phone, setPhone] = useState(initialUser?.phone || "");
  const [loading, setLoading] = useState(false);

  // Update state when initialUser changes
  useEffect(() => {
    setName(initialUser?.name || "");
    setPhone(initialUser?.phone || "");
  }, [initialUser]);

  const saveProfile = async () => {
    if (!initialUser?.id) return toast.error("Missing user ID");

    // Validate phone number format if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      if (!phoneRegex.test(phone.trim())) {
        return toast.error("Invalid phone number format");
      }
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone?.trim() || null,
      };

      const res = await usersAPI.updateUser(initialUser.id, payload);
      const updated = res.data;

      toast.success("Profile updated");

      onUserUpdated?.(updated);
    } catch (err: any) {
      toast.error("Failed to update profile", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return {
    name,
    phone,
    setName,
    setPhone,
    saveProfile,
    loading,
  };
}
