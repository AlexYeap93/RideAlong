import { useState, useEffect } from "react";
import { usersAPI } from "../../../services/UserServices";
import { toast } from "sonner";

export function useSettingsLocation(initialUser: any, onUserUpdated?: (u: any) => void) {

    const [address, setAddress] = useState(initialUser?.address ?? "");
    const [city, setCity] = useState(initialUser?.city ?? "");
    const [province, setProvince] = useState(initialUser?.province ?? "");
    const [postalCode, setPostalCode] = useState(initialUser?.postalCode ?? "");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setAddress(initialUser?.address ?? "");
        setCity(initialUser?.city ?? "");
        setProvince(initialUser?.province ?? "");
        setPostalCode(initialUser?.postalCode ?? "");
    }, [initialUser]);

    const saveLocation = async () => {
        if (!initialUser?.id) return toast.error("Missing user id");
        // Validate postal code
        if (postalCode && postalCode.trim()) {
            const postalRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
            if (!postalRegex.test(postalCode.trim())) {
                return toast.error("Invalid postal code format. Use format: A1A 1A1");
            }
        }

        // Validate that if any location field is provided, all are provided
        const hasAnyLocation = address.trim() || city.trim() || province.trim() || postalCode.trim();
        const hasAllLocation = address.trim() && city.trim() && province.trim() && postalCode.trim();

        if (hasAnyLocation && !hasAllLocation) {
            return toast.error("Please fill in all location fields (address, city, province, postal code)");
        }

        setLoading(true);
        try {
            const payload = {
                address: address.trim(),
                city: city.trim(),
                province: province.trim(),
                postalCode: postalCode.trim(),
            };

            const res = await usersAPI.updateUser(initialUser.id, payload);
            const updated = res.data;

            toast.success("Location updated");

            onUserUpdated?.(updated);
        } catch (err: any) {
            toast.error("Failed to update location");
        } finally {
            setLoading(false);
        }
    };

    return {
        address,
        city,
        province,
        postalCode,
        setAddress,
        setCity,
        setProvince,
        setPostalCode,
        saveLocation,
        loading,
    };
}
