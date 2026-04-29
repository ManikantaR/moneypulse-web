'use client';

import { Bell, Check, CheckCheck } from 'lucide-react';
import { doc, updateDoc, writeBatch } from 'firebase/firestore';
import { firebaseDb } from '@/lib/firebase';
import { useAuth } from '@/lib/auth/use-auth';
import { useNotifications } from '@/lib/fcm/use-notifications';
import type { NotificationDoc } from '@/lib/types/firestore';

function timeAgo(ts: unknown): string {
  if (!ts || typeof (ts as any).toDate !== 'function') return '';
  const ms = Date.now() - (ts as any).toDate().getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotificationRow({
  n,
  onMarkRead,
}: {
  n: NotificationDoc;
  onMarkRead: (id: string) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-0 ${
        n.isRead ? 'opacity-60' : 'bg-accent/30'
      }`}
    >
      <Bell className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{n.title}</p>
        {n.body && <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>}
        <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.createdAt)}</p>
      </div>
      {!n.isRead && (
        <button
          onClick={() => onMarkRead(n.id)}
          title="Mark as read"
          className="shrink-0 p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { notifications, unreadCount, isLoading } = useNotifications(50);

  async function markRead(notifId: string) {
    if (!user) return;
    const db = firebaseDb();
    await updateDoc(doc(db, 'users', user.uid, 'notifications', notifId), {
      isRead: true,
    });
  }

  async function markAllRead() {
    if (!user || unreadCount === 0) return;
    const db = firebaseDb();
    const batch = writeBatch(db);
    notifications
      .filter((n) => !n.isRead)
      .forEach((n) => {
        batch.update(doc(db, 'users', user.uid, 'notifications', n.id), { isRead: true });
      });
    await batch.commit();
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-muted-foreground mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Bell className="h-8 w-8 opacity-30" />
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-center max-w-xs">
              Budget alerts and spending notifications will appear here once the local MoneyPulse
              app starts sending them.
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationRow key={n.id} n={n} onMarkRead={markRead} />
          ))
        )}
      </div>
    </div>
  );
}
