import { Card } from "../../../components/ui/card";

export function SettingsSection({ title, description, children, }: { title: string; description?: string; children: React.ReactNode; }) {
    return (
        <Card className="p-6 space-y-4">
            <div>
                <h2 className="font-semibold text-lg">{title}</h2> {description && (<p className="text-sm text-muted-foreground">{description}</p>)}
            </div>
            {children}
        </Card>
    );
}
