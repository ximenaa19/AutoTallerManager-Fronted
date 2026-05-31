import type { ReactNode } from 'react';
import { Construction } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface RolePlaceholderPageProps {
  roleLabel: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function RolePlaceholderPage({
  roleLabel,
  title,
  description,
  children,
}: RolePlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Badge variant="accent">{roleLabel}</Badge>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-2xl text-sm text-text-secondary">{description}</p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-warning-muted text-warning">
            <Construction className="size-5" aria-hidden />
          </div>
          <CardTitle>Dashboard coming in Phase 3</CardTitle>
          <CardDescription>
            This is a safe placeholder landing page. The real {roleLabel.toLowerCase()}{' '}
            dashboard, navigation, and operational modules will be implemented in
            Phase 3.
          </CardDescription>
        </CardHeader>
        {children}
      </Card>
    </div>
  );
}
