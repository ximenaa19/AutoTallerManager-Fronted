import type { PartSearchResultDto } from '@/features/admin/inventory/types/parts.types';
import { formatCurrency, formatNumber } from '@/utils/format';

/** Fields shared by PartDto and PartSearchResultDto for display. */
export type PartDisplaySource = Pick<
  PartSearchResultDto,
  'partId' | 'code' | 'description' | 'stock' | 'unitPrice'
>;

export interface PartDisplayLines {
  /** Primary label — backend has no separate `name`; description is the catalog label. */
  primary: string;
  /** Secondary metadata (code, stock, price). */
  secondary: string;
  /** Single-line label for compact lists. */
  compact: string;
}

/**
 * Builds human-friendly part labels from confirmed API fields only.
 * `PartDto` / `PartSearchResultDto` expose `code` and `description`, not `partName`.
 */
export function getPartDisplayLines(part: PartDisplaySource): PartDisplayLines {
  const code = part.code?.trim() ?? '';
  const description = part.description?.trim() ?? '';

  const primary =
    description || code || `Part #${formatNumber(part.partId)}`;

  const meta: string[] = [];
  if (code && code !== primary) {
    meta.push(`Code: ${code}`);
  } else if (!code) {
    meta.push(`ID: ${formatNumber(part.partId)}`);
  }
  meta.push(`Stock: ${formatNumber(part.stock)}`);
  meta.push(`Unit price: ${formatCurrency(part.unitPrice)}`);

  const secondary = meta.join(' · ');
  const compact = `${primary} · ${secondary}`;

  return { primary, secondary, compact };
}

export function partMatchesSearchTerm(
  part: PartDisplaySource,
  rawTerm: string,
): boolean {
  const term = rawTerm.trim().toLowerCase();
  if (!term) return true;

  const { primary, secondary } = getPartDisplayLines(part);
  const haystack = [
    String(part.partId),
    part.code,
    part.description,
    primary,
    secondary,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(term);
}
