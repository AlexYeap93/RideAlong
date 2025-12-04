import { useState } from "react";
import { usersAPI } from "../../../services/api";
import { toast } from "sonner";

export function useSettingsPassword(initialUser: any, onUserUpdated?: (u: any) => void) {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const updatePassword = async () => {
        if (!initialUser?.id) return toast.error("Missing user id");

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        // Validate password length
        if (newPassword.length < 8) {
            return toast.error("Password must be at least 8 characters long");
        }

        // Check password complexity
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumber = /[0-9]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumber) {
            return toast.error("Password must contain at least one uppercase letter, one lowercase letter, and one number");
        }

        setLoading(true);
        try {
            await usersAPI.updatePassword(initialUser.id, {
                oldPassword,
                newPassword,
            });
            toast.success("Password updated");
            onUserUpdated?.(initialUser);
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error("Failed to update password", { description: err.message });
        } finally {
            setLoading(false);
        }
    };

    return {
        oldPassword,
        newPassword,
        confirmPassword,
        setOldPassword,
        setNewPassword,
        setConfirmPassword,
        updatePassword,
        loading,
    };
}
