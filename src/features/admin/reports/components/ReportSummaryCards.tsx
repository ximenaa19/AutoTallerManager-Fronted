import { StatCard, type StatCardTone } from '@/components/dashboard/StatCard';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';

export interface ReportMetricCard {
  id: string;
  title: string;
  value: string | number;
  footer?: string;
  tone?: StatCardTone;
}

export interface ReportSummaryCardsProps {
  metrics: ReportMetricCard[];
}

export function ReportSummaryCards({ metrics }: ReportSummaryCardsProps) {
  if (metrics.length === 0) {
    return null;
  }

  return (
    <DashboardGrid>
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          footer={metric.footer}
          tone={metric.tone}
        />
      ))}
    </DashboardGrid>
  );
}
