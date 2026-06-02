import { useCallback, useMemo, useState } from 'react';
import type { ReportDateRangeParams } from '@/features/admin/reports/types/reports.types';

export interface ReportDateRangeDraft {
  fromDate: string;
  toDate: string;
}

const emptyDraft: ReportDateRangeDraft = { fromDate: '', toDate: '' };

function toIsoDateTimeStart(date: string): string {
  return `${date}T00:00:00`;
}

function toIsoDateTimeEnd(date: string): string {
  return `${date}T23:59:59`;
}

export function draftToQueryParams(
  draft: ReportDateRangeDraft,
): ReportDateRangeParams | undefined {
  const from = draft.fromDate.trim();
  const to = draft.toDate.trim();

  if (!from && !to) {
    return undefined;
  }

  const params: ReportDateRangeParams = {};
  if (from) {
    params.from = toIsoDateTimeStart(from);
  }
  if (to) {
    params.to = toIsoDateTimeEnd(to);
  }
  return params;
}

export function useReportFilters() {
  const [draft, setDraft] = useState<ReportDateRangeDraft>(emptyDraft);
  const [appliedDraft, setAppliedDraft] = useState<ReportDateRangeDraft>(emptyDraft);

  const queryParams = useMemo(
    () => draftToQueryParams(appliedDraft),
    [appliedDraft],
  );

  const apply = useCallback(() => {
    setAppliedDraft({ ...draft });
  }, [draft]);

  const clear = useCallback(() => {
    setDraft(emptyDraft);
    setAppliedDraft(emptyDraft);
  }, []);

  const hasAppliedRange = Boolean(appliedDraft.fromDate || appliedDraft.toDate);

  const rangeLabel = useMemo(() => {
    if (!hasAppliedRange) {
      return 'All time (no date filter)';
    }
    if (appliedDraft.fromDate && appliedDraft.toDate) {
      return `${appliedDraft.fromDate} → ${appliedDraft.toDate}`;
    }
    if (appliedDraft.fromDate) {
      return `From ${appliedDraft.fromDate}`;
    }
    return `Through ${appliedDraft.toDate}`;
  }, [appliedDraft, hasAppliedRange]);

  return {
    draft,
    setDraft,
    queryParams,
    apply,
    clear,
    hasAppliedRange,
    rangeLabel,
  };
}
