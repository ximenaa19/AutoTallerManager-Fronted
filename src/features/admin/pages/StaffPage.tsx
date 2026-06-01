import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { staffApi } from '@/features/admin/api/staff.api';
import { AdminPageHeader } from '@/features/admin/components/AdminPageHeader';
import { StaffRegisterForm } from '@/features/admin/components/StaffRegisterForm';
import type { RegisterStaffRequest, StaffUserDto } from '@/features/admin/types/staff.types';
import { Badge } from '@/components/ui/Badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';

export function StaffPage() {
  const [successResult, setSuccessResult] = useState<StaffUserDto | null>(null);

  const handleRegister = async (payload: RegisterStaffRequest) => {
    const response = await staffApi.register(payload);
    setSuccessResult(response.data);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Staff Registration"
        description="Register administrative, reception, or mechanic staff with a person profile, credentials, and role assignment. Clients must self-register through the public registration flow."
      />

      <Card>
        <CardHeader>
          <CardTitle>How staff registration works</CardTitle>
          <CardDescription>
            This form creates the person profile, user account, and role assignment in
            one step. For mechanics, select at least one specialty so assignments can
            be routed correctly.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-text-secondary sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
            <p className="font-medium text-text-primary">1. Identity</p>
            <p className="mt-1">
              Capture document and name details using the public registration catalogs.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
            <p className="font-medium text-text-primary">2. Access</p>
            <p className="mt-1">
              Provide a work email and temporary password for the new staff member.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-bg-elevated/40 p-4">
            <p className="font-medium text-text-primary">3. Role</p>
            <p className="mt-1">
              Choose Admin, Receptionist, or Mechanic. Mechanics require specialties.
            </p>
          </div>
        </CardContent>
      </Card>

      {successResult && (
        <div
          role="status"
          className="rounded-lg border border-success/30 bg-success-muted/30 p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-success-muted text-success">
              <CheckCircle2 className="size-5" aria-hidden />
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-text-primary">
                  Staff member registered successfully
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Share the credentials securely with the new team member.
                </p>
              </div>
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text-secondary">
                    User ID
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">
                    {successResult.userId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text-secondary">
                    Person ID
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">
                    {successResult.personId}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text-secondary">
                    Email
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-text-primary">
                    {successResult.email}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text-secondary">
                    Role
                  </dt>
                  <dd className="mt-1">
                    <Badge variant="accent">{successResult.roleName}</Badge>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-text-secondary">
                    Status
                  </dt>
                  <dd className="mt-1">
                    <Badge variant={successResult.isActive ? 'active' : 'cancelled'} dot>
                      {successResult.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </dd>
                </div>
                {successResult.specialtyIds.length > 0 && (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-text-secondary">
                      Specialty IDs
                    </dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {successResult.specialtyIds.map((id) => (
                        <Badge key={id} variant="default">
                          #{id}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}

      <Card padding="lg">
        <CardHeader>
          <CardTitle>Register new staff member</CardTitle>
          <CardDescription>
            Supported roles: Admin, Receptionist, and Mechanic. There is no staff list
            endpoint — manage existing accounts from the Users page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffRegisterForm onSubmit={handleRegister} />
        </CardContent>
      </Card>
    </div>
  );
}
