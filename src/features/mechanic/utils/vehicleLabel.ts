/** Vehicle identity label for mechanic assignment cards. */
export function formatMechanicVehicleLabel(
  vehicleId: number,
  plate?: string | null,
): string {
  const normalizedPlate = plate?.trim();

  if (normalizedPlate) {
    return `${normalizedPlate} · Vehicle #${vehicleId}`;
  }

  return `Vehicle #${vehicleId}`;
}
