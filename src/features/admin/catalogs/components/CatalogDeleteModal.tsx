import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import type { CatalogDefinition } from '@/features/admin/catalogs/config/catalogDefinitions';
import {
  getCatalogRecordId,
  getCatalogRecordLabel,
} from '@/features/admin/catalogs/config/catalogDefinitions';
import type { CatalogRecord } from '@/features/admin/catalogs/types/catalogs.types';

export interface CatalogDeleteModalProps {
  open: boolean;
  definition: CatalogDefinition;
  record: CatalogRecord | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CatalogDeleteModal({
  open,
  definition,
  record,
  onClose,
  onConfirm,
  isLoading = false,
}: CatalogDeleteModalProps) {
  const label = record ? getCatalogRecordLabel(record, definition) : '';
  const id = record ? getCatalogRecordId(record, definition) : '';

  return (
    <ConfirmActionModal
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete record"
      description={`Delete "${label}" (ID #${id})? Related records may block deletion.`}
      confirmLabel="Delete record"
      isLoading={isLoading}
    />
  );
}
