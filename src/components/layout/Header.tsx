import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
  Menu,
  Bell,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Plus,
  Search,
  Command,
  Zap,
} from 'lucide-react';
import { Button } from '../ui';

interface HeaderProps {
  onMenuClick: () => void;
  onNewIdea: () => void;
  pageTitle: string;
  pageSubtitle: string;
}

export default function Header({ onMenuClick, onNewIdea, pageTitle, pageSubtitle }: HeaderProps) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCommand, setShowCommand] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string | null; created_at: string; read: boolean }[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('notifications')
      .select('id, title, message, created_at, read')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommand(true);
      }
      if (e.key === 'Escape') setShowCommand(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const formatTimeAgo = (dateString: string): string => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const commands = [
    { label: 'Go to Dashboard', path: '/dashboard' },
    { label: 'Idea Workspace', path: '/dashboard/ideas' },
    { label: 'Project Grid', path: '/dashboard/projects' },
    { label: 'Analytics', path: '/dashboard/analytics' },
    { label: 'Workflow Tracker', path: '/dashboard/workflow' },
    { label: 'Settings', path: '/dashboard/settings' },
  ];

  const filteredCommands = commands.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      <header className="h-16 bg-surface-50/60 backdrop-blur-xl border-b border-surface-200/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-surface-400 hover:text-white hover:bg-surface-100/60 rounded-lg transition-all"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <h1 className="text-base font-semibold text-white truncate">{pageTitle}</h1>
            <p className="text-xs text-surface-400 truncate hidden sm:block">{pageSubtitle}</p>
          </div>
        </div>

        {/* Center - Command palette trigger */}
        <button
          onClick={() => setShowCommand(true)}
          className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface-100/40 border border-surface-200/30 rounded-xl text-surface-400 hover:text-surface-600 hover:border-surface-200/50 transition-all min-w-[200px] lg:min-w-[280px]"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm flex-1 text-left">Search or jump to...</span>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-surface-100/60 rounded text-[10px] font-mono text-surface-400">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Right section */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Submit Idea button */}
          <Button
            onClick={onNewIdea}
            leftIcon={Plus}
            size="sm"
            className="hidden sm:flex"
          >
            <span className="hidden lg:inline">Submit Idea</span>
            <span className="lg:hidden">New</span>
          </Button>

          {/* Mobile search */}
          <button
            onClick={() => setShowCommand(true)}
            className="md:hidden p-2.5 text-surface-400 hover:text-white hover:bg-surface-100/60 rounded-lg transition-all"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 text-surface-400 hover:text-white hover:bg-surface-100/60 rounded-lg transition-all"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full ring-2 ring-surface-50" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 glass-strong rounded-xl shadow-large overflow-hidden animate-scale-in">
                <div className="px-4 py-3 border-b border-surface-200/30 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-primary-500/20 text-primary-400 rounded-md">{unreadCount} new</span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-none">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className="px-4 py-3 hover:bg-surface-100/40 transition-colors cursor-pointer border-b border-surface-200/20 last:border-0"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.read ? 'bg-primary-500' : 'bg-surface-300'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">{n.title}</p>
                            {n.message && <p className="text-xs text-surface-400 mt-0.5 line-clamp-2">{n.message}</p>}
                            <p className="text-[11px] text-surface-500 mt-1">{formatTimeAgo(n.created_at)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-surface-400 text-sm">
                      No notifications yet
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-surface-200/30">
                  <button
                    onClick={() => { setShowNotifications(false); navigate('/dashboard/notifications'); }}
                    className="w-full text-center text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 pr-2 hover:bg-surface-100/60 rounded-xl transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center text-white text-sm font-semibold shadow-glow-blue">
                {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <ChevronDown className={`w-4 h-4 text-surface-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 glass-strong rounded-xl shadow-large overflow-hidden animate-scale-in">
                <div className="px-4 py-3.5 border-b border-surface-200/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center text-white font-semibold">
                      {profile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{profile?.full_name || 'User'}</p>
                      <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 bg-primary-500/15 text-primary-400 text-[10px] font-semibold rounded-md uppercase tracking-wider">
                    <Zap className="w-2.5 h-2.5" />
                    {profile?.role || 'employee'}
                  </span>
                </div>
                <div className="py-1.5">
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/dashboard/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-100/40 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button
                    onClick={() => { setShowUserMenu(false); navigate('/dashboard/settings'); }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-surface-400 hover:text-white hover:bg-surface-100/40 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-surface-200/30 py-1.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error-400 hover:bg-error-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Command palette */}
      {showCommand && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4">
          <div
            className="absolute inset-0 bg-surface-0/80 backdrop-blur-md animate-fade-in"
            onClick={() => setShowCommand(false)}
          />
          <div className="relative w-full max-w-xl glass-strong rounded-2xl shadow-large overflow-hidden animate-scale-in">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-surface-200/30">
              <Search className="w-5 h-5 text-surface-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or jump to a page..."
                className="flex-1 bg-transparent text-white placeholder-surface-400 focus:outline-none text-sm"
                autoFocus
              />
              <kbd className="px-1.5 py-0.5 bg-surface-100/60 rounded text-[10px] font-mono text-surface-400">ESC</kbd>
            </div>
            <div className="max-h-80 overflow-y-auto scrollbar-none py-2">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd) => (
                  <button
                    key={cmd.path}
                    onClick={() => { setShowCommand(false); navigate(cmd.path); setSearchQuery(''); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-400 hover:text-white hover:bg-surface-100/40 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg bg-surface-100/40 flex items-center justify-center">
                      <Search className="w-3.5 h-3.5" />
                    </div>
                    {cmd.label}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-surface-400 text-sm">
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
