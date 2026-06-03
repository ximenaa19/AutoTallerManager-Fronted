import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { MechanicEmptyState } from '@/features/mechanic/components/MechanicEmptyState';
import { MechanicPartResultCard } from '@/features/mechanic/components/MechanicPartResultCard';
import { MechanicPartSearchBox } from '@/features/mechanic/components/MechanicPartSearchBox';
import { useMechanicPartSearch } from '@/features/mechanic/hooks/useMechanicPartSearch';
import { mechanicRequestPartsPath, ROUTES } from '@/routes/routePaths';

export function MechanicSearchPartsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderServiceIdParam = searchParams.get('orderServiceId');
  const orderServiceId = orderServiceIdParam ? Number(orderServiceIdParam) : NaN;
  const hasOrderContext =
    Number.isFinite(orderServiceId) && orderServiceId > 0;

  const {
    term,
    setTerm,
    results,
    isSearching,
    searchError,
    minTermLength,
    canSearch,
  } = useMechanicPartSearch();

  const activeResults = useMemo(
    () => results.filter((part) => part.isActive),
    [results],
  );

  const handleSelectForRequest = () => {
    if (!hasOrderContext) return;
    navigate(mechanicRequestPartsPath(orderServiceId));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Search spare parts"
        description="Read-only catalog lookup. You cannot edit inventory, stock, or purchases from this page."
      />

      {hasOrderContext && (
        <p className="rounded-lg border border-border bg-bg-surface px-4 py-3 text-sm text-text-secondary">
          Browsing parts for order service #{orderServiceId}. Select a part below to
          open the request form for that service.
        </p>
      )}

      <MechanicPartSearchBox
        term={term}
        onTermChange={setTerm}
        isSearching={isSearching}
        searchError={searchError}
        minTermLength={minTermLength}
      />

      {!canSearch && term.trim().length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Package className="size-8 text-text-muted" aria-hidden />
          <MechanicEmptyState
            title="Search the parts catalog"
            description="Enter at least two characters of a part code or description. Results show stock and unit price only — no inventory management actions."
          />
        </div>
      )}

      {canSearch && !isSearching && results.length === 0 && (
        <MechanicEmptyState
          title="No parts found"
          description="Try a different code or description."
        />
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-text-secondary">
            {results.length} result{results.length === 1 ? '' : 's'}
            {activeResults.length < results.length &&
              ` (${results.length - activeResults.length} inactive)`}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((part) => (
              <MechanicPartResultCard
                key={part.partId}
                part={part}
                onSelect={
                  hasOrderContext ? handleSelectForRequest : undefined
                }
                selectLabel="Open request form"
              />
            ))}
          </div>
        </div>
      )}

      {!hasOrderContext && (
        <p className="text-sm text-text-secondary">
          To request a part, open{' '}
          <Link
            to={ROUTES.MECHANIC_ASSIGNED_SERVICES}
            className="font-medium text-accent hover:underline"
          >
            Assigned Services
          </Link>{' '}
          and start a request from a service card or detail page.
        </p>
      )}
    </div>
  );
}
