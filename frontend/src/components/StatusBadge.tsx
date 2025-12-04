import { Badge } from "./ui/badge";
import { colors } from "../types/const";

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  return <Badge className={`text-xs ${colors[key] || colors["resolved"]}`}>{status}</Badge>;
}
