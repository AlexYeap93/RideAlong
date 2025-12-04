import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { useSettingsProfile } from "../hooks/useSettingsProfile";

export function ProfileSettingsForm({ user, onUserUpdated }: { user: any; onUserUpdated?: (updated: any) => void; }) {
    const { name, phone, setName, setPhone, saveProfile, loading, } = useSettingsProfile(user, onUserUpdated);
    return (
        <form onSubmit={(e) => { e.preventDefault(); saveProfile(); }} className="space-y-4">
            <div className="space-y-1">
                <Label>Name</Label>
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>

            <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="e.g., +1-123-456-7890 (optional)" type="tel" />
                <p className="text-xs text-muted-foreground">Format: +1-XXX-XXX-XXXX or (XXX) XXX-XXXX</p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Changes"}
            </Button>
        </form>
    );
}
