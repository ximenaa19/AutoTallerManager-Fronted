import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { clientServiceOrdersApi } from '@/features/client/api/clientServiceOrders.api';
import type {
  ClientServiceOrderFullDetailDto,
  ClientServiceOrderSummaryDto,
} from '@/features/client/types/clientServiceOrders.types';

export function useClientServiceOrders() {
  const [serviceOrders, setServiceOrders] = useState<ClientServiceOrderSummaryDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceOrderId, setSelectedServiceOrderId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ClientServiceOrderFullDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadServiceOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await clientServiceOrdersApi.getMyServiceOrders();
      setServiceOrders(response.data);
    } catch (loadError) {
      setServiceOrders([]);
      setError(getErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadServiceOrderDetail = useCallback(async (serviceOrderId: number) => {
    setSelectedServiceOrderId(serviceOrderId);
    setDetailLoading(true);
    setDetailError(null);
    setDetail(null);

    try {
      const response = await clientServiceOrdersApi.getServiceOrderFullDetail(serviceOrderId);
      setDetail(response.data);
    } catch (loadError) {
      setDetailError(getErrorMessage(loadError));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const retryDetail = useCallback(() => {
    if (selectedServiceOrderId !== null) {
      void loadServiceOrderDetail(selectedServiceOrderId);
    }
  }, [loadServiceOrderDetail, selectedServiceOrderId]);

  const closeDetail = useCallback(() => {
    setSelectedServiceOrderId(null);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  }, []);

  useEffect(() => {
    void loadServiceOrders();
  }, [loadServiceOrders]);

  return {
    serviceOrders,
    isLoading,
    error,
    retry: loadServiceOrders,
    selectedServiceOrderId,
    detail,
    detailLoading,
    detailError,
    openDetail: loadServiceOrderDetail,
    retryDetail,
    closeDetail,
  };
}
