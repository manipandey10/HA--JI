import { useEffect, useState, useMemo } from 'react';
import { supabase, Notification } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Bell,
  Mail,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  Check,
  CheckCheck,
  MailOpen,
} from 'lucide-react';
import { Card, Button, EmptyState, StaggerItem, useToast } from '../../components/ui';

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  email: { icon: Mail, color: 'text-primary-400', bg: 'bg-primary-500/10', border: 'border-primary-500/30' },
  alert: { icon: AlertCircle, color: 'text-warning-400', bg: 'bg-warning-500/10', border: 'border-warning-500/30' },
  success: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10', border: 'border-success-500/30' },
  info: { icon: Info, color: 'text-secondary-400', bg: 'bg-secondary-500/10', border: 'border-secondary-500/30' },
  default: { icon: Bell, color: 'text-surface-400', bg: 'bg-surface-300/10', border: 'border-surface-300/30' },
};

function formatTimeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setNotifications(data);
    setLoading(false);
  };

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const filteredNotifications = useMemo(() => {
    return filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  }, [notifications, filter]);

  const handleMarkAsRead = async (id: string) => {
    const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast('success', 'All marked as read', `${unreadCount} notifications updated`);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('notifications').delete().eq('id', id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast('success', 'Notification deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Notifications</h2>
          <p className="text-sm text-surface-400 mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up! No unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead} leftIcon={CheckCheck}>
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === 'all' ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white hover:bg-surface-100/40'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
            filter === 'unread' ? 'bg-primary-500/15 text-primary-400 border border-primary-500/30' : 'text-surface-400 hover:text-white hover:bg-surface-100/40'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <Card padding="none">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-48 rounded" />
                  <div className="shimmer h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-surface-200/10">
            {filteredNotifications.map((notification, index) => {
              const config = typeConfig[notification.type] || typeConfig.default;
              return (
                <StaggerItem key={notification.id} index={index}>
                  <div className={`px-6 py-4 hover:bg-surface-100/30 transition-colors group ${!notification.read ? 'bg-primary-500/5' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 ${config.bg} ${config.border} border rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <config.icon className={`w-5 h-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        {notification.message && (
                          <p className="text-sm text-surface-400 mt-1">{notification.message}</p>
                        )}
                        <p className="text-xs text-surface-500 mt-2">{formatTimeAgo(notification.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="p-2 text-surface-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-all"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          className="p-2 text-surface-400 hover:text-error-400 hover:bg-error-500/10 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={filter === 'unread' ? MailOpen : Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            description={filter === 'unread' ? 'You have read all your notifications' : 'Notifications will appear here when you receive them'}
          />
        )}
      </Card>
    </div>
  );
}
