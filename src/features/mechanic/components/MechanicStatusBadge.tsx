import { Badge } from '@/components/ui/Badge';
import type { MechanicWorkReportStatus } from '@/features/mechanic/utils/workReportStatus';

export type { MechanicWorkReportStatus };

export interface MechanicStatusBadgeProps {
  workReportStatus: MechanicWorkReportStatus;
  customerApproved?: boolean;
}

function CustomerApprovalBadge({ customerApproved }: { customerApproved?: boolean }) {
  if (customerApproved === true) {
    return (
      <Badge variant="completed" dot>
        Customer approved
      </Badge>
    );
  }

  if (customerApproved === false) {
    return (
      <Badge variant="cancelled" dot>
        Customer rejected
      </Badge>
    );
  }

  return (
    <Badge variant="pending" dot>
      Approval pending
    </Badge>
  );
}

export function MechanicStatusBadge({
  workReportStatus,
  customerApproved,
}: MechanicStatusBadgeProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {workReportStatus === 'needs-report' ? (
        <Badge variant="pending" dot>
          Work report pending
        </Badge>
      ) : (
        <Badge variant="completed" dot>
          Work recorded
        </Badge>
      )}
      <CustomerApprovalBadge customerApproved={customerApproved} />
    </div>
  );
}
