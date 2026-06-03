import { useCallback, useState } from 'react';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { receptionistInventoryApi } from '@/features/receptionist/api/receptionistInventory.api';
import type {
  InventorySummaryDto,
  LowStockPartDto,
} from '@/features/receptionist/types/receptionistInventory.types';

export interface UseReceptionistInventoryResult {
  summary: InventorySummaryDto | null;
  lowStockParts: LowStockPartDto[] | null;
  isSummaryLoading: boolean;
  isLowStockLoading: boolean;
  summaryError: string | null;
  lowStockError: string | null;
  isLoading: boolean;
  hasAnyError: boolean;
  reloadSummary: () => void;
  reloadLowStock: () => void;
  reloadAll: () => void;
}

export function useReceptionistInventory(): UseReceptionistInventoryResult {
  const [reloadKey, setReloadKey] = useState(0);

  const summaryRequest = useAsyncRequest(
    receptionistInventoryApi.getInventorySummary,
    [reloadKey],
  );
  const lowStockRequest = useAsyncRequest(
    receptionistInventoryApi.getLowStockParts,
    [reloadKey],
  );

  const reloadAll = useCallback(() => {
    setReloadKey((current) => current + 1);
  }, []);

  return {
    summary: summaryRequest.data,
    lowStockParts: lowStockRequest.data,
    isSummaryLoading: summaryRequest.isLoading,
    isLowStockLoading: lowStockRequest.isLoading,
    summaryError: summaryRequest.error,
    lowStockError: lowStockRequest.error,
    isLoading: summaryRequest.isLoading || lowStockRequest.isLoading,
    hasAnyError: Boolean(summaryRequest.error || lowStockRequest.error),
    reloadSummary: summaryRequest.retry,
    reloadLowStock: lowStockRequest.retry,
    reloadAll,
  };
}
