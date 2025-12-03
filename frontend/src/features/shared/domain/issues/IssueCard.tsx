import { Card } from "../../../../components/ui/card";
import { PriorityBadge } from "../../../shared/ui/PriorityBadge";
import { StatusBadge } from "../../../shared/ui/StatusBadge";
import { AlertTriangle } from "lucide-react";

export interface IssueCardProps { subject: string; description: string; date: string; reporter: string; priority: string; status: string; onClick?: () => void;}

export function IssueCard(props: IssueCardProps) {
  const { subject, description, date, reporter, priority, status, onClick } = props;

  return (
    <Card className="p-4 cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium">{subject}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          <div className="flex items-center gap-2 mt-2">
            <PriorityBadge level={priority} />
            <StatusBadge status={status} />
            <span className="text-xs text-muted-foreground">{date}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">By {reporter}</p>
        </div>
      </div>
    </Card>
  );
}
