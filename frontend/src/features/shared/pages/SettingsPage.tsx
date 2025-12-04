import { ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { SettingsSection } from "../../settings/components/SettingsSection";
import { ProfileSettingsForm } from "../../settings/components/ProfileSettingsForm";
import { LocationSettingsForm } from "../../settings/components/LocationSettingsForm";
import { PasswordSettingsForm } from "../../settings/components/PasswordSettingsForm";
import type { SettingsPageProps } from "../../../serviceInterface";

export function SettingsPage({
    user,
    onBack,
    onUserUpdated
}: SettingsPageProps) {

    return (
        <div className="pb-20 bg-background min-h-screen">
            <div className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-medium">Settings</h1>
                        <p className="text-sm text-primary-foreground/80">Manage your profile</p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">

                <SettingsSection title="Profile Information">
                    <Card className="p-4">
                        <ProfileSettingsForm user={user} onUserUpdated={onUserUpdated} />
                    </Card>
                </SettingsSection>

                <SettingsSection title="Home Address">
                    <Card className="p-4">
                        <LocationSettingsForm user={user} onUserUpdated={onUserUpdated} />
                    </Card>
                </SettingsSection>

                <SettingsSection title="Password">
                    <Card className="p-4">
                        <PasswordSettingsForm user={user} onUserUpdated={onUserUpdated} />
                    </Card>
                </SettingsSection>

            </div>
        </div>
    );
}
