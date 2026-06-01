import { useCallback, useMemo, useState } from 'react';
import {
  Eye,
  Pencil,
  Plus,
  Power,
  PowerOff,
  Trash2,
} from 'lucide-react';
import { getErrorMessage } from '@/api/apiError';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { personRolesApi } from '@/features/admin/api/personRoles.api';
import { rolesApi } from '@/features/admin/api/roles.api';
import { usersApi } from '@/features/admin/api/users.api';
import { AdminDataTable } from '@/features/admin/components/AdminDataTable';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { AdminToolbar } from '@/features/admin/components/AdminToolbar';
import { ConfirmActionModal } from '@/features/admin/components/ConfirmActionModal';
import { UserForm } from '@/features/admin/components/UserForm';
import {
  filterBySearchTerm,
  useClientPagination,
} from '@/features/admin/hooks/useClientPagination';
import type { PersonRoleDto } from '@/features/admin/types/personRoles.types';
import type { RoleDto } from '@/features/admin/types/roles.types';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  UserDto,
} from '@/features/admin/types/users.types';
import { useAsyncRequest } from '@/hooks/useAsyncRequest';
import { formatDateTime } from '@/utils/format';

type UserModalMode = 'create' | 'edit' | 'view' | null;

type PendingAction =
  | { type: 'delete'; user: UserDto }
  | { type: 'activate'; user: UserDto }
  | { type: 'deactivate'; user: UserDto };

function buildRoleLookup(roles: RoleDto[]): Map<number, string> {
  return new Map(roles.map((role) => [role.roleId, role.roleName]));
}

function getPersonRoleLabels(
  personId: number,
  personRoles: PersonRoleDto[],
  roleLookup: Map<number, string>,
): string[] {
  return personRoles
    .filter((assignment) => assignment.personId === personId && assignment.isActive)
    .map((assignment) => roleLookup.get(assignment.roleId) ?? `Role #${assignment.roleId}`);
}

