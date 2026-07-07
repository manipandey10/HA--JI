import { useEffect, useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from 'recharts';
import {
  Lightbulb,
  Clock,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  FileText,
  Zap,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Idea } from '../../lib/supabase';
import { Card, CardHeader, StatusBadge, SkeletonCard, SkeletonChart, StaggerItem, StaggerGroup, EmptyState } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  refreshIdeas: () => void;
  loading: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  delay: number;
}

function KPICard({ title, value, change, icon: Icon, gradient, iconBg, delay }: KPICardProps) {
  return (
    <StaggerItem index={delay}>
      <Card hover className="relative overflow-hidden group">
        <div className={`absolute -top-8 -right-8 w-24 h-24 ${gradient} rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity`} />
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
              change >= 0 ? 'text-success-400 bg-success-500/10' : 'text-error-400 bg-error-500/10'
            }`}>
              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(change)}%
            </div>
          </div>
          <p className="text-surface-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-1 tabular-nums">{value}</h3>
        </div>
      </Card>
    </StaggerItem>
  );
}

const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
};

export default function DashboardHome() {
  const { ideas, loading } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([]);

  const stats = useMemo(() => {
    const counts = ideas.reduce((acc, idea) => {
      if (idea.status in acc) {
        acc[idea.status as keyof typeof acc]++;
      }
      return acc;
    }, {
      submitted: 0, d0_validation: 0, d1_scoring: 0, d2_d4_workflow: 0,
      final_approval: 0, approved: 0, rejected: 0, completed: 0,
    });

    return {
      submitted: counts.submitted + counts.d0_validation,
      underReview: counts.d1_scoring + counts.d2_d4_workflow,
      pending: counts.final_approval,
      approved: counts.approved,
      completed: counts.completed,
    };
  }, [ideas]);

  const statusData = useMemo(() => [
    { name: 'Submitted', value: stats.submitted, color: '#3b82f6' },
    { name: 'Under Review', value: stats.underReview, color: '#14b8a6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Approved', value: stats.approved, color: '#22c55e' },
    { name: 'Completed', value: stats.completed, color: '#a78bfa' },
  ].filter(d => d.value > 0), [stats]);

  const monthlyData = useMemo(() => {
    const months: Record<string, { submitted: number; approved: number; completed: number }> = {};
    ideas.forEach((idea) => {
      const month = new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!months[month]) months[month] = { submitted: 0, approved: 0, completed: 0 };
      months[month].submitted++;
      if (idea.status === 'approved' || idea.status === 'completed') months[month].approved++;
      if (idea.status === 'completed') months[month].completed++;
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [ideas]);

  useEffect(() => {
    setRecentIdeas(ideas.slice(0, 6));
  }, [ideas]);

  if (loading) {
    return (
      <div className="space-y-6">
        <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)}
        </StaggerGroup>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><SkeletonChart /></div>
          <SkeletonChart height="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <KPICard title="Ideas Submitted" value={stats.submitted} change={12} icon={Lightbulb} gradient="bg-primary-500" iconBg="bg-primary-500/15 text-primary-400" delay={0} />
        <KPICard title="Under Review" value={stats.underReview} change={-5} icon={Clock} gradient="bg-secondary-500" iconBg="bg-secondary-500/15 text-secondary-400" delay={1} />
        <KPICard title="Pending Approval" value={stats.pending} change={8} icon={AlertCircle} gradient="bg-warning-500" iconBg="bg-warning-500/15 text-warning-400" delay={2} />
        <KPICard title="Approved" value={stats.approved} change={24} icon={CheckCircle2} gradient="bg-success-500" iconBg="bg-success-500/15 text-success-400" delay={3} />
        <KPICard title="Completed" value={stats.completed} change={18} icon={TrendingUp} gradient="bg-accent-500" iconBg="bg-accent-500/15 text-accent-400" delay={4} />
      </StaggerGroup>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Area Chart */}
        <StaggerItem index={0} className="lg:col-span-2">
          <Card>
            <CardHeader
              title="Workflow Trends"
              subtitle="Monthly idea submissions & approvals"
              icon={TrendingUp}
              action={
                <select className="bg-surface-100/50 border border-surface-200/30 rounded-lg px-3 py-1.5 text-sm text-surface-400 focus:outline-none focus:border-primary-500/50 cursor-pointer">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              }
            />
            <div className="h-72">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#f8fafc' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="submitted" stroke="#3b82f6" fill="url(#colorSubmitted)" strokeWidth={2} />
                    <Area type="monotone" dataKey="approved" stroke="#22c55e" fill="url(#colorApproved)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={TrendingUp} title="No data yet" description="Submit ideas to see workflow trends" />
              )}
            </div>
          </Card>
        </StaggerItem>

        {/* Pie Chart */}
        <StaggerItem index={1}>
          <Card>
            <CardHeader title="Idea Distribution" subtitle="Current status breakdown" icon={Activity} />
            <div className="h-48">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={Activity} title="No data" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-surface-400">{item.name}</span>
                  <span className="text-xs text-surface-600 font-medium ml-auto">{item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </StaggerItem>
      </div>

      {/* Quick Stats and Recent Ideas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats */}
        <StaggerItem index={0}>
          <Card>
            <CardHeader title="Quick Stats" subtitle="Platform overview" icon={Zap} />
            <div className="space-y-3">
              {[
                { icon: Users, label: 'Active Users', value: '24', color: 'text-primary-400', bg: 'bg-primary-500/10' },
                { icon: FileText, label: 'Total Ideas', value: ideas.length, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
                { icon: Activity, label: 'Avg Score', value: ideas.length > 0 ? Math.round(ideas.reduce((a, i) => a + i.score, 0) / ideas.length) : 0, color: 'text-success-400', bg: 'bg-success-500/10' },
                { icon: Zap, label: 'Quick Wins', value: ideas.filter(i => i.implementability === 'quick_win').length, color: 'text-accent-400', bg: 'bg-accent-500/10' },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-surface-100/30 rounded-xl hover:bg-surface-100/50 transition-colors">
                  <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-surface-400">{stat.label}</p>
                    <p className="text-xl font-semibold text-white tabular-nums">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </StaggerItem>

        {/* Recent Ideas Table */}
        <StaggerItem index={1} className="lg:col-span-2">
          <Card padding="none">
            <div className="px-6 py-5 border-b border-surface-200/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Recent Ideas</h3>
                <p className="text-sm text-surface-400 mt-0.5">Latest submissions across all projects</p>
              </div>
              <button
                onClick={() => navigate('/dashboard/ideas')}
                className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              {recentIdeas.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-surface-200/20">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">Impact</th>
                      <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-200/10">
                    {recentIdeas.map((idea) => (
                      <tr
                        key={idea.id}
                        onClick={() => navigate('/dashboard/ideas')}
                        className="hover:bg-surface-100/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-[10px] font-mono text-primary-400">{idea.project_id.slice(-2)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">{idea.project_name}</p>
                              <p className="text-xs text-surface-400 font-mono">{idea.project_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5"><StatusBadge status={idea.status} size="sm" /></td>
                        <td className="px-6 py-3.5 hidden sm:table-cell">
                          <span className={`text-xs font-medium capitalize ${
                            idea.estimated_impact === 'high' ? 'text-success-400' :
                            idea.estimated_impact === 'medium' ? 'text-warning-400' : 'text-surface-400'
                          }`}>
                            {idea.estimated_impact || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 hidden md:table-cell text-sm text-surface-400">
                          {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <EmptyState
                  icon={Lightbulb}
                  title="No ideas yet"
                  description="Submit your first idea to see it appear here"
                  action={
                    <button
                      onClick={() => navigate('/dashboard/ideas')}
                      className="px-4 py-2 bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 rounded-xl text-sm font-medium transition-colors"
                    >
                      Submit Idea
                    </button>
                  }
                />
              )}
            </div>
          </Card>
        </StaggerItem>
      </div>
    </div>
  );
}
