export type MechanicWorkReportStatus = 'needs-report' | 'reported';

export function getWorkReportStatus(workPerformed?: string): MechanicWorkReportStatus {
  return workPerformed?.trim() ? 'reported' : 'needs-report';
}
