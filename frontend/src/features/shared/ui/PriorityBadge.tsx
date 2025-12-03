import { Badge } from "../../../components/ui/badge";

const colors: Record<string, string> = {
  critical: "bg-red-100 text-red-800",
  high: "bg-orange-100 text-orange-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

export function PriorityBadge({ level }: { level: string }) {
  const key = level.toLowerCase();
  return <Badge className={`text-xs ${colors[key] || colors["medium"]}`}>{level}</Badge>;
}
