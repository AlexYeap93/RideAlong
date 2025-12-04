import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Eye, AlertTriangle } from "lucide-react";
import type { issueProps } from "../../../serviceInterface";


const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-800";
    case "resolved":
      return "bg-gray-100 text-gray-800";
    case "under review":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "critical":
      return "bg-red-100 text-red-800";
    case "high":
      return "bg-orange-100 text-orange-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function AdminIssuesSection({ complaints, isLoading, complaintFilter, onComplaintFilterChange, onComplaintClick,}: issueProps) 
{
  return (
    <>
      <Select value={complaintFilter} onValueChange={onComplaintFilterChange}>
        <SelectTrigger>
          <SelectValue placeholder="Filter complaints" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Issues</SelectItem>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading issues...</p>
        </div>
      ) : complaints.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No issues found</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {complaints.map((c) => (
            <Card key={c.id} className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{c.subject}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${getPriorityColor(c.priority)}`}>{c.priority}</Badge>
                    <Badge className={`text-xs ${getStatusColor(c.status)}`}>{c.status}</Badge>
                    <span className="text-xs text-muted-foreground">{c.type}</span>
                    <span className="text-xs text-muted-foreground">• {c.date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Reported by: {c.reporter}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onComplaintClick(c)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
