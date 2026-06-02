import { httpClient } from '@/api/httpClient';
import type {
  InventoryReportDto,
  MechanicsReportDto,
  PaymentsReportDto,
  ReportDateRangeParams,
  SalesReportDto,
  ServiceOrdersReportDto,
} from '@/features/admin/reports/types/reports.types';

function toReportQueryParams(
  params?: ReportDateRangeParams,
): Record<string, string> | undefined {
  if (!params?.from && !params?.to) {
    return undefined;
  }

  const query: Record<string, string> = {};
  if (params.from) {
    query.from = params.from;
  }
  if (params.to) {
    query.to = params.to;
  }
  return query;
}

export const reportsApi = {
  getSales(params?: ReportDateRangeParams) {
    return httpClient.get<SalesReportDto>('/api/admin/reports/sales', {
      params: toReportQueryParams(params),
    });
  },

  getInventory(params?: ReportDateRangeParams) {
    return httpClient.get<InventoryReportDto>('/api/admin/reports/inventory', {
      params: toReportQueryParams(params),
    });
  },

  getMechanics(params?: ReportDateRangeParams) {
    return httpClient.get<MechanicsReportDto>('/api/admin/reports/mechanics', {
      params: toReportQueryParams(params),
    });
  },

  getServiceOrders(params?: ReportDateRangeParams) {
    return httpClient.get<ServiceOrdersReportDto>(
      '/api/admin/reports/service-orders',
      { params: toReportQueryParams(params) },
    );
  },

  getPayments(params?: ReportDateRangeParams) {
    return httpClient.get<PaymentsReportDto>('/api/admin/reports/payments', {
      params: toReportQueryParams(params),
    });
  },
};
