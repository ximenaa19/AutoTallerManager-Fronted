import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';
import { EmptyState } from '@/components/feedback/EmptyState';

export interface MechanicEmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function MechanicEmptyState({
  title,
  description,
  action,
}: MechanicEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={<Inbox className="size-6" aria-hidden />}
      action={action}
    />
  );
}
