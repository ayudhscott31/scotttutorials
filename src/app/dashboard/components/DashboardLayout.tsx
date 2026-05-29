import { NavLink, Outlet, useNavigate } from 'react-router';
import { BookOpen, FolderTree, LayoutDashboard, Layers, LogOut, Smartphone } from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { Button } from '@/app/components/ui/button';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/platforms', label: 'Platforms', icon: Layers },
  { to: '/dashboard/sections', label: 'Sections', icon: FolderTree },
  { to: '/dashboard/tutorials', label: 'Tutorials', icon: BookOpen },
  { to: '/dashboard/mobile-preview', label: 'Mobile app', icon: Smartphone },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/dashboard/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-foreground">
      <aside className="flex w-64 shrink-0 flex-col border-r border-white/10 bg-black">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-medium uppercase tracking-wider text-nav-inactive">
            Tutorial Hub
          </p>
          <h1 className="mt-1 text-lg font-bold text-white">Admin Dashboard</h1>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-nav-active text-nav-active-foreground'
                    : 'text-nav-inactive hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <p className="truncate text-xs text-nav-inactive">{user?.email}</p>
          <Button
            type="button"
            variant="ghost"
            className="mt-2 w-full justify-start gap-2 text-nav-inactive hover:bg-white/5 hover:text-white"
            onClick={handleSignOut}
          >
            <LogOut className="size-4" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-8">
          <p className="text-sm text-muted-foreground">Content manager — live Supabase data</p>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            Open mobile app ↗
          </a>
        </header>
        <main className="flex-1 overflow-y-auto bg-background p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
