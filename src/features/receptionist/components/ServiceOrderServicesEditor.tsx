import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CatalogItemDto } from '@/types/catalogs.types';

export interface ServiceOrderServiceLineInput {
  key: string;
  serviceTypeId: number;
  description: string;
  laborCost: number;
}

export interface ServiceOrderServicesEditorProps {
  services: ServiceOrderServiceLineInput[];
  serviceTypeOptions: CatalogItemDto[];
  onAddLine: () => void;
  onUpdateLine: (key: string, patch: Partial<ServiceOrderServiceLineInput>) => void;
  onRemoveLine: (key: string) => void;
  disabled?: boolean;
}

export function ServiceOrderServicesEditor({
  services,
  serviceTypeOptions,
  onAddLine,
  onUpdateLine,
  onRemoveLine,
  disabled,
}: ServiceOrderServicesEditorProps) {
  const mappedOptions = serviceTypeOptions.map((item) => ({
    value: String(item.id),
    label: item.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-primary">Initial services</h3>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          leftIcon={<Plus className="size-4" />}
          onClick={onAddLine}
          disabled={disabled}
        >
          Add service
        </Button>
      </div>

      <div className="space-y-4">
        {services.map((service, index) => (
          <div
            key={service.key}
            className="grid gap-3 rounded-lg border border-border bg-bg-muted/20 p-4 sm:grid-cols-2"
          >
            <Select
              name={`serviceType-${service.key}`}
              label={`Service type ${index + 1}`}
              required
              value={service.serviceTypeId ? String(service.serviceTypeId) : ''}
              onChange={(event) =>
                onUpdateLine(service.key, { serviceTypeId: Number(event.target.value) })
              }
              options={mappedOptions}
              placeholder="Select a service type"
              disabled={disabled}
            />
            <Input
              name={`laborCost-${service.key}`}
              label="Labor cost"
              type="number"
              min={0}
              step="0.01"
              required
              value={service.laborCost}
              onChange={(event) =>
                onUpdateLine(service.key, {
                  laborCost: Number(event.target.value),
                })
              }
              disabled={disabled}
            />
            <div className="sm:col-span-2">
              <Input
                name={`description-${service.key}`}
                label="Description (optional)"
                value={service.description}
                onChange={(event) =>
                  onUpdateLine(service.key, { description: event.target.value })
                }
                disabled={disabled}
              />
            </div>
            {services.length > 1 ? (
              <div className="sm:col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 className="size-4 text-danger" />}
                  onClick={() => onRemoveLine(service.key)}
                  disabled={disabled}
                >
                  Remove service
                </Button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
