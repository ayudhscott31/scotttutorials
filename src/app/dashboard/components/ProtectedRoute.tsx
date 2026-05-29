import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { Loader2 } from 'lucide-react';
import { ensureAdminAccess } from '@/lib/content-api';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, isConfigured } = useAuth();
  const location = useLocation();
  const [adminReady, setAdminReady] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  useEffect(() => {
    if (!session || !isConfigured) {
      setAdminReady(true);
      return;
    }
    ensureAdminAccess()
      .then(() => {
        setAdminError(null);
        setAdminReady(true);
      })
      .catch((e) => {
        setAdminError(e instanceof Error ? e.message : 'Admin setup failed');
        setAdminReady(true);
      });
  }, [session, isConfigured]);

  if (loading || (session && !adminReady)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/dashboard/login" replace state={{ from: location.pathname }} />;
  }

  if (adminError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          <p className="font-semibold">Admin access required</p>
          <p className="mt-2">{adminError}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
