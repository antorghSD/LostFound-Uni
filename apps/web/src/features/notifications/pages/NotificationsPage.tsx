import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Bell, Loader2, CheckCheck } from 'lucide-react';
import { api, type Notification } from '@/lib/api';
import { connectSocket } from '@/lib/socket';

export default function NotificationsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data.data as Notification[];
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/notifications/${id}/read`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch('/notifications/read-all');
    },
    onSuccess: () => {
      toast.success('All marked as read');
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  useEffect(() => {
    const socket = connectSocket();
    socket.on('notification', (notif: Notification) => {
      toast.info(notif.title, { description: notif.body });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => {
      socket.off('notification');
    };
  }, [qc]);

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t('nav.notifications')}</h1>
          {notifications && notifications.some((n) => !n.isRead) && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-uiu-orange" />
          </div>
        ) : !notifications || notifications.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <Bell className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border bg-card p-4 transition ${
                  !n.isRead ? 'border-l-4 border-l-uiu-orange' : ''
                }`}
                onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-uiu-orange/10 text-uiu-orange">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                    {n.link && (
                      <Link
                        to={n.link}
                        className="mt-2 inline-block text-xs font-medium text-uiu-orange hover:underline"
                      >
                        View →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}