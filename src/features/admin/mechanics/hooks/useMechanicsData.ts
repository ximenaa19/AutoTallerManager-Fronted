import { useCallback } from 'react';
import { mechanicSpecialtiesApi } from '@/features/admin/api/mechanicSpecialties.api';
import { mechanicsApi } from '@/features/admin/mechanics/api/mechanics.api';
import type { AdminMechanicListItemDto } from '@/features/admin/mechanics/types/adminMechanics.types';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

function mapAccountStatus(
  userId: number | null | undefined,
  isUserActive: boolean | null | undefined,
): MechanicRosterItem['accountStatus'] {
  if (userId == null) return 'none';
  return isUserActive ? 'active' : 'inactive';
}

function mapListItemToRoster(item: AdminMechanicListItemDto): MechanicRosterItem {
  return {
    personId: item.personId,
    fullName: item.fullName,
    documentNumber: item.documentNumber,
    specialtyIds: item.specialties.map((specialty) => specialty.specialtyId),
    specialtyNames: item.specialties.map((specialty) => specialty.specialtyName),
    roleAssignmentActive: item.roleActive,
    userId: item.userId ?? null,
    email: item.email ?? null,
    accountStatus: mapAccountStatus(item.userId, item.isUserActive),
    assignedServicesCount: item.assignedServicesCount,
    activeOrdersCount: item.activeOrdersCount,
  };
}

export function useMechanicsData(refreshKey = 0) {
  const load = useCallback(async () => {
    const [mechanicsResponse, specialtiesResponse] = await Promise.all([
      mechanicsApi.getAll(),
      mechanicSpecialtiesApi.getAll(),
    ]);

    const roster = mechanicsResponse.data
      .map(mapListItemToRoster)
      .sort((a, b) => a.fullName.localeCompare(b.fullName));

    return {
      data: {
        roster,
        specialtyCatalog: specialtiesResponse.data,
      },
    };
  }, []);

  const { data, isLoading, error, retry } = useAsyncRequest(load, [refreshKey]);

  return {
    roster: data?.roster ?? [],
    specialtyCatalog: data?.specialtyCatalog ?? [],
    isLoading,
    error,
    retry,
  };
}
