import { RolePlaceholderPage } from '@/pages/placeholders/RolePlaceholderPage';

export function ChangePasswordPlaceholderPage() {
  return (
    <RolePlaceholderPage
      roleLabel="Account"
      title="Change Password"
      description="Password change will be connected to POST /api/account/change-password in a future phase."
    />
  );
}
