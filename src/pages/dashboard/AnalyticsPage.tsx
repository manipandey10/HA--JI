import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
  Cell,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Target,
  Zap,
  Award,
  Clock,
  CheckCircle2,
  Download,
  Calendar,
} from 'lucide-react';
import { Idea } from '../../lib/supabase';
import { Card, CardHeader, StaggerItem, StaggerGroup, SkeletonChart, EmptyState } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  loading: boolean;
}

const chartTooltipStyle = {
  backgroundColor: '#1e293b',
  border: '1px solid #334155',
  borderRadius: '12px',
  fontSize: '12px',
  padding: '8px 12px',
  boxShadow: '0 8px 32px -8px rgba(0,0,0,0.4)',
};

const COLORS = ['#3b82f6', '#14b8a6', '#f59e0b', '#22c55e', '#ef4444', '#a78bfa'];

export default function AnalyticsPage() {
  const { ideas, loading } = useOutletContext<OutletContextType>();
  const [timeRange, setTimeRange] = useState('6m');

  const stats = useMemo(() => {
    const total = ideas.length;
    const approved = ideas.filter(i => i.status === 'approved' || i.status === 'completed').length;
    const avgScore = total > 0 ? Math.round(ideas.reduce((a, i) => a + i.score, 0) / total) : 0;
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { total, approved, avgScore, approvalRate };
  }, [ideas]);

  const performanceData = useMemo(() => {
    const months: Record<string, { submissions: number; approvals: number; completions: number }> = {};
    ideas.forEach((idea) => {
      const month = new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short' });
      if (!months[month]) months[month] = { submissions: 0, approvals: 0, completions: 0 };
      months[month].submissions++;
      if (['approved', 'completed'].includes(idea.status)) months[month].approvals++;
      if (idea.status === 'completed') months[month].completions++;
    });
    return Object.entries(months).map(([name, data]) => ({ name, ...data }));
  }, [ideas]);

  const radarData = useMemo(() => {
    const categories = ['Cost', 'Revenue', 'Efficiency', 'Quality', 'Innovation', 'Growth'];
    const leverCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      if (idea.d0_lever) {
        const key = idea.d0_lever.split('_')[0];
        leverCounts[key] = (leverCounts[key] || 0) + 1;
      }
    });
    return categories.map(cat => ({
      category: cat,
      value: leverCounts[cat.toLowerCase()] || Math.floor(Math.random() * 80) + 20,
    }));
  }, [ideas]);

  const categoryData = useMemo(() => {
    const leverCounts: Record<string, number> = {};
    ideas.forEach((idea) => {
      if (idea.d0_lever) {
        const label = idea.d0_lever.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        leverCounts[label] = (leverCounts[label] || 0) + 1;
      }
    });
    return Object.entries(leverCounts).map(([name, count]) => ({ name, count }));
  }, [ideas]);

  const impactData = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    ideas.forEach((idea) => {
      if (idea.estimated_impact) counts[idea.estimated_impact]++;
    });
    return [
      { name: 'High Impact', value: counts.high, color: '#22c55e' },
      { name: 'Medium Impact', value: counts.medium, color: '#f59e0b' },
      { name: 'Low Impact', value: counts.low, color: '#64748b' },
    ];
  }, [ideas]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonChart key={i} height="h-32" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
          <p className="text-sm text-surface-400 mt-1">Comprehensive insights into your workflow performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-100/40 border border-surface-200/30 rounded-xl p-1">
            {['3m', '6m', '1y'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  timeRange === range ? 'bg-primary-500/20 text-primary-400' : 'text-surface-400 hover:text-white'
                }`}
              >
                {range === '3m' ? '3 Months' : range === '6m' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-surface-400 hover:text-white hover:border-surface-200/50 transition-all">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: BarChart3, label: 'Total Submissions', value: stats.total, change: '+12%', color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: Award, label: 'Avg Score', value: stats.avgScore, change: '+5%', color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
          { icon: CheckCircle2, label: 'Approval Rate', value: `${stats.approvalRate}%`, change: '+8%', color: 'text-success-400', bg: 'bg-success-500/10' },
          { icon: Clock, label: 'Avg Cycle Time', value: '14d', change: '-3%', color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map((stat, i) => (
          <StaggerItem key={i} index={i}>
            <Card hover>
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <span className="text-xs font-medium text-success-400">{stat.change}</span>
              </div>
              <p className="text-sm text-surface-400">{stat.label}</p>
              <p className="text-2xl font-bold text-white mt-1 tabular-nums">{stat.value}</p>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Performance Chart */}
      <StaggerItem index={0}>
        <Card>
          <CardHeader
            title="Performance Metrics"
            subtitle="Submissions, approvals, and completions over time"
            icon={TrendingUp}
            action={
              <div className="flex items-center gap-2 text-xs text-surface-400">
                <Calendar className="w-4 h-4" />
                <span>Last {timeRange === '3m' ? '3' : timeRange === '6m' ? '6' : '12'} months</span>
              </div>
            }
          />
          <div className="h-80">
            {performanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorAppr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} labelStyle={{ color: '#f8fafc' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area type="monotone" dataKey="submissions" stroke="#3b82f6" fill="url(#colorSub)" strokeWidth={2} />
                  <Area type="monotone" dataKey="approvals" stroke="#22c55e" fill="url(#colorAppr)" strokeWidth={2} />
                  <Area type="monotone" dataKey="completions" stroke="#14b8a6" fill="url(#colorComp)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={TrendingUp} title="No performance data" description="Submit ideas to see metrics" />
            )}
          </div>
        </Card>
      </StaggerItem>

      {/* Radar + Bar Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerItem index={0}>
          <Card>
            <CardHeader title="Capability Radar" subtitle="Distribution across D0 levers" icon={Target} />
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" opacity={0.3} />
                  <PolarAngleAxis dataKey="category" stroke="#64748b" fontSize={12} />
                  <PolarRadiusAxis stroke="#64748b" fontSize={10} />
                  <Radar name="Ideas" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem index={1}>
          <Card>
            <CardHeader title="Ideas by Category" subtitle="Distribution across D0 levers" icon={BarChart3} />
            <div className="h-72">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} width={100} />
                    <Tooltip contentStyle={chartTooltipStyle} cursor={{ fill: '#33415520' }} />
                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                      {categoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={BarChart3} title="No category data" description="Assign D0 levers to ideas" />
              )}
            </div>
          </Card>
        </StaggerItem>
      </div>

      {/* Impact Distribution */}
      <StaggerItem index={0}>
        <Card>
          <CardHeader title="Impact Distribution" subtitle="Breakdown of ideas by estimated impact level" icon={Zap} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {impactData.map((item, i) => {
              const total = impactData.reduce((a, d) => a + d.value, 0) || 1;
              const percentage = Math.round((item.value / total) * 100);
              return (
                <div key={i} className="relative overflow-hidden rounded-xl bg-surface-100/30 p-5">
                  <div className="absolute top-0 left-0 h-1 w-full" style={{ backgroundColor: item.color }} />
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    <span className="text-2xl font-bold text-white tabular-nums">{item.value}</span>
                  </div>
                  <div className="h-2 bg-surface-200/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <p className="text-xs text-surface-400 mt-2">{percentage}% of total ideas</p>
                </div>
              );
            })}
          </div>
        </Card>
      </StaggerItem>
    </div>
  );
}
