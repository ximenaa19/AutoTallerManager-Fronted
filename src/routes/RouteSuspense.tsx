import { Suspense, type ReactNode } from 'react';
import { LoadingState } from '@/components/feedback/LoadingState';

export interface RouteSuspenseProps {
  children: ReactNode;
}

export function RouteSuspense({ children }: RouteSuspenseProps) {
  return (
    <Suspense
      fallback={
        <LoadingState
          fullPage
          title="Loading page"
          description="Please wait while the content loads."
        />
      }
    >
      {children}
    </Suspense>
  );
}
