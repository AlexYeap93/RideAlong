import { Card } from "../../../components/ui/card";

export function EmptyStateCard({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <Card className="p-8 text-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        {icon}
        <p>{message}</p>
      </div>
    </Card>
  );
}
