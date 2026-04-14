'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, CheckCircle2, Flame, Goal, LayoutDashboard, LogOut, TimerReset } from 'lucide-react';
import clsx from 'clsx';
import Button from '@/components/shared/Button';
import BrandMark from '@/components/shared/BrandMark';
import { useAuth } from '@/lib/store/auth-store';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/goals', label: 'Goals', icon: Goal },
];

function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logoutUser, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, router, user]);

  async function handleLogout() {
    await logoutUser();
    router.push('/login');
  }

  return (
    <div className="min-h-screen text-slate-100">
      <div className="dashboard-container relative">
        <div className="absolute inset-x-4 top-4 -z-10 h-64 rounded-[40px] bg-cyan-400/10 blur-3xl" />
        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="sidebar glass-panel flex min-w-0 flex-col justify-between rounded-[32px] p-6 shadow-soft">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <BrandMark size={48} />
              </div>

              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200',
                        active
                          ? 'bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/25'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="rounded-[28px] border border-white/10 bg-slate-950/45 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">Today</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <div className="flex items-center gap-2"><TimerReset className="h-4 w-4 text-cyan-300" /> Stopwatch sessions</div>
                  <div className="flex items-center gap-2"><Flame className="h-4 w-4 text-amber-300" /> Consistency grid</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Daily completion</div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-[28px] border border-white/10 bg-gradient-to-br from-white/8 to-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Signed in as</p>
                <p className="mt-2 text-lg font-semibold text-slate-100">{loading ? 'Loading...' : user?.name || 'Guest'}</p>
                <p className="text-sm text-slate-400">{user?.email || 'Waiting for authentication'}</p>
              </div>
              <Button variant="secondary" onClick={handleLogout} className="w-full justify-center">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </aside>

          <main className="min-w-0 space-y-6 pb-6">
            <div className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-[32px] px-6 py-5 shadow-soft">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Productivity command center</p>
                <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white">
                  Move one focused day at a time.
                </h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-emerald-200">
                  Signed in
                </span>
              </div>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppShell;