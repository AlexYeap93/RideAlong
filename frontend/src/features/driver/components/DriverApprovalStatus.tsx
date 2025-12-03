import { Card } from "../../../components/ui/card";
import { DriverApprovalStatusProps } from "../../shared/constants/const";
export function DriverApprovalStatus({ hasDriverApplication, isApprovedDriver, isCheckingDriver }: DriverApprovalStatusProps) {
  if (isCheckingDriver || !hasDriverApplication || isApprovedDriver) {
    return null;
  }

  return (
    <div className="px-4 mb-6">
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h3 className="font-medium text-yellow-900 mb-1">Driver Application Pending</h3>
            <p className="text-sm text-yellow-800">
              Your driver application is pending admin approval. You cannot list rides until you are approved.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

