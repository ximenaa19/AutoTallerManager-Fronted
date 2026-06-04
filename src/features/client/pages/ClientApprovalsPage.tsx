import { useCallback, useMemo } from 'react';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { LoadingState } from '@/components/feedback/LoadingState';
import { Button } from '@/components/ui/Button';
import { ClientPendingApprovalCard } from '@/features/client/components/ClientPendingApprovalCard';
import { useClientPendingApprovals } from '@/features/client/hooks/useClientPendingApprovals';

const REJECT_CONFIRMATION_MESSAGE =
  'Are you sure you want to reject this item? Rejected items will not be billed.';

export function ClientApprovalsPage() {
  const approvals = useClientPendingApprovals();

  const pendingApprovals = useMemo(
    () =>
      approvals.approvals.filter(
        (approval) =>
          approval.pendingServices.length > 0 || approval.pendingParts.length > 0,
      ),
    [approvals.approvals],
  );

  const handleServiceApprove = useCallback(
    (orderServiceId: number) => {
      void approvals.runApprovalAction('service', orderServiceId, 'approve');
    },
    [approvals],
  );

  const handleServiceReject = useCallback(
    (orderServiceId: number) => {
      if (!window.confirm(REJECT_CONFIRMATION_MESSAGE)) {
        return;
      }

      void approvals.runApprovalAction('service', orderServiceId, 'reject');
    },
    [approvals],
  );

  const handlePartApprove = useCallback(
    (orderServicePartId: number) => {
      void approvals.runApprovalAction('part', orderServicePartId, 'approve');
    },
    [approvals],
  );

  const handlePartReject = useCallback(
    (orderServicePartId: number) => {
      if (!window.confirm(REJECT_CONFIRMATION_MESSAGE)) {
        return;
      }

      void approvals.runApprovalAction('part', orderServicePartId, 'reject');
    },
    [approvals],
  );

  if (approvals.isLoading) {
    return (
      <LoadingState
        title="Loading pending approvals"
        description="Getting services and parts waiting for your approval."
        className="min-h-[420px]"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <DashboardHeader
          title="Pending Approvals"
          subtitle="Review services and parts waiting for your approval."
        />
        <Button
          variant="secondary"
          leftIcon={<RefreshCw className="size-4" />}
          onClick={() => {
            approvals.clearMessages();
            void approvals.retry();
          }}
          disabled={approvals.isActionRunning}
        >
          Refresh
        </Button>
      </div>

      {approvals.successMessage ? (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {approvals.successMessage}
        </div>
      ) : null}

      {approvals.actionError ? (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {approvals.actionError}
        </div>
      ) : null}

      {approvals.error ? (
        <ErrorState
          title="Unable to load pending approvals"
          message={approvals.error}
          onRetry={approvals.retry}
        />
      ) : pendingApprovals.length === 0 ? (
        <EmptyState
          title="You have no pending approvals right now."
          description="Approved and rejected items will no longer appear here."
          icon={<CheckCircle2 className="size-6" />}
          className="rounded-lg border border-border bg-bg-surface"
        />
      ) : (
        <div className="space-y-4">
          {pendingApprovals.map((approval) => (
            <ClientPendingApprovalCard
              key={approval.serviceOrderId}
              approval={approval}
              isActionRunning={approvals.isActionRunning}
              isDecisionRunning={approvals.isDecisionRunning}
              onServiceApprove={handleServiceApprove}
              onServiceReject={handleServiceReject}
              onPartApprove={handlePartApprove}
              onPartReject={handlePartReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
