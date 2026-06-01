import { useEffect, useMemo, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

export interface UseClientPaginationResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}

export function useClientPagination<T>(
  data: T[],
  pageSize = DEFAULT_PAGE_SIZE,
): UseClientPaginationResult<T> {
  const [page, setPage] = useState(1);
  const [size, setPageSize] = useState(pageSize);

  const totalCount = data.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / size));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    setPage(1);
  }, [data.length, size]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const items = useMemo(() => {
    const start = (safePage - 1) * size;
    return data.slice(start, start + size);
  }, [data, safePage, size]);

  return {
    items,
    page: safePage,
    pageSize: size,
    totalPages,
    totalCount,
    setPage,
    setPageSize,
  };
}

export function filterBySearchTerm<T>(
  items: T[],
  searchTerm: string,
  matcher: (item: T, normalizedTerm: string) => boolean,
): T[] {
  const term = searchTerm.trim().toLowerCase();
  if (!term) {
    return items;
  }
  return items.filter((item) => matcher(item, term));
}
