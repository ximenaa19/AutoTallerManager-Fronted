import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

export interface QuickActionCardProps {
  title: string;
  description: string;
  to: string;
  icon: LucideIcon;
  className?: string;
  badge?: ReactNode;
}

export function QuickActionCard({
  title,
  description,
  to,
  icon: Icon,
  className,
  badge,
}: QuickActionCardProps) {
  return (
    <Link to={to} className={cn('group block h-full', className)}>
      <Card
        interactive
        padding="md"
        className="flex h-full flex-col gap-4 transition-transform duration-150 group-hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-accent-muted text-accent">
            <Icon className="size-5" aria-hidden />
          </div>
          {badge}
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <p className="text-sm text-text-secondary">{description}</p>
        </div>

        <div className="mt-auto flex items-center gap-1 text-xs font-medium text-accent">
          Open module
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      </Card>
    </Link>
  );
}
