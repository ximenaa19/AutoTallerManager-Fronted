import { CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { ReportDateRangeDraft } from '@/features/admin/reports/hooks/useReportFilters';

export interface ReportDateRangeFilterProps {
  draft: ReportDateRangeDraft;
  onDraftChange: (draft: ReportDateRangeDraft) => void;
  onApply: () => void;
  onClear: () => void;
  rangeLabel: string;
}

export function ReportDateRangeFilter({
  draft,
  onDraftChange,
  onApply,
  onClear,
  rangeLabel,
}: ReportDateRangeFilterProps) {
  return (
    <section className="rounded-lg border border-border bg-bg-surface p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex max-w-2xl flex-col gap-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <CalendarRange className="size-4 text-accent" aria-hidden />
            Date range
          </div>
          <p className="text-sm text-text-secondary">
            Optional filters passed as <code className="text-xs">from</code> and{' '}
            <code className="text-xs">to</code> query parameters. Leave empty for
            all-time aggregates where supported.
          </p>
          <p className="text-xs text-text-muted">Active range: {rangeLabel}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Input
            name="reportFrom"
            label="From"
            type="date"
            value={draft.fromDate}
            onChange={(event) =>
              onDraftChange({ ...draft, fromDate: event.target.value })
            }
            className="min-w-[10rem]"
          />
          <Input
            name="reportTo"
            label="To"
            type="date"
            value={draft.toDate}
            onChange={(event) =>
              onDraftChange({ ...draft, toDate: event.target.value })
            }
            className="min-w-[10rem]"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={onApply}>
              Apply range
            </Button>
            <Button type="button" variant="secondary" onClick={onClear}>
              Clear
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