export function UsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalMode, setModalMode] = useState<UserModalMode>(null);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadUsers = useCallback(() => usersApi.getAll(), []);

  const {
    data: users,
    isLoading: usersLoading,
    error: usersError,
    retry: retryUsers,
  } = useAsyncRequest(loadUsers, [refreshKey]);

  const { data: roles } = useAsyncRequest(() => rolesApi.getAll(), []);
  const { data: personRoles } = useAsyncRequest(() => personRolesApi.getAll(), []);

  const roleLookup = useMemo(
    () => buildRoleLookup(roles ?? []),
    [roles],
  );

  const linkedPersonIds = useMemo(
    () => new Set((users ?? []).map((user) => user.personId)),
    [users],
  );

  const filteredUsers = useMemo(
    () =>
      filterBySearchTerm(users ?? [], searchTerm, (user, term) => {
        const roleLabels = getPersonRoleLabels(
          user.personId,
          personRoles ?? [],
          roleLookup,
        ).join(' ');

        return [
          String(user.userId),
          String(user.personId),
          user.isActive ? 'active' : 'inactive',
          roleLabels,
        ]
          .join(' ')
          .toLowerCase()
          .includes(term);
      }),
    [users, searchTerm, personRoles, roleLookup],
  );

  const pagination = useClientPagination(filteredUsers);

  const refreshAll = () => {
    setRefreshKey((value) => value + 1);
  };

  const openCreateModal = () => {
    setSelectedUser(null);
    setModalMode('create');
  };

  const openEditModal = (user: UserDto) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  const openViewModal = (user: UserDto) => {
    setSelectedUser(user);
    setModalMode('view');
  };

  const closeModal = () => {
    setModalMode(null);
    setSelectedUser(null);
  };

  const handleCreateOrUpdate = async (
    payload: CreateUserRequest | UpdateUserRequest,
  ) => {
    if (modalMode === 'create') {
      await usersApi.create(payload as CreateUserRequest);
      setSuccessMessage('User account created successfully.');
    } else if (modalMode === 'edit' && selectedUser) {
      await usersApi.update(selectedUser.userId, payload as UpdateUserRequest);
      setSuccessMessage('User account updated successfully.');
    }

    closeModal();
    refreshAll();
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    setActionLoading(true);
    setActionError(null);
    try {
      if (pendingAction.type === 'delete') {
        await usersApi.delete(pendingAction.user.userId);
        setSuccessMessage('User account deleted.');
      } else if (pendingAction.type === 'activate') {
        await usersApi.activate(pendingAction.user.userId);
        setSuccessMessage('User account activated.');
      } else {
        await usersApi.deactivate(pendingAction.user.userId);
        setSuccessMessage('User account deactivated.');
      }

      setPendingAction(null);
      refreshAll();
    } catch (error) {
      setSuccessMessage(null);
      setActionError(getErrorMessage(error));
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: 'userId',
        header: 'User ID',
        cell: (user: UserDto) => (
          <span className="font-medium text-text-primary">#{user.userId}</span>
        ),
      },
      {
        id: 'personId',
        header: 'Person ID',
        cell: (user: UserDto) => user.personId,
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: (user: UserDto) => {
          const labels = getPersonRoleLabels(
            user.personId,
            personRoles ?? [],
            roleLookup,
          );

          if (labels.length === 0) {
            return <span className="text-text-muted">No active roles</span>;
          }

          return (
            <div className="flex flex-wrap gap-1.5">
              {labels.map((label) => (
                <Badge key={`${user.userId}-${label}`} variant="accent">
                  {label}
                </Badge>
              ))}
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: (user: UserDto) => (
          <Badge variant={user.isActive ? 'active' : 'cancelled'} dot>
            {user.isActive ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        header: 'Created',
        cell: (user: UserDto) => formatDateTime(user.createdAt),
      },
      {
        id: 'actions',
        header: 'Actions',
        className: 'text-right',
        cell: (user: UserDto) => (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              aria-label={`View user ${user.userId}`}
              onClick={() => openViewModal(user)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Edit user ${user.userId}`}
              onClick={() => openEditModal(user)}
            >
              <Pencil className="size-4" />
            </Button>
            {user.isActive ? (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Deactivate user ${user.userId}`}
                onClick={() => setPendingAction({ type: 'deactivate', user })}
              >
                <PowerOff className="size-4 text-warning" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Activate user ${user.userId}`}
                onClick={() => setPendingAction({ type: 'activate', user })}
              >
                <Power className="size-4 text-success" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              aria-label={`Delete user ${user.userId}`}
              onClick={() => setPendingAction({ type: 'delete', user })}
            >
              <Trash2 className="size-4 text-danger" />
            </Button>
          </div>
        ),
      },
    ],
    [personRoles, roleLookup],
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Users"
        description="Manage login accounts linked to person records. Activate or deactivate access, create accounts for existing persons, and review role assignments via person ID."
        actions={
          <Button leftIcon={<Plus className="size-4" />} onClick={openCreateModal}>
            Create user
          </Button>
        }
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

      <AdminToolbar
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search by user ID, person ID, status, or role…"
        summary={
          <p className="text-xs text-text-secondary">
            {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} found
          </p>
        }
      />

      <AdminDataTable
        columns={columns}
        data={pagination.items}
        rowKey={(user) => user.userId}
        isLoading={usersLoading}
        error={usersError}
        onRetry={retryUsers}
        emptyTitle="No users yet"
        emptyDescription="Create a user account for an existing person or register staff from the Staff page."
        emptyAction={
          <Button size="sm" onClick={openCreateModal}>
            Create first user
          </Button>
        }
        page={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.totalCount}
        onPageChange={pagination.setPage}
      />

      <Modal
        open={modalMode === 'create' || modalMode === 'edit'}
        onClose={closeModal}
        title={modalMode === 'create' ? 'Create user account' : 'Edit user account'}
        description="Link a login to an existing person record. Email and profile data come from the person module."
        size="md"
      >
        <UserForm
          mode={modalMode === 'create' ? 'create' : 'edit'}
          initialUser={selectedUser}
          linkedPersonIds={linkedPersonIds}
          onSubmit={handleCreateOrUpdate}
          onCancel={closeModal}
        />
      </Modal>

      <Modal
        open={modalMode === 'view' && selectedUser !== null}
        onClose={closeModal}
        title={`User #${selectedUser?.userId ?? ''}`}
        description="Account details returned by the users API."
        size="md"
        footer={
          selectedUser && (
            <Button variant="secondary" onClick={() => openEditModal(selectedUser)}>
              Edit user
            </Button>
          )
        }
      >
        {selectedUser && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-secondary">
                User ID
              </dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {selectedUser.userId}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-secondary">
                Person ID
              </dt>
              <dd className="mt-1 text-sm font-medium text-text-primary">
                {selectedUser.personId}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-secondary">
                Status
              </dt>
              <dd className="mt-1">
                <Badge variant={selectedUser.isActive ? 'active' : 'cancelled'} dot>
                  {selectedUser.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-text-secondary">
                Created
              </dt>
              <dd className="mt-1 text-sm text-text-primary">
                {formatDateTime(selectedUser.createdAt)}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-text-secondary">
                Active roles
              </dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {getPersonRoleLabels(
                  selectedUser.personId,
                  personRoles ?? [],
                  roleLookup,
                ).map((label) => (
                  <Badge key={label} variant="accent">
                    {label}
                  </Badge>
                ))}
                {getPersonRoleLabels(
                  selectedUser.personId,
                  personRoles ?? [],
                  roleLookup,
                ).length === 0 && (
                  <span className="text-sm text-text-muted">No active role assignments</span>
                )}
              </dd>
            </div>
          </dl>
        )}
      </Modal>

      <ConfirmActionModal
        open={pendingAction?.type === 'delete'}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void handleConfirmAction()}
        title="Delete user account"
        description={`Delete user #${pendingAction?.user.userId ?? ''}? The linked person record will remain in the system.`}
        confirmLabel="Delete user"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        open={pendingAction?.type === 'activate'}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void handleConfirmAction()}
        title="Activate user account"
        description={`Allow user #${pendingAction?.user.userId ?? ''} to sign in again.`}
        confirmLabel="Activate"
        variant="primary"
        isLoading={actionLoading}
      />

      <ConfirmActionModal
        open={pendingAction?.type === 'deactivate'}
        onClose={() => setPendingAction(null)}
        onConfirm={() => void handleConfirmAction()}
        title="Deactivate user account"
        description={`Prevent user #${pendingAction?.user.userId ?? ''} from signing in.`}
        confirmLabel="Deactivate"
        isLoading={actionLoading}
      />
    </div>
  );
}
