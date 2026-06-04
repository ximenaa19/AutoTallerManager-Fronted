import { Textarea } from '@/components/ui/Textarea';
import { Input } from '@/components/ui/Input';

export interface ServiceOrderIntakeInventorySectionProps {
  hasScratches: boolean;
  scratchesDescription: string;
  hasToolbox: boolean;
  toolboxDescription: string;
  ownershipCardDelivered: boolean;
  inventoryObservations: string;
  onHasScratchesChange: (value: boolean) => void;
  onScratchesDescriptionChange: (value: string) => void;
  onHasToolboxChange: (value: boolean) => void;
  onToolboxDescriptionChange: (value: string) => void;
  onOwnershipCardDeliveredChange: (value: boolean) => void;
  onInventoryObservationsChange: (value: string) => void;
  disabled?: boolean;
}

export function ServiceOrderIntakeInventorySection({
  hasScratches,
  scratchesDescription,
  hasToolbox,
  toolboxDescription,
  ownershipCardDelivered,
  inventoryObservations,
  onHasScratchesChange,
  onScratchesDescriptionChange,
  onHasToolboxChange,
  onToolboxDescriptionChange,
  onOwnershipCardDeliveredChange,
  onInventoryObservationsChange,
  disabled,
}: ServiceOrderIntakeInventorySectionProps) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-bg-muted/20 p-4">
      <h3 className="text-sm font-semibold text-text-primary">Vehicle intake</h3>

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-accent"
          checked={hasScratches}
          onChange={(event) => onHasScratchesChange(event.target.checked)}
          disabled={disabled}
        />
        Vehicle has scratches
      </label>
      {hasScratches ? (
        <Input
          name="scratchesDescription"
          label="Scratches description"
          value={scratchesDescription}
          onChange={(event) => onScratchesDescriptionChange(event.target.value)}
          required
          disabled={disabled}
        />
      ) : null}

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-accent"
          checked={hasToolbox}
          onChange={(event) => onHasToolboxChange(event.target.checked)}
          disabled={disabled}
        />
        Vehicle has toolbox
      </label>
      {hasToolbox ? (
        <Input
          name="toolboxDescription"
          label="Toolbox description"
          value={toolboxDescription}
          onChange={(event) => onToolboxDescriptionChange(event.target.value)}
          required
          disabled={disabled}
        />
      ) : null}

      <label className="flex items-center gap-2 text-sm text-text-primary">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-accent"
          checked={ownershipCardDelivered}
          onChange={(event) => onOwnershipCardDeliveredChange(event.target.checked)}
          disabled={disabled}
        />
        Ownership card delivered
      </label>

      <Textarea
        name="inventoryObservations"
        label="Inventory observations"
        value={inventoryObservations}
        onChange={(event) => onInventoryObservationsChange(event.target.value)}
        rows={2}
        disabled={disabled}
      />
    </div>
  );
}
