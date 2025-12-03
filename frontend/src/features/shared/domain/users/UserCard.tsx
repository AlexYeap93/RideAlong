import { Card } from "../../../../components/ui/card";
import { Avatar, AvatarFallback } from "../../../../components/ui/avatar";
import { StatusBadge } from "../../../shared/ui/StatusBadge";

export interface UserCardProps { id: number; name: string; email: string; type: string; status: string; totalRides: number; rating: string | number; onClick?: () => void;}

export function UserCard(props: UserCardProps) {
  const { name, email, type, status, rating, totalRides, onClick } = props;

  return (
    <Card className="p-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <Avatar className="w-10 h-10">
          <AvatarFallback>{name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{name}</p>
          </div>
          <p className="text-sm text-muted-foreground truncate">{email}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span>{totalRides} rides</span>
            <span>•</span>
            <span>{rating === "N/A" ? "N/A" : `★ ${rating}`}</span>
            <span>•</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </Card>
  );
}
