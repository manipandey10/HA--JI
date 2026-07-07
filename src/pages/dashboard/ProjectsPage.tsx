import { useState, useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Grid3X3,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Zap,
  ChevronRight,
  LayoutGrid,
  List,
} from 'lucide-react';
import { Idea } from '../../lib/supabase';
import { Card, StatusBadge, EmptyState, StaggerItem, StaggerGroup, SkeletonCard } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  loading: boolean;
}

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'd0_validation', label: 'D0 Validation' },
  { value: 'd1_scoring', label: 'D1 Scoring' },
  { value: 'd2_d4_workflow', label: 'D2-D4 Workflow' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];

const impactOptions = [
  { value: 'all', label: 'All Impact' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function ProjectsPage() {
  const { ideas, loading } = useOutletContext<OutletContextType>();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [impactFilter, setImpactFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch = idea.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.project_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
      const matchesImpact = impactFilter === 'all' || idea.estimated_impact === impactFilter;
      return matchesSearch && matchesStatus && matchesImpact;
    });
  }, [ideas, searchTerm, statusFilter, impactFilter]);

  const stats = useMemo(() => ({
    total: ideas.length,
    inProgress: ideas.filter(i => !['approved', 'rejected', 'completed'].includes(i.status)).length,
    approved: ideas.filter(i => i.status === 'approved' || i.status === 'completed').length,
    highImpact: ideas.filter(i => i.estimated_impact === 'high').length,
  }), [ideas]);

  const getImpactColor = (impact: string | null) => {
    if (impact === 'high') return 'text-success-400 bg-success-500/10 border-success-500/30';
    if (impact === 'medium') return 'text-warning-400 bg-warning-500/10 border-warning-500/30';
    return 'text-surface-400 bg-surface-300/10 border-surface-300/30';
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'from-success-500 to-success-400';
    if (score >= 50) return 'from-primary-500 to-primary-400';
    if (score >= 25) return 'from-warning-500 to-warning-400';
    return 'from-error-500 to-error-400';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Grid3X3, label: 'Total Projects', value: stats.total, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: Clock, label: 'In Progress', value: stats.inProgress, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
          { icon: CheckCircle2, label: 'Approved', value: stats.approved, color: 'text-success-400', bg: 'bg-success-500/10' },
          { icon: TrendingUp, label: 'High Impact', value: stats.highImpact, color: 'text-accent-400', bg: 'bg-accent-500/10' },
        ].map((stat, i) => (
          <StaggerItem key={i} index={i}>
            <Card hover>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-surface-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white tabular-nums">{stat.value}</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Filters Bar */}
      <Card padding="sm">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2.5 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white placeholder-surface-400 focus:outline-none focus:border-primary-500/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none"
              >
                {statusOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-surface-50">{opt.label}</option>)}
              </select>
            </div>

            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
              <select
                value={impactFilter}
                onChange={(e) => setImpactFilter(e.target.value)}
                className="pl-9 pr-8 py-2.5 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none"
              >
                {impactOptions.map(opt => <option key={opt.value} value={opt.value} className="bg-surface-50">{opt.label}</option>)}
              </select>
            </div>

            <div className="flex bg-surface-100/40 border border-surface-200/30 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400' : 'text-surface-400 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400' : 'text-surface-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Project Grid/List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filteredIdeas.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredIdeas.map((idea, index) => (
              <StaggerItem key={idea.id} index={index}>
                <Card
                  hover
                  padding="none"
                  className="cursor-pointer group overflow-hidden"
                  onClick={() => navigate('/dashboard/ideas')}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-1 rounded-md">{idea.project_id}</span>
                      <StatusBadge status={idea.status} size="sm" />
                    </div>
                    <h4 className="text-white font-medium mb-2 group-hover:text-primary-400 transition-colors line-clamp-2">
                      {idea.project_name}
                    </h4>
                    <p className="text-xs text-surface-400 line-clamp-2 mb-4 min-h-[2rem]">{idea.description || 'No description available'}</p>

                    <div className="flex items-center gap-2 mb-4">
                      <span className={`text-[10px] font-medium capitalize px-2 py-1 rounded-md border ${getImpactColor(idea.estimated_impact)}`}>
                        {idea.estimated_impact || 'N/A'} impact
                      </span>
                      {idea.implementability && (
                        <span className="text-[10px] font-medium px-2 py-1 rounded-md bg-surface-200/20 text-surface-400 border border-surface-200/20">
                          {idea.implementability.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="pt-3 border-t border-surface-200/20">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs text-surface-400">Score</span>
                        <span className="text-xs font-medium text-white tabular-nums">{idea.score}/100</span>
                      </div>
                      <div className="h-1.5 bg-surface-200/20 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getScoreColor(idea.score)} rounded-full transition-all duration-500 group-hover:scale-x-105 origin-left`}
                          style={{ width: `${idea.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-surface-100/20 border-t border-surface-200/10 flex items-center justify-between">
                    <span className="text-[11px] text-surface-400">
                      {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Card>
              </StaggerItem>
            ))}
          </div>
        ) : (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200/20">
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">Impact</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">Score</th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                    <th className="px-6 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200/10">
                  {filteredIdeas.map((idea) => (
                    <tr
                      key={idea.id}
                      onClick={() => navigate('/dashboard/ideas')}
                      className="hover:bg-surface-100/30 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-mono text-primary-400">{idea.project_id.slice(-2)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white group-hover:text-primary-400 transition-colors truncate">{idea.project_name}</p>
                            <p className="text-xs text-surface-400 font-mono">{idea.project_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={idea.status} size="sm" /></td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`text-xs font-medium capitalize px-2 py-1 rounded-md border ${getImpactColor(idea.estimated_impact)}`}>
                          {idea.estimated_impact || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-surface-200/20 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${getScoreColor(idea.score)} rounded-full`} style={{ width: `${idea.score}%` }} />
                          </div>
                          <span className="text-xs text-surface-400 tabular-nums">{idea.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell text-sm text-surface-400">
                        {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight className="w-4 h-4 text-surface-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )
      ) : (
        <Card>
          <EmptyState
            icon={AlertCircle}
            title="No projects found"
            description={searchTerm || statusFilter !== 'all' || impactFilter !== 'all' ? 'Try adjusting your filters' : 'Submit your first idea to see it here'}
          />
        </Card>
      )}
    </div>
  );
}
