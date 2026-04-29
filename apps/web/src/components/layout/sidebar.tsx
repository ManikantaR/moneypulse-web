'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CloudUpload,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Tag,
  Wallet,
  Lock,
  LockOpen,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/use-auth';
import { usePrivacy } from '@/lib/privacy/privacy-context';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/categories', label: 'Categories', icon: Tag },
  { href: '/budgets', label: 'Budgets', icon: Wallet },
  { href: '/sync-status', label: 'Cloud Sync', icon: CloudUpload },
  { href: '/settings', label: 'Settings', icon: Settings },
];

/** Desktop sidebar — hidden on mobile */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user, signOut } = useAuth();
  const { isLocked, hasPin, lock } = usePrivacy();

  return (
    <aside
      className={cn(
        'hidden md:flex h-screen flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex h-14 items-center gap-2.5 border-b border-border px-3',
          collapsed && 'justify-center px-0',
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <TrendingUp className="h-4 w-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-primary">MoneyPulse</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-0',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Lock toggle */}
      {hasPin && (
        <div className="px-2 pb-1">
          <button
            onClick={lock}
            disabled={isLocked}
            title={isLocked ? 'Locked' : 'Lock screen'}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors',
              isLocked
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              collapsed && 'justify-center px-0',
            )}
          >
            {isLocked ? <Lock className="h-4 w-4 shrink-0" /> : <LockOpen className="h-4 w-4 shrink-0" />}
            {!collapsed && <span>{isLocked ? 'Locked' : 'Lock'}</span>}
          </button>
        </div>
      )}

      {/* User */}
      {user && !collapsed && (
        <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold">{user.displayName ?? user.email}</p>
            {user.displayName && (
              <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
            )}
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="flex h-10 items-center justify-center border-t border-border text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}

/** Mobile bottom nav bar — visible only on mobile */
export function MobileNav() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isLocked, hasPin, lock } = usePrivacy();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 flex md:hidden border-t border-border bg-card">
      {navItems.slice(0, 4).map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/');
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
      {hasPin ? (
        <button
          onClick={lock}
          disabled={isLocked}
          className={cn(
            'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium',
            isLocked ? 'text-amber-500' : 'text-muted-foreground',
          )}
        >
          {isLocked ? <Lock className="h-5 w-5" /> : <LockOpen className="h-5 w-5" />}
          {isLocked ? 'Locked' : 'Lock'}
        </button>
      ) : (
        <button
          onClick={() => signOut()}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-muted-foreground"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      )}
    </nav>
  );
}
