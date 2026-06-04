import { useCallback, useMemo, useState } from 'react';
import { getErrorMessage } from '@/api/apiError';
import { receptionistPurchasesApi } from '@/features/receptionist/api/receptionistPurchases.api';
import type {
  RegisterPurchaseRequest,
  RegisterPurchaseResponseDto,
  RegisterPurchaseDetailRequest,
  PartSearchResultDto,
  SupplierSearchResultDto,
} from '@/features/receptionist/types/receptionistPurchases.types';

export interface PurchaseLine {
  id: string;
  partId: number;
  partCode: string;
  partDescription: string;
  quantity: number;
  unitPrice: number;
}

export interface UseReceptionistPurchaseFormResult {
  selectedSupplier: SupplierSearchResultDto | null;
  selectSupplier: (supplier: SupplierSearchResultDto | null) => void;
  purchaseDate: string;
  setPurchaseDate: (value: string) => void;
  draftPart: PartSearchResultDto | null;
  selectDraftPart: (part: PartSearchResultDto | null) => void;
  draftQuantity: string;
  setDraftQuantity: (value: string) => void;
  draftUnitPrice: string;
  setDraftUnitPrice: (value: string) => void;
  draftLineError: string | null;
  lines: PurchaseLine[];
  addDraftLine: () => void;
  removeLine: (lineId: string) => void;
  totalVisual: number;
  lineCount: number;
  canSubmit: boolean;
  isSubmitting: boolean;
  formError: string | null;
  successMessage: string | null;
  lastResponse: RegisterPurchaseResponseDto | null;
  clearMessages: () => void;
  submitPurchase: () => Promise<void>;
}

interface UseReceptionistPurchaseFormOptions {
  onSuccess?: (response: RegisterPurchaseResponseDto) => void;
}

function toIsoDate(value: string): string {
  return `${value}T00:00:00.000Z`;
}

function parsePurchaseDate(value: string): string | undefined {
  return value ? toIsoDate(value) : undefined;
}

function createLineId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `line-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useReceptionistPurchaseForm(
  options: UseReceptionistPurchaseFormOptions = {},
): UseReceptionistPurchaseFormResult {
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierSearchResultDto | null>(null);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [draftPart, setDraftPart] = useState<PartSearchResultDto | null>(null);
  const [draftQuantity, setDraftQuantity] = useState('1');
  const [draftUnitPrice, setDraftUnitPrice] = useState('');
  const [draftLineError, setDraftLineError] = useState<string | null>(null);
  const [lines, setLines] = useState<PurchaseLine[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<RegisterPurchaseResponseDto | null>(
    null,
  );

  const clearDraft = useCallback(() => {
    setDraftPart(null);
    setDraftQuantity('1');
    setDraftUnitPrice('');
    setDraftLineError(null);
  }, []);

  const selectSupplier = useCallback((supplier: SupplierSearchResultDto | null) => {
    setSelectedSupplier(supplier);
    setLines([]);
    clearDraft();
    setFormError(null);
    setSuccessMessage(null);
    setLastResponse(null);
  }, [clearDraft]);

  const selectDraftPart = useCallback((part: PartSearchResultDto | null) => {
    setDraftPart(part);
    setDraftLineError(null);

    if (part === null) {
      setDraftUnitPrice('');
      return;
    }

    setDraftQuantity('1');
    setDraftUnitPrice(String(part.unitPrice));
  }, []);

  const addDraftLine = useCallback(() => {
    if (!draftPart) {
      setDraftLineError('Select a part before adding it.');
      return;
    }

    if (!draftPart.isActive) {
      setDraftLineError('Selected part is inactive.');
      return;
    }

    const quantity = Number(draftQuantity);
    const unitPrice = Number(draftUnitPrice);
    if (!draftQuantity.trim()) {
      setDraftLineError('Quantity is required.');
      return;
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setDraftLineError('Quantity must be greater than 0.');
      return;
    }

    if (!draftUnitPrice.trim()) {
      setDraftLineError('Unit price is required.');
      return;
    }

    if (!Number.isFinite(unitPrice) || Number.isNaN(unitPrice) || unitPrice < 0) {
      setDraftLineError('Unit price cannot be negative.');
      return;
    }

    if (lines.some((line) => line.partId === draftPart.partId)) {
      setDraftLineError('This part is already included in the purchase.');
      return;
    }

    const detail: RegisterPurchaseDetailRequest = {
      partId: draftPart.partId,
      quantity,
      unitPrice,
    };

    setLines((current) => [
      ...current,
      {
        id: createLineId(),
        partId: detail.partId,
        partCode: draftPart.code,
        partDescription: draftPart.description,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
      },
    ]);
    clearDraft();
  }, [clearDraft, draftPart, draftQuantity, draftUnitPrice, lines]);

  const removeLine = useCallback((lineId: string) => {
    setLines((current) => current.filter((line) => line.id !== lineId));
    setFormError(null);
    setSuccessMessage(null);
    setLastResponse(null);
  }, []);

  const submitPurchase = useCallback(async () => {
    setFormError(null);
    setSuccessMessage(null);

    if (!selectedSupplier) {
      setFormError('Supplier is required.');
      return;
    }

    if (!selectedSupplier.isActive) {
      setFormError('Selected supplier is inactive.');
      return;
    }

    if (lines.length === 0) {
      setFormError('Add at least one purchase detail.');
      return;
    }

    const invalidLine = lines.find(
      (line) =>
        !line.partId ||
        !Number.isInteger(line.quantity) ||
        line.quantity <= 0 ||
        line.unitPrice < 0,
    );
    if (invalidLine) {
      setFormError(
        `Fix purchase lines. Invalid values for part ${invalidLine.partCode}.`,
      );
      return;
    }

    const payload: RegisterPurchaseRequest = {
      supplierId: selectedSupplier.supplierId,
      purchaseDate: parsePurchaseDate(purchaseDate),
      details: lines.map((line) => ({
        partId: line.partId,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
      })),
    };

    setIsSubmitting(true);
    try {
      const response = await receptionistPurchasesApi.registerPurchase(payload);
      const data = response.data;

      setLastResponse(data);
      setSuccessMessage(`Purchase #${data.partPurchaseId} was registered successfully.`);
      setLines([]);
      options.onSuccess?.(data);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSupplier, lines, purchaseDate, options]);

  const clearMessages = useCallback(() => {
    setFormError(null);
    setSuccessMessage(null);
    setLastResponse(null);
  }, []);

  const totalVisual = useMemo(
    () => lines.reduce((total, line) => total + line.quantity * line.unitPrice, 0),
    [lines],
  );

  return {
    selectedSupplier,
    selectSupplier,
    purchaseDate,
    setPurchaseDate,
    draftPart,
    selectDraftPart,
    draftQuantity,
    setDraftQuantity,
    draftUnitPrice,
    setDraftUnitPrice,
    draftLineError,
    lines,
    addDraftLine,
    removeLine,
    totalVisual,
    lineCount: lines.length,
    canSubmit:
      Boolean(selectedSupplier) &&
      selectedSupplier !== null &&
      selectedSupplier.isActive &&
      selectedSupplier.supplierId > 0 &&
      lines.length > 0 &&
      !isSubmitting,
    isSubmitting,
    formError,
    successMessage,
    lastResponse,
    clearMessages,
    submitPurchase,
  };
}
