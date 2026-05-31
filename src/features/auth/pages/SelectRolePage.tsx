import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getRoleLabel, isAppRole } from '@/lib/roles';
import { getHomeRouteForRole } from '@/routes/roleRedirects';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { AppRole } from '@/types/auth.types';

export function SelectRolePage() {
  const { user, selectRole } = useAuth();
  const navigate = useNavigate();

  const roles = (user?.roles.filter(isAppRole) ?? []) as AppRole[];

  const handleSelect = (role: AppRole) => {
    selectRole(role);
    navigate(getHomeRouteForRole(role), { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Select your role</CardTitle>
          <CardDescription>
            Your account has multiple roles. Choose how you want to continue this
            session.
          </CardDescription>
        </CardHeader>
        <div className="grid gap-2">
          {roles.map((role) => (
            <Button
              key={role}
              variant="secondary"
              className="h-auto justify-start px-4 py-3 text-left"
              onClick={() => handleSelect(role)}
            >
              <span className="flex flex-col items-start gap-0.5">
                <span className="font-semibold text-text-primary">
                  {getRoleLabel(role)}
                </span>
                <span className="text-xs font-normal text-text-secondary">
                  Continue as {role}
                </span>
              </span>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
