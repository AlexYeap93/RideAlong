import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { useSettingsPassword } from "../hooks/useSettingsPassword";

export function PasswordSettingsForm({ user, onUserUpdated }: { user: any; onUserUpdated?: (updated: any) => void; }) {
    const { oldPassword, newPassword, confirmPassword, setOldPassword, setNewPassword, setConfirmPassword, updatePassword, loading, } = useSettingsPassword(user, onUserUpdated);
    return (
        <form onSubmit={(e) => { e.preventDefault(); updatePassword(); }} className="space-y-4">
            <div className="space-y-1">
                <Label>Old Password</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} required />
            </div>

            <div className="space-y-1">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
                <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and number
                </p>
            </div>

            <div className="space-y-1">
                <Label>Confirm Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Updating..." : "Update Password"}
            </Button>
        </form>
    );
}
