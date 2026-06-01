import { useEffect, useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  serviceOrderLookupsApi,
  type PartSearchResultDto,
} from '@/features/admin/serviceOrders/api/serviceOrderLookups.api';
import type { RequestPartRequest } from '@/features/admin/serviceOrders/types/orderServices.types';
import { formatCurrency } from '@/utils/format';

export interface RequestPartModalProps {
  open: boolean;
  orderServiceId: number;
  onClose: () => void;
  onSubmit: (payload: RequestPartRequest) => Promise<void>;
}

export function RequestPartModal({
  open,
  orderServiceId,
  onClose,
  onSubmit,
}: RequestPartModalProps) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<PartSearchResultDto[]>([]);
  const [selectedPart, setSelectedPart] = useState<PartSearchResultDto | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [appliedUnitPrice, setAppliedUnitPrice] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setTerm('');
    setResults([]);
    setSelectedPart(null);
    setQuantity('1');
    setAppliedUnitPrice('');
    setFieldError(null);
    setApiError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    const normalized = term.trim();
    if (normalized.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsSearching(true);
      serviceOrderLookupsApi
        .searchParts(normalized)
        .then((response) => setResults(response.data))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [term]);

  const handleSelectPart = (part: PartSearchResultDto) => {
    setSelectedPart(part);
    setAppliedUnitPrice(String(part.unitPrice));
    setResults([]);
    setTerm(`${part.code} — ${part.description}`);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!selectedPart) {
      setFieldError('Select a part from search results');
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedPrice = Number(appliedUnitPrice);

    if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
      setFieldError('Quantity must be greater than zero');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFieldError('Applied unit price must be zero or greater');
      return;
    }

    setFieldError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        partId: selectedPart.partId,
        quantity: parsedQuantity,
        appliedUnitPrice: parsedPrice,
      });
      handleClose();
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Request part"
      description={`Add a part request to service line #${orderServiceId}.`}
      size="md"
    >
      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        {apiError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
          >
            {apiError}
          </div>
        )}

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-[2.125rem] size-4 text-text-muted"
            aria-hidden
          />
          <Input
            name="partSearch"
            label="Search part"
            placeholder="Search by code or description (min. 2 chars)…"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              if (selectedPart) setSelectedPart(null);
            }}
            className="pl-9"
            error={fieldError ?? undefined}
          />
        </div>

        {isSearching && <p className="text-xs text-text-secondary">Searching parts…</p>}

        {results.length > 0 && (
          <ul className="max-h-40 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
            {results.map((part) => (
              <li key={part.partId} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-bg-muted"
                  onClick={() => handleSelectPart(part)}
                >
                  <span className="text-sm font-medium text-text-primary">
                    {part.code} — {part.description}
                  </span>
                  <span className="text-xs text-text-secondary">
                    Stock {part.stock} · {formatCurrency(part.unitPrice)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            name="quantity"
            label="Quantity"
            type="number"
            min={1}
            step={1}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <Input
            name="appliedUnitPrice"
            label="Applied unit price"
            type="number"
            min={0}
            step="0.01"
            required
            value={appliedUnitPrice}
            onChange={(event) => setAppliedUnitPrice(event.target.value)}
          />
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Request part
          </Button>
        </div>
      </form>
    </Modal>
  );
}
