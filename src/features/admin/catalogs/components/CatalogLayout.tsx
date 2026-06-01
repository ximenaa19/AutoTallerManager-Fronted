import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/routes/routePaths';
import { cn } from '@/lib/cn';

export interface CatalogLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function CatalogLayout({ children, className }: CatalogLayoutProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div>
        <Link
          to={ROUTES.ADMIN_CATALOGS}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-elevated hover:text-text-primary focus-ring"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Back to catalogs
        </Link>
      </div>
      {children}
    </div>
  );
}
