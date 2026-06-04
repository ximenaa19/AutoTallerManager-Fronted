import { useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getPartDisplayLines } from '@/features/admin/inventory/utils/partDisplay';
import { MechanicPartSearchBox } from '@/features/mechanic/components/MechanicPartSearchBox';
import { useMechanicPartSearch } from '@/features/mechanic/hooks/useMechanicPartSearch';
import type { PartSearchResultDto } from '@/features/mechanic/types/mechanicParts.types';
import type { RequestPartRequest } from '@/features/mechanic/types/mechanicPartRequests.types';
import { formatCurrency } from '@/utils/format';

export interface MechanicPartRequestFormProps {
  orderServiceId: number;
  onSubmit: (payload: RequestPartRequest) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function MechanicPartRequestForm({
  orderServiceId,
  onSubmit,
  onCancel,
  submitLabel = 'Submit part request',
}: MechanicPartRequestFormProps) {
  const {
    term,
    setTerm,
    results,
    isSearching,
    searchError,
    minTermLength,
    canSearch,
  } = useMechanicPartSearch();

  const [selectedPart, setSelectedPart] = useState<PartSearchResultDto | null>(null);
  const [quantity, setQuantity] = useState('1');
  const [appliedUnitPrice, setAppliedUnitPrice] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectPart = (part: PartSearchResultDto) => {
    setSelectedPart(part);
    setAppliedUnitPrice(String(part.unitPrice));
    setTerm(`${part.code} — ${part.description}`);
    setFieldError(null);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setApiError(null);

    if (!selectedPart) {
      setFieldError('Select a part from search results');
      return;
    }

    if (!selectedPart.isActive) {
      setFieldError('Selected part is inactive and cannot be requested');
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
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
      <p className="text-sm text-text-secondary">
        Requesting for order service #{orderServiceId}. Customer approval is handled
        separately after submission.
      </p>

      {apiError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {apiError}
        </div>
      )}

      <MechanicPartSearchBox
        term={term}
        onTermChange={(value) => {
          setTerm(value);
          if (selectedPart) setSelectedPart(null);
        }}
        isSearching={isSearching}
        searchError={searchError}
        minTermLength={minTermLength}
      />

      {fieldError && (
        <p role="alert" className="text-sm text-danger">
          {fieldError}
        </p>
      )}

      {canSearch && results.length > 0 && !selectedPart && (
        <ul className="max-h-48 overflow-y-auto rounded-lg border border-border bg-bg-elevated">
          {results.map((part) => {
            const { primary } = getPartDisplayLines(part);
            return (
              <li key={part.partId} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  disabled={!part.isActive}
                  className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition hover:bg-bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => handleSelectPart(part)}
                >
                  <span className="text-sm font-medium text-text-primary">{primary}</span>
                  <span className="text-xs text-text-secondary">
                    Stock {part.stock} · {formatCurrency(part.unitPrice)}
                    {!part.isActive ? ' · Inactive' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {canSearch && !isSearching && results.length === 0 && term.trim().length >= minTermLength && (
        <p className="text-sm text-text-secondary">No parts matched your search.</p>
      )}

      {selectedPart && (
        <div className="rounded-lg border border-border bg-bg-elevated px-4 py-3 text-sm">
          <p className="font-medium text-text-primary">
            Selected: {getPartDisplayLines(selectedPart).primary}
          </p>
          <p className="mt-1 text-text-secondary">
            Code {selectedPart.code} · Stock {selectedPart.stock}
          </p>
        </div>
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
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
