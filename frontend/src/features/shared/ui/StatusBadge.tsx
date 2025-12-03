import { Badge } from "../../../components/ui/badge";

const colors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
  open: "bg-blue-100 text-blue-800",
  resolved: "bg-gray-100 text-gray-800",
  "under review": "bg-yellow-100 text-yellow-800",
};

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <Badge className={`text-xs ${colors[key] || colors["resolved"]}`}>{status}</Badge>;
}
