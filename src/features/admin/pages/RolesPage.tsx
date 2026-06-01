import { useCallback, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { personRolesApi } from '@/features/admin/api/personRoles.api';
import { rolesApi } from '@/features/admin/api/roles.api';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { PersonRoleForm } from '@/features/admin/components/PersonRoleForm';
import { RoleForm } from '@/features/admin/components/RoleForm';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import type {
  CreatePersonRoleRequest,
  PersonRoleDto,
  UpdatePersonRoleRequest,
} from '@/features/admin/types/personRoles.types';
import type {
  CreateRoleRequest,
  RoleDto,
  UpdateRoleRequest,
} from '@/features/admin/types/roles.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';

type RoleModalMode = 'create' | 'edit' | null;
type AssignmentModalMode = 'create' | 'edit' | null;

type PendingDelete =
  | { type: 'role'; item: RoleDto }
  | { type: 'assignment'; item: PersonRoleDto };

function buildRoleLookup(roles: RoleDto[]): Map<number, string> {
  return new Map(roles.map((role) => [role.roleId, role.roleName]));
}

export function RolesPage() {
  const [roleSearch, setRoleSearch] = useState('');
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [roleModalMode, setRoleModalMode] = useState<RoleModalMode>(null);
  const [assignmentModalMode, setAssignmentModalMode] =
    useState<AssignmentModalMode>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDto | null>(null);
  const [selectedAssignment, setSelectedAssignment] =
    useState<PersonRoleDto | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadRoles = useCallback(() => rolesApi.getAll(), []);
  const loadAssignments = useCallback(() => personRolesApi.getAll(), []);

  const {
    data: roles,
    isLoading: rolesLoading,
    error: rolesError,
    retry: retryRoles,
  } = useAsyncRequest(loadRoles, [refreshKey]);

  const {
    data: assignments,
    isLoading: assignmentsLoading,
    error: assignmentsError,
    retry: retryAssignments,
  } = useAsyncRequest(loadAssignments, [refreshKey]);

  const roleLookup = useMemo(() => buildRoleLookup(roles ?? []), [roles]);

  const filteredRoles = useMemo(
    () =>
      filterBySearchTerm(roles ?? [], roleSearch, (role, term) =>
        [String(role.roleId), role.roleName].join(' ').toLowerCase().includes(term),
      ),
    [roles, roleSearch],
  );

  const filteredAssignments = useMemo(
    () =>
      filterBySearchTerm(assignments ?? [], assignmentSearch, (assignment, term) => {
        const roleName =
          roleLookup.get(assignment.roleId) ?? String(assignment.roleId);
        return [
          String(assignment.personRoleId),
          String(assignment.personId),
          roleName,
          assignment.isActive ? 'active' : 'inactive',
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);
      }),
    [assignments, assignmentSearch, roleLookup],
  );

  const rolePagination = useClientPagination(filteredRoles);
  const assignmentPagination = useClientPagination(filteredAssignments);

  const refreshAll = () => setRefreshKey((value) => value + 1);

  const handleRoleSubmit = async (
    payload: CreateRoleRequest | UpdateRoleRequest,
  ) => {
    if (roleModalMode === 'create') {
      await rolesApi.create(payload as CreateRoleRequest);
      setSuccessMessage('Role created successfully.');
    } else if (roleModalMode === 'edit' && selectedRole) {
      await rolesApi.update(selectedRole.roleId, payload as UpdateRoleRequest);
      setSuccessMessage('Role updated successfully.');
    }

    setRoleModalMode(null);
    setSelectedRole(null);
    refreshAll();
  };

  const handleAssignmentSubmit = async (
    payload: CreatePersonRoleRequest | UpdatePersonRoleRequest,
  ) => {
    if (assignmentModalMode === 'create') {
      await personRolesApi.create(payload as CreatePersonRoleRequest);
      setSuccessMessage('Role assignment created successfully.');
    } else if (assignmentModalMode === 'edit' && selectedAssignment) {
      await personRolesApi.update(
        selectedAssignment.personRoleId,
        payload as UpdatePersonRoleRequest,
      );
      setSuccessMessage('Role assignment updated successfully.');
    }

    setAssignmentModalMode(null);
    setSelectedAssignment(null);
    refreshAll();
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;

    setActionLoading(true);
    setActionError(null);
    try {
      if (pendingDelete.type === 'role') {
        await rolesApi.delete(pendingDelete.item.roleId);
        setSuccessMessage('Role deleted successfully.');
      } else {
        await personRolesApi.delete(pendingDelete.item.personRoleId);
        setSuccessMessage('Role assignment deleted successfully.');
      }

      setPendingDelete(null);
      refreshAll();
    } catch (error) {
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const roleColumns = useMemo(
    () => [
      {
        id: 'roleId',
        header: 'Role ID',
        cell: (role: RoleDto) => (
          <span className="font-medium text-text-primary">#{role.roleId}</span>
        ),
      },
      {
        id: 'roleName',
        header: 'Role name',
        cell: (role: RoleDto) => role.roleName,
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (role: RoleDto) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit role ${role.roleName}`}
              onClick={() => {
                setSelectedRole(role);
                setRoleModalMode('edit');
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete role ${role.roleName}`}
              onClick={() => setPendingDelete({ type: 'role', item: role })}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const assignmentColumns = useMemo(
    () => [
      {
        id: 'personRoleId',
        header: 'Assignment ID',
        cell: (assignment: PersonRoleDto) => (
          <span className="font-medium text-text-primary">
            #{assignment.personRoleId}
          </span>
        ),
      },
      {
        id: 'personId',
        header: 'Person ID',
        cell: (assignment: PersonRoleDto) => assignment.personId,
      },
      {
        id: 'role',
        header: 'Role',
        cell: (assignment: PersonRoleDto) => (
          <Badge variant="accent">
            {roleLookup.get(assignment.roleId) ?? `Role #${assignment.roleId}`}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: (assignment: PersonRoleDto) => (
          <Badge variant={assignment.isActive ? 'active' : 'cancelled'} dot>
            {assignment.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (assignment: PersonRoleDto) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit assignment ${assignment.personRoleId}`}
              onClick={() => {
                setSelectedAssignment(assignment);
                setAssignmentModalMode('edit');
              }}
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete assignment ${assignment.personRoleId}`}
              onClick={() =>
                setPendingDelete({ type: 'assignment', item: assignment })
              }
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ),
      },
    ],
    [roleLookup],
  );

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Roles & Permissions"
        description="Maintain the role catalog and assign roles to persons. Permission enforcement is handled by JWT role claims — this module manages role definitions and person-role assignments only."
      />

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/40 px-4 py-3 text-sm text-success"
        >
          {successMessage}
        </div>
      )}

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger-muted/40 px-4 py-3 text-sm text-danger"
        >
          {actionError}
        </div>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">Role catalog</h2>
            <p className="text-sm text-text-secondary">
              Seeded roles include Admin, Client, Mechanic, and Receptionist.
            </p>
          </div>
          <Button
            leftIcon={<Plus className="size-4" />}
            onClick={() => {
              setSelectedRole(null);
              setRoleModalMode('create');
            }}
          >
            Create role
          </Button>
        </div>

        <AdminToolbar
          searchValue={roleSearch}
          onSearchChange={setRoleSearch}
          searchPlaceholder="Search roles by ID or name…"
          summary={
            <p className="text-xs text-text-secondary">
              {filteredRoles.length} role{filteredRoles.length === 1 ? '' : 's'}
            </p>
          }
        />

        <AdminDataTable
          columns={roleColumns}
          data={rolePagination.items}
          rowKey={(role) => role.roleId}
          isLoading={rolesLoading}
          error={rolesError}
          onRetry={retryRoles}
          emptyTitle="No roles found"
          emptyDescription="Create a role or verify the roles API is available."
          page={rolePagination.page}
          totalPages={rolePagination.totalPages}
          totalCount={rolePagination.totalCount}
          onPageChange={rolePagination.setPage}
        />
      </section>

      <section className="space-y-4 border-t border-border pt-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              Person role assignments
            </h2>
            <p className="text-sm text-text-secondary">
              Link persons to roles. Inactive assignments do not grant access.
            </p>
          </div>
          <Button
            variant="secondary"
            leftIcon={<Plus className="size-4" />}
            onClick={() => {
              setSelectedAssignment(null);
              setAssignmentModalMode('create');
            }}
          >
            Assign role
          </Button>
        </div>

        <AdminToolbar
          searchValue={assignmentSearch}
          onSearchChange={setAssignmentSearch}
          searchPlaceholder="Search by assignment ID, person ID, role, or status…"
          summary={
            <p className="text-xs text-text-secondary">
              {filteredAssignments.length} assignment
              {filteredAssignments.length === 1 ? '' : 's'}
            </p>
          }
        />

        <AdminDataTable
          columns={assignmentColumns}
          data={assignmentPagination.items}
          rowKey={(assignment) => assignment.personRoleId}
          isLoading={assignmentsLoading}
          error={assignmentsError}
          onRetry={retryAssignments}
          emptyTitle="No role assignments"
          emptyDescription="Assign a role to a person to grant portal access."
          page={assignmentPagination.page}
          totalPages={assignmentPagination.totalPages}
          totalCount={assignmentPagination.totalCount}
          onPageChange={assignmentPagination.setPage}
        />
      </section>

      <Modal
        open={roleModalMode !== null}
        onClose={() => {
          setRoleModalMode(null);
          setSelectedRole(null);
        }}
        title={roleModalMode === 'create' ? 'Create role' : 'Edit role'}
        description="Role names are used in JWT claims and staff registration."
        size="sm"
      >
        <RoleForm
          mode={roleModalMode === 'create' ? 'create' : 'edit'}
          initialRole={selectedRole}
          onSubmit={handleRoleSubmit}
          onCancel={() => {
            setRoleModalMode(null);
            setSelectedRole(null);
          }}
        />
      </Modal>

      <Modal
        open={assignmentModalMode !== null}
        onClose={() => {
          setAssignmentModalMode(null);
          setSelectedAssignment(null);
        }}
        title={
          assignmentModalMode === 'create'
            ? 'Assign role to person'
            : 'Edit role assignment'
        }
        description="Person ID must reference an existing person record."
        size="md"
      >
        <PersonRoleForm
          mode={assignmentModalMode === 'create' ? 'create' : 'edit'}
          roles={roles ?? []}
          initialAssignment={selectedAssignment}
          onSubmit={handleAssignmentSubmit}
          onCancel={() => {
            setAssignmentModalMode(null);
            setSelectedAssignment(null);
          }}
        />
      </Modal>

      <ConfirmActionModal
        open={pendingDelete?.type === 'role'}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Delete role"
        description={`Delete role "${pendingDelete?.type === 'role' ? pendingDelete.item.roleName : ''}"? Existing assignments may block deletion.`}
        confirmLabel="Delete role"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        open={pendingDelete?.type === 'assignment'}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void handleConfirmDelete()}
        title="Delete role assignment"
        description={`Remove assignment #${pendingDelete?.type === 'assignment' ? pendingDelete.item.personRoleId : ''}?`}
        confirmLabel="Delete assignment"
        isLoading={actionLoading}
      />
    </div>
  );
}
