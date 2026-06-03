import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage, isApiError } from '@/api/apiError';
import { clientApprovalsApi } from '@/features/client/api/clientApprovals.api';
import type {
  ClientApprovalDecision,
  ClientApprovalItemType,
  ClientPendingApprovalDto,
} from '@/features/client/types/clientApprovals.types';

function getActionKey(type: ClientApprovalItemType, id: number): string {
  return `${type}:${id}`;
}

function getFriendlyApprovalError(error: unknown): string {
  if (isApiError(error)) {
    switch (error.code) {
      case 'AlreadyApproved':
        return 'This item was already approved.';
      case 'AlreadyRejected':
        return 'This item was already rejected.';
      case 'ApprovalAlreadyDecided':
        return 'This approval was already decided.';
      case 'NotOwner':
        return 'You can only approve items that belong to your account.';
      case 'NotFound':
        return 'This pending approval was not found.';
      case 'Unauthorized':
        return 'You need to sign in again before approving this item.';
      case 'Forbidden':
        return 'You do not have permission to approve this item.';
      default:
        return error.message;
    }
  }

  return getErrorMessage(error);
}

export function useClientPendingApprovals() {
  const [approvals, setApprovals] = useState<ClientPendingApprovalDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeActionKey, setActiveActionKey] = useState<string | null>(null);
  const [activeDecision, setActiveDecision] = useState<ClientApprovalDecision | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientApprovalsApi.getPendingApprovals();
      setApprovals(response.data);
    } catch (loadError) {
      setApprovals([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApprovals();
  }, [loadApprovals]);

  const runApprovalAction = useCallback(
    async (type: ClientApprovalItemType, id: number, decision: ClientApprovalDecision) => {
      const nextActionKey = getActionKey(type, id);

      if (activeActionKey) {
        return;
      }

      setActiveActionKey(nextActionKey);
      setActiveDecision(decision);
      setActionError(null);
      setSuccessMessage(null);

      try {
        if (type === 'service' && decision === 'approve') {
          await clientApprovalsApi.approveOrderService(id);
        } else if (type === 'service' && decision === 'reject') {
          await clientApprovalsApi.rejectOrderService(id);
        } else if (type === 'part' && decision === 'approve') {
          await clientApprovalsApi.approveOrderServicePart(id);
        } else {
          await clientApprovalsApi.rejectOrderServicePart(id);
        }

        setSuccessMessage(
          decision === 'approve'
            ? 'Approval recorded successfully.'
            : 'Rejection recorded successfully.',
        );
        await loadApprovals();
      } catch (approvalError) {
        setActionError(getFriendlyApprovalError(approvalError));
      } finally {
        setActiveActionKey(null);
        setActiveDecision(null);
      }
    },
    [activeActionKey, loadApprovals],
  );

  const isActingOn = useCallback(
    (type: ClientApprovalItemType, id: number) => activeActionKey === getActionKey(type, id),
    [activeActionKey],
  );

  const isDecisionRunning = useCallback(
    (type: ClientApprovalItemType, id: number, decision: ClientApprovalDecision) =>
      activeActionKey === getActionKey(type, id) && activeDecision === decision,
    [activeActionKey, activeDecision],
  );

  const clearMessages = useCallback(() => {
    setActionError(null);
    setSuccessMessage(null);
  }, []);

  return {
    approvals,
    isLoading,
    error,
    retry: loadApprovals,
    activeActionKey,
    activeDecision,
    isActionRunning: activeActionKey !== null,
    actionError,
    successMessage,
    runApprovalAction,
    isActingOn,
    isDecisionRunning,
    clearMessages,
  };
}
