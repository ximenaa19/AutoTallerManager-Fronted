export const PLATE_MIN_LENGTH = 5;
export const PLATE_MAX_LENGTH = 10;
export const PLATE_PATTERN = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/;

export function normalizePlate(value: string): string {
  return value.trim().toUpperCase();
}

export function validatePlate(value: string): string | undefined {
  const plate = normalizePlate(value);

  if (!plate) {
    return 'Plate is required.';
  }

  if (plate.length < PLATE_MIN_LENGTH || plate.length > PLATE_MAX_LENGTH) {
    return 'Plate must be between 5 and 10 characters.';
  }

  if (!PLATE_PATTERN.test(plate)) {
    return 'Plate may only contain letters, numbers, and hyphens.';
  }

  return undefined;
}

export function isTemporaryPlate(plate: string): boolean {
  return normalizePlate(plate).startsWith('TMP');
}

export interface VehicleIdentityParts {
  plate?: string;
  vin?: string;
  vehicleId?: number;
}

/** Primary display label for vehicle identity in lists and selectors. */
export function formatVehicleIdentityLabel(parts: VehicleIdentityParts): string {
  const plate = parts.plate?.trim();
  const vin = parts.vin?.trim();

  if (plate && vin) {
    return `${plate} · VIN ${vin}`;
  }

  if (plate) {
    return plate;
  }

  if (vin) {
    return `VIN ${vin}`;
  }

  if (parts.vehicleId !== undefined) {
    return `Vehicle #${parts.vehicleId}`;
  }

  return 'Unknown vehicle';
}
