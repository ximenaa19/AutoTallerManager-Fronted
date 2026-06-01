import { Link, useParams } from 'react-router-dom';
import {
  CATALOG_GROUPS,
  getAllCatalogDefinitions,
  getCatalogDefinitionsByGroup,
} from '@/features/admin/catalogs/config/catalogDefinitions';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { adminCatalogDetailPath } from '@/routes/routePaths';
import { cn } from '@/lib/cn';
import { ChevronRight, Database } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/Badge';

export function CatalogList() {
  const [search, setSearch] = useState('');

  const filteredGroups = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return CATALOG_GROUPS.map((group) => {
      const catalogs = getCatalogDefinitionsByGroup(group.id).filter((catalog) => {
        if (!normalizedSearch) return true;
        return [
          catalog.title,
          catalog.description,
          catalog.key,
          group.title,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch);
      });

      return { group, catalogs };
    }).filter(({ catalogs }) => catalogs.length > 0);
  }, [search]);

  const totalCatalogs = getAllCatalogDefinitions().length;
  const visibleCount = filteredGroups.reduce(
    (count, entry) => count + entry.catalogs.length,
    0,
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Catalogs"
        description="Manage base reference data used across the workshop system — identity, vehicles, services, inventory, billing, geography, and audit lookups. Changes here affect registration forms, service orders, and reporting."
      />

      <AdminToolbar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search catalogs by name, group, or key…"
        summary={
          <p className="text-xs text-text-secondary">
            Showing {visibleCount} of {totalCatalogs} catalogs
          </p>
        }
      />

      <div className="space-y-8">
        {filteredGroups.length === 0 ? (
          <Card padding="lg" className="text-center">
            <p className="text-sm font-medium text-text-primary">No catalogs match your search</p>
            <p className="mt-1 text-sm text-text-secondary">
              Try a different term or clear the search filter.
            </p>
          </Card>
        ) : (
          filteredGroups.map(({ group, catalogs }) => (
            <section key={group.id} className="space-y-4">
              <div className="flex flex-col gap-1 border-b border-border pb-3">
                <h2 className="text-lg font-semibold text-text-primary">{group.title}</h2>
                <p className="text-sm text-text-secondary">{group.description}</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {catalogs.map((catalog) => (
                  <Link
                    key={catalog.key}
                    to={adminCatalogDetailPath(catalog.key)}
                    className="group block focus-ring rounded-lg"
                  >
                    <Card
                      interactive
                      padding="md"
                      className="h-full transition-all group-hover:border-accent/40"
                    >
                      <CardHeader className="mb-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-muted text-accent">
                            <Database className="size-5" />
                          </div>
                          <ChevronRight className="size-4 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                        </div>
                        <CardTitle className="mt-3">{catalog.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {catalog.description}
                        </CardDescription>
                      </CardHeader>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="default">{catalog.key}</Badge>
                        {catalog.operations.create ||
                        catalog.operations.update ||
                        catalog.operations.delete ? (
                          <Badge variant="active" dot>
                            Editable
                          </Badge>
                        ) : (
                          <Badge variant="cancelled">Read-only</Badge>
                        )}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

export function CatalogSelectorNav({ className }: { className?: string }) {
  const { catalogKey } = useParams<{ catalogKey: string }>();

  return (
    <nav
      aria-label="Catalog navigation"
      className={cn(
        'flex flex-wrap gap-2 rounded-lg border border-border bg-bg-surface p-3',
        className,
      )}
    >
      {getAllCatalogDefinitions().map((catalog) => {
        const isActive = catalog.key === catalogKey;
        return (
          <Link
            key={catalog.key}
            to={adminCatalogDetailPath(catalog.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-ring',
              isActive
                ? 'bg-accent text-white'
                : 'bg-bg-elevated text-text-secondary hover:text-text-primary',
            )}
          >
            {catalog.title}
          </Link>
        );
      })}
    </nav>
  );
}
