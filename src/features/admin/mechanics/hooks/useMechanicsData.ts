import { useCallback, useMemo } from 'react';
import { personRolesApi } from '@/features/admin/api/personRoles.api';
import { rolesApi } from '@/features/admin/api/roles.api';
import { usersApi } from '@/features/admin/api/users.api';
import { personsAdminApi } from '@/features/admin/customers/api/persons.api';
import { mechanicSpecialtiesApi } from '@/features/admin/mechanics/api/mechanicSpecialties.api';
import { mechanicsApi } from '@/features/admin/mechanics/api/mechanics.api';
import type { MechanicRosterItem } from '@/features/admin/mechanics/types/mechanics.types';
import type { OrderServiceDto } from '@/features/admin/serviceOrders/types/orderServices.types';
import {
  formatPersonFullName,
  type PersonDto,
} from '@/features/admin/types/persons.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

const MECHANIC_ROLE_NAME = 'Mechanic';

function buildSpecialtyNameMap(
  specialties: { specialtyId: number; name: string }[],
): Map<number, string> {
  return new Map(specialties.map((item) => [item.specialtyId, item.name]));
}

function buildMechanicRoster(
  mechanicRoleId: number | null,
  personRoles: { personId: number; roleId: number; isActive: boolean }[],
  persons: PersonDto[],
  users: { userId: number; personId: number; isActive: boolean }[],
  specialtyAssignments: { personId: number; specialtyId: number }[],
  mechanicAssignments: {
    mechanicAssignmentId: number;
    orderServiceId: number;
    mechanicPersonId: number;
    specialtyId: number;
  }[],
  specialtyNameById: Map<number, string>,
): MechanicRosterItem[] {
  if (!mechanicRoleId) return [];

  const mechanicPersonRoles = personRoles.filter(
    (assignment) => assignment.roleId === mechanicRoleId,
  );
  const personIds = [...new Set(mechanicPersonRoles.map((item) => item.personId))];

  const roleActiveByPersonId = new Map(
    mechanicPersonRoles.map((item) => [item.personId, item.isActive]),
  );
  const userByPersonId = new Map(users.map((user) => [user.personId, user]));

  const specialtyIdsByPersonId = specialtyAssignments.reduce<Map<number, number[]>>(
    (map, assignment) => {
      const current = map.get(assignment.personId) ?? [];
      if (!current.includes(assignment.specialtyId)) {
        map.set(assignment.personId, [...current, assignment.specialtyId]);
      }
      return map;
    },
    new Map(),
  );

  const assignmentsByPersonId = mechanicAssignments.reduce<
    Map<number, typeof mechanicAssignments>
  >((map, assignment) => {
    const current = map.get(assignment.mechanicPersonId) ?? [];
    map.set(assignment.mechanicPersonId, [...current, assignment]);
    return map;
  }, new Map());

  return personIds
    .map((personId) => {
      const person = persons.find((item) => item.personId === personId);
      if (!person) return null;

      const specialtyIds = (specialtyIdsByPersonId.get(personId) ?? []).sort(
        (a, b) => a - b,
      );
      const specialtyNames = specialtyIds.map(
        (id) => specialtyNameById.get(id) ?? `Specialty #${id}`,
      );
      const user = userByPersonId.get(personId);
      const assignments = assignmentsByPersonId.get(personId) ?? [];

      return {
        personId,
        fullName: formatPersonFullName(person),
        documentNumber: person.documentNumber,
        specialtyIds,
        specialtyNames,
        roleAssignmentActive: roleActiveByPersonId.get(personId) ?? false,
        accountStatus: user
          ? user.isActive
            ? ('active' as const)
            : ('inactive' as const)
          : ('none' as const),
        userId: user?.userId ?? null,
        assignmentCount: assignments.length,
        assignments,
      };
    })
    .filter((item): item is MechanicRosterItem => item !== null)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function useMechanicsData(refreshKey = 0) {
  const load = useCallback(async () => {
    const [
      personRolesResponse,
      rolesResponse,
      personsResponse,
      usersResponse,
      specialtiesResponse,
      specialtyAssignmentsResponse,
      mechanicAssignmentsResponse,
      orderServicesResponse,
    ] = await Promise.all([
      personRolesApi.getAll(),
      rolesApi.getAll(),
      personsAdminApi.getAll(),
      usersApi.getAll(),
      mechanicSpecialtiesApi.getAll(),
      mechanicsApi.getMechanicSpecialtyAssignments(),
      mechanicsApi.getMechanicAssignments(),
      mechanicsApi.getOrderServices(),
    ]);

    const roles = rolesResponse.data;
    const mechanicRoleId =
      roles.find((role) => role.roleName === MECHANIC_ROLE_NAME)?.roleId ?? null;
    const specialtyNameById = buildSpecialtyNameMap(specialtiesResponse.data);

    const roster = buildMechanicRoster(
      mechanicRoleId,
      personRolesResponse.data,
      personsResponse.data,
      usersResponse.data,
      specialtyAssignmentsResponse.data,
      mechanicAssignmentsResponse.data,
      specialtyNameById,
    );

    return {
      data: {
        roster,
        specialtyCatalog: specialtiesResponse.data,
        specialtyNameById,
        orderServices: orderServicesResponse.data,
      },
    };
  }, []);

  const { data, isLoading, error, retry } = useAsyncRequest(load, [refreshKey]);

  const orderServiceById = useMemo(() => {
    const map = new Map<number, OrderServiceDto>();
    for (const orderService of data?.orderServices ?? []) {
      map.set(orderService.orderServiceId, orderService);
    }
    return map;
  }, [data?.orderServices]);

  return {
    roster: data?.roster ?? [],
    specialtyCatalog: data?.specialtyCatalog ?? [],
    specialtyNameById: data?.specialtyNameById ?? new Map<number, string>(),
    orderServiceById,
    isLoading,
    error,
    retry,
  };
}
