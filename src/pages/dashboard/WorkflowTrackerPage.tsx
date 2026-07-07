import { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Workflow,
  Info,
  CheckCircle2,
  Calculator,
  GitBranch,
  Award,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Idea } from '../../lib/supabase';
import { Card, CardHeader, StatusBadge, Progress, StaggerItem, StaggerGroup, EmptyState } from '../../components/ui';

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
};

const stages = [
  { id: 'idea_info', label: 'Idea Info', icon: Info, color: 'primary' },
  { id: 'd0_validation', label: 'D0 Validation', icon: CheckCircle2, color: 'secondary' },
  { id: 'd1_scoring', label: 'D1 Scoring', icon: Calculator, color: 'warning' },
  { id: 'd2_d4_workflow', label: 'D2-D4 Workflow', icon: GitBranch, color: 'success' },
  { id: 'final_approval', label: 'Final Approval', icon: Award, color: 'accent' },
];

const colorMap: Record<string, { bg: string; text: string; border: string; hex: string }> = {
  primary: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30', hex: '#3b82f6' },
  secondary: { bg: 'bg-secondary-500/15', text: 'text-secondary-400', border: 'border-secondary-500/30', hex: '#14b8a6' },
  warning: { bg: 'bg-warning-500/15', text: 'text-warning-400', border: 'border-warning-500/30', hex: '#f59e0b' },
  success: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30', hex: '#22c55e' },
  accent: { bg: 'bg-accent-500/15', text: 'text-accent-400', border: 'border-accent-500/30', hex: '#f59e0b' },
};

export default function WorkflowTrackerPage() {
  const { ideas, loading } = useOutletContext<OutletContextType>();

  const stageData = useMemo(() => {
    const counts: Record<string, number> = {};
    ideas.forEach((idea) => {
      counts[idea.current_stage] = (counts[idea.current_stage] || 0) + 1;
    });
    return stages.map(s => ({ name: s.label, value: counts[s.id] || 0, color: colorMap[s.color].hex }));
  }, [ideas]);

  const activeWorkflows = useMemo(() => {
    return ideas.filter(i => !['approved', 'rejected', 'completed'].includes(i.status));
  }, [ideas]);

  const getStageProgress = (currentStage: string) => {
    const index = stages.findIndex(s => s.id === currentStage);
    return Math.round(((index + 1) / stages.length) * 100);
  };

  const averageTimeData = [
    { stage: 'Idea Info', days: 2 },
    { stage: 'D0 Validation', days: 5 },
    { stage: 'D1 Scoring', days: 7 },
    { stage: 'D2-D4', days: 14 },
    { stage: 'Approval', days: 3 },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
        </div>
        <div className="shimmer h-80 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage Overview Cards */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stages.map((stage, i) => {
          const count = ideas.filter(i => i.current_stage === stage.id).length;
          const colors = colorMap[stage.color];
          return (
            <StaggerItem key={stage.id} index={i}>
              <Card hover className="relative overflow-hidden">
                <div className={`absolute -top-6 -right-6 w-20 h-20 ${colors.bg} rounded-full blur-2xl`} />
                <div className="relative">
                  <div className={`w-10 h-10 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center mb-3`}>
                    <stage.icon className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <p className="text-xs text-surface-400">{stage.label}</p>
                  <p className="text-2xl font-bold text-white mt-1 tabular-nums">{count}</p>
                </div>
              </Card>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StaggerItem index={0}>
          <Card>
            <CardHeader title="Stage Distribution" subtitle="Ideas across workflow stages" icon={Workflow} />
            <div className="h-64">
              {stageData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stageData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                      {stageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyState icon={Workflow} title="No data" description="Submit ideas to see distribution" />
              )}
            </div>
          </Card>
        </StaggerItem>

        <StaggerItem index={1}>
          <Card>
            <CardHeader title="Average Time per Stage" subtitle="Days spent in each workflow stage" icon={Clock} />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={averageTimeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                  <XAxis dataKey="stage" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Line type="monotone" dataKey="days" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </StaggerItem>
      </div>

      {/* Active Workflows Table */}
      <StaggerItem index={0}>
        <Card padding="none">
          <div className="px-6 py-5 border-b border-surface-200/20">
            <h3 className="text-base font-semibold text-white">Active Workflows</h3>
            <p className="text-sm text-surface-400 mt-0.5">Ideas currently in the workflow pipeline</p>
          </div>
          <div className="overflow-x-auto">
            {activeWorkflows.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200/20">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Current Stage</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">Progress</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200/10">
                  {activeWorkflows.map((idea) => {
                    const progress = getStageProgress(idea.current_stage);
                    const currentStageInfo = stages.find(s => s.id === idea.current_stage);
                    const colors = currentStageInfo ? colorMap[currentStageInfo.color] : colorMap.primary;
                    return (
                      <tr key={idea.id} className="hover:bg-surface-100/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center`}>
                              <span className="text-[10px] font-mono text-primary-400">{idea.project_id.slice(-2)}</span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">{idea.project_name}</p>
                              <p className="text-xs text-surface-400 font-mono">{idea.project_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {currentStageInfo && <currentStageInfo.icon className={`w-4 h-4 ${colors.text}`} />}
                            <span className="text-sm text-surface-400">{currentStageInfo?.label || idea.current_stage}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="w-32">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-surface-400">{progress}%</span>
                            </div>
                            <Progress value={progress} size="sm" variant={progress >= 80 ? 'success' : progress >= 40 ? 'primary' : 'warning'} />
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell"><StatusBadge status={idea.status} size="sm" /></td>
                        <td className="px-6 py-4">
                          <ArrowRight className="w-4 h-4 text-surface-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={TrendingUp} title="No active workflows" description="All ideas have been processed" />
            )}
          </div>
        </Card>
      </StaggerItem>
    </div>
  );
}
