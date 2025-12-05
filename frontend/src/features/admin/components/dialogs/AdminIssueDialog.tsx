import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../../components/ui/dialog";
import { Badge } from "../../../../components/ui/badge";
import { Button } from "../../../../components/ui/button";
import { CheckCircle2, FolderOpen, Eye } from "lucide-react";
import type { AdminIssueView } from "../../../../types/api_interfaces";

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

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

interface Props { open: boolean; issue: AdminIssueView | null; onOpenChange: (o: boolean) => void; onResolve: (i: AdminIssueView) => void; onReopen: (i: AdminIssueView) => void; onUnderReview: (i: AdminIssueView) => void;}

export function AdminIssueDialog({ open, issue, onOpenChange, onResolve, onReopen, onUnderReview }: Props) {
  if (!issue) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Details</DialogTitle>
          <DialogDescription>Review and resolve complaint</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`text-xs ${getPriorityColor(issue.priority)}`}>
                {capitalize(issue.priority)}
              </Badge>
              <Badge className={`text-xs ${getStatusColor(issue.status)}`}>
                {capitalize(issue.status)}
              </Badge>
            </div>
            <h3 className="font-medium">{issue.subject}</h3>
            <p className="text-sm text-muted-foreground mt-2">{issue.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Reporter</p>
              <p className="font-medium">{issue.reporter}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Reported User</p>
              <p className="font-medium">{issue.reportedUser || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{capitalize(issue.type.replace(/-/g, ' '))}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{issue.date}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {issue.dbStatus === "open" && (
            <>
              <Button onClick={() => onUnderReview(issue)} className="w-full sm:w-auto" variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
                Under Review
              </Button>
              <Button onClick={() => onResolve(issue)} className="w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            </>
          )}
          {issue.dbStatus === "under_review" && (
            <>
              <Button onClick={() => onReopen(issue)} className="w-full sm:w-auto" variant="secondary">
                <FolderOpen className="w-4 h-4 mr-2" />
                Reopen
              </Button>
              <Button onClick={() => onResolve(issue)} className="w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Resolved
              </Button>
            </>
          )}
          {issue.dbStatus === "resolved" && (
            <Button onClick={() => onReopen(issue)} className="w-full sm:w-auto" variant="secondary">
              <FolderOpen className="w-4 h-4 mr-2" />
              Reopen Issue
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto" variant="outline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
