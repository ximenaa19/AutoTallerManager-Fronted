import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { getErrorMessage } from '@/api/apiError';
import { AuthErrorBanner } from '@/features/auth/components/AuthErrorBanner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getSelectedRole } from '@/lib/authToken';
import { resolvePostLoginRoute } from '@/routes/roleRedirects';
import { ROUTES } from '@/routes/routePaths';
import { isValidEmail, validateRequired } from '@/utils/validation';

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFieldErrors {
  email?: string;
  password?: string;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginFormState>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fromPath =
    (location.state as { from?: string } | null)?.from ?? undefined;

  const validate = (): boolean => {
    const errors: LoginFieldErrors = {};

    const emailError = validateRequired(form.email, 'Email');
    if (emailError) {
      errors.email = emailError;
    } else if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address';
    }

    const passwordError = validateRequired(form.password, 'Password');
    if (passwordError) errors.password = passwordError;

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await login({
        email: form.email.trim(),
        password: form.password,
      });

      const destination =
        fromPath && fromPath !== ROUTES.LOGIN
          ? fromPath
          : resolvePostLoginRoute(response.user.roles, getSelectedRole());

      navigate(destination, { replace: true });
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Sign in to your workshop"
      subtitle="Access your role-based portal to manage clients, service orders, inventory, and billing."
    >
      <Card>
        <CardHeader>
          <CardTitle>Welcome back</CardTitle>
        </CardHeader>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <CardContent className="space-y-4">
            <AuthErrorBanner message={apiError} />
            <Input
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
              error={fieldErrors.email}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              error={fieldErrors.password}
              required
            />
          </CardContent>
          <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
            <p className="text-sm text-text-secondary">
              New client?{' '}
              <Link
                to={ROUTES.REGISTER_CLIENT}
                className="font-medium text-accent hover:text-accent-hover"
              >
                Create an account
              </Link>
            </p>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </AuthLayout>
  );
}
