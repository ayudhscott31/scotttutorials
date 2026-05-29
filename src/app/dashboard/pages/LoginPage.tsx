import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Loader2, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';

export function LoginPage() {
  const { session, loading, isConfigured, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard';

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setSubmitting(true);

    const result =
      mode === 'signin'
        ? await signIn(email.trim(), password)
        : await signUp(email.trim(), password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (mode === 'signup') {
      setMessage('Account created. Check your email to confirm, then sign in.');
      setMode('signin');
      return;
    }

    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-nav-active">
            Tutorial Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-nav-inactive">
            Sign in to manage platforms, profiles, and tutorials
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-card p-8 shadow-2xl">
          {!isConfigured && (
            <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Add <code className="text-nav-active">VITE_SUPABASE_URL</code> and{' '}
              <code className="text-nav-active">VITE_SUPABASE_ANON_KEY</code> to{' '}
              <code className="text-nav-active">.env.local</code> (see .env.example).
            </div>
          )}

          <div className="mb-6 flex rounded-lg bg-muted p-1">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-nav-active text-nav-active-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMode('signin')}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-nav-active text-nav-active-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMode('signup')}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-lg bg-nav-accent-muted px-3 py-2 text-sm text-foreground">
                {message}
              </p>
            )}

            <Button
              type="submit"
              disabled={submitting || !isConfigured}
              className="w-full bg-nav-active text-nav-active-foreground hover:brightness-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Please wait…
                </>
              ) : mode === 'signin' ? (
                'Sign in'
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/" className="text-foreground hover:underline">
              ← Back to mobile app
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
