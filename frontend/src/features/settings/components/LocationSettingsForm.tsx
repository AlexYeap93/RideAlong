import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import { useSettingsLocation } from "../hooks/useSettingsLocation";

export function LocationSettingsForm({ user, onUserUpdated }: { user: any; onUserUpdated?: (updated: any) => void; }) {
    const {
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
    } = useSettingsLocation(user, onUserUpdated);

    return (
        <form onSubmit={(e) => { e.preventDefault(); saveLocation(); }} className="space-y-4">
            <div className="space-y-1">
                <Label>Address</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                    <Label>City</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <Label>Province</Label>
                    <Input value={province} onChange={(e) => setProvince(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <Label>Postal Code</Label>
                    <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value.toUpperCase())} placeholder="A1A 1A1" maxLength={7} />
                    <p className="text-xs text-muted-foreground">Format: A1A 1A1</p>
                </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Save Location"}
            </Button>
        </form>
    );
}
