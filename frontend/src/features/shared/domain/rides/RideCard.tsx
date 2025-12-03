import { Card } from "../../../../components/ui/card";
import { MapPin } from "lucide-react";

export interface RideCardProps { id: number; origin: string; destination: string; date: string; driverName: string; price: number; onClick?: () => void; }

export function RideCard({ origin, destination, date, driverName, price, onClick }: RideCardProps) {
  return (
    <Card className="p-4 cursor-pointer" onClick={onClick}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <MapPin className="w-4 h-4" />
          {origin} → {destination}
        </div>
        <p className="text-sm">Driver: {driverName}</p>
        <p className="text-sm text-muted-foreground">{date}</p>
        <p className="font-medium">${price}</p>
      </div>
    </Card>
  );
}
