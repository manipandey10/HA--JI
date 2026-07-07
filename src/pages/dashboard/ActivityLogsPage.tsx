import { useEffect, useState, useMemo } from 'react';
import { supabase, ActivityLog } from '../../lib/supabase';
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  GitBranch,
  Award,
  Download,
  Search,
  Filter,
  Clock,
} from 'lucide-react';
import { Card, Button, EmptyState, StaggerItem, useToast } from '../../components/ui';

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  create: { icon: Plus, color: 'text-success-400', bg: 'bg-success-500/10' },
  update: { icon: Edit2, color: 'text-primary-400', bg: 'bg-primary-500/10' },
  delete: { icon: Trash2, color: 'text-error-400', bg: 'bg-error-500/10' },
  approve: { icon: CheckCircle2, color: 'text-success-400', bg: 'bg-success-500/10' },
  submit: { icon: GitBranch, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
  score: { icon: Award, color: 'text-warning-400', bg: 'bg-warning-500/10' },
  default: { icon: Activity, color: 'text-surface-400', bg: 'bg-surface-300/10' },
};

const filterOptions = [
  { value: 'all', label: 'All Actions' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'approve', label: 'Approved' },
  { value: 'submit', label: 'Submitted' },
];

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

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter);
      return matchesSearch && matchesAction;
    });
  }, [logs, searchTerm, actionFilter]);

  const handleExport = () => {
    const csv = [
      ['Timestamp', 'Action', 'Entity Type', 'Entity ID', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.created_at,
        log.action,
        log.entity_type || '',
        log.entity_id || '',
        log.details ? JSON.stringify(log.details) : '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast('success', 'Export complete', `${filteredLogs.length} logs exported to CSV`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Activity Logs</h2>
          <p className="text-sm text-surface-400 mt-1">Track all actions across the platform</p>
        </div>
        <Button variant="outline" onClick={handleExport} leftIcon={Download}>
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activity logs..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white placeholder-surface-400 focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none"
            >
              {filterOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-surface-50">{opt.label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card padding="none">
        <div className="px-6 py-4 border-b border-surface-200/20 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
          <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/15 text-primary-400 rounded-md">{filteredLogs.length} events</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="shimmer w-10 h-10 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="shimmer h-4 w-48 rounded" />
                  <div className="shimmer h-3 w-32 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[2.75rem] top-0 bottom-0 w-px bg-surface-200/20" />

            <div className="divide-y divide-surface-200/10">
              {filteredLogs.map((log, index) => {
                const config = actionConfig[log.action.toLowerCase()] || actionConfig.default;
                return (
                  <StaggerItem key={log.id} index={index}>
                    <div className="px-6 py-4 hover:bg-surface-100/30 transition-colors relative">
                      <div className="flex items-start gap-4">
                        <div className={`relative z-10 w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <config.icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-white capitalize">{log.action}</span>
                            {log.entity_type && (
                              <span className="text-xs text-surface-400 bg-surface-200/20 px-2 py-0.5 rounded-md">
                                {log.entity_type}
                              </span>
                            )}
                          </div>
                          {log.details && (
                            <p className="text-xs text-surface-400 mt-1 line-clamp-2">
                              {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                            </p>
                          )}
                          <div className="flex items-center gap-1.5 mt-2 text-xs text-surface-500">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(log.created_at)}
                            <span className="w-1 h-1 rounded-full bg-surface-500" />
                            {new Date(log.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Activity}
            title="No activity logs"
            description={searchTerm || actionFilter !== 'all' ? 'Try adjusting your filters' : 'Activity will appear here as users interact with the platform'}
          />
        )}
      </Card>
    </div>
  );
}
