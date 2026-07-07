import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  GitBranch,
  FileCode,
  Rocket,
  CheckCircle2,
  ArrowRight,
  Search,
  Zap,
  Eye,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Idea } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, StatusBadge, Progress, EmptyState, useToast, StaggerItem, Modal, Input, Select } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  refreshIdeas: () => void;
  loading: boolean;
}

const d2d4Stages = [
  { id: 'd2', label: 'D2 Define', icon: FileCode, desc: 'Define scope and requirements', color: 'primary' },
  { id: 'd3', label: 'D3 Develop', icon: GitBranch, desc: 'Develop and build solution', color: 'secondary' },
  { id: 'd4', label: 'D4 Deploy', icon: Rocket, desc: 'Deploy and monitor results', color: 'success' },
];

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  primary: { bg: 'bg-primary-500/15', text: 'text-primary-400', border: 'border-primary-500/30' },
  secondary: { bg: 'bg-secondary-500/15', text: 'text-secondary-400', border: 'border-secondary-500/30' },
  success: { bg: 'bg-success-500/15', text: 'text-success-400', border: 'border-success-500/30' },
};

export default function D2D4WorkflowPage() {
  const { ideas, refreshIdeas, loading } = useOutletContext<OutletContextType>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [updateIdea, setUpdateIdea] = useState<Idea | null>(null);
  const [progressNotes, setProgressNotes] = useState('');
  const [newStatus, setNewStatus] = useState('d2_d4_workflow');
  const [submitting, setSubmitting] = useState(false);

  const activeWorkflows = useMemo(() => {
    return ideas.filter(i => i.current_stage === 'd2_d4_workflow' || i.status === 'd2_d4_workflow')
      .filter(i =>
        i.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.project_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [ideas, searchTerm]);

  const stats = useMemo(() => ({
    total: activeWorkflows.length,
    d2: activeWorkflows.length,
    completed: ideas.filter(i => i.status === 'completed').length,
    approved: ideas.filter(i => i.status === 'approved').length,
  }), [activeWorkflows, ideas]);

  const handleUpdate = async () => {
    if (!updateIdea) return;
    setSubmitting(true);

    const isFinalApproval = newStatus === 'final_approval';
    const { error } = await supabase
      .from('ideas')
      .update({
        current_stage: isFinalApproval ? 'final_approval' : 'd2_d4_workflow',
        status: newStatus as Idea['status'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', updateIdea.id);

    setSubmitting(false);

    if (error) {
      toast('error', 'Update failed', error.message);
      return;
    }

    refreshIdeas();
    setUpdateIdea(null);
    setProgressNotes('');
    toast('success', 'Progress updated', `${updateIdea.project_name} status has been updated`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="shimmer h-32 rounded-2xl" />
        <div className="shimmer h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workflow Stages Diagram */}
      <StaggerItem index={0}>
        <Card>
          <h3 className="text-base font-semibold text-white mb-5">D2-D4 Development Pipeline</h3>
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {d2d4Stages.map((stage, index) => {
              const colors = colorMap[stage.color];
              return (
                <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className={`relative w-14 h-14 sm:w-16 sm:h-16 ${colors.bg} ${colors.border} border rounded-2xl flex items-center justify-center`}>
                      <stage.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${colors.text}`} />
                      {index === 0 && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className={`text-xs sm:text-sm font-medium ${colors.text}`}>{stage.label}</p>
                      <p className="text-[10px] sm:text-xs text-surface-400 hidden sm:block mt-0.5">{stage.desc}</p>
                    </div>
                  </div>
                  {index < d2d4Stages.length - 1 && (
                    <div className="flex items-center px-1 sm:px-2">
                      <ArrowRight className="w-5 h-5 text-surface-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </StaggerItem>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: GitBranch, label: 'Active Workflows', value: stats.total, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: FileCode, label: 'In D2 Define', value: stats.d2, color: 'text-secondary-400', bg: 'bg-secondary-500/10' },
          { icon: CheckCircle2, label: 'Approved', value: stats.approved, color: 'text-success-400', bg: 'bg-success-500/10' },
          { icon: Rocket, label: 'Completed', value: stats.completed, color: 'text-accent-400', bg: 'bg-accent-500/10' },
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
      </div>

      {/* Active Workflows List */}
      <Card padding="none">
        <div className="px-6 py-5 border-b border-surface-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">Active D2-D4 Projects</h3>
            <p className="text-sm text-surface-400 mt-0.5">Projects currently in the development pipeline</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full sm:w-48 pl-9 pr-4 py-2 bg-surface-100/40 border border-surface-200/30 rounded-xl text-sm text-white placeholder-surface-400 focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>

        <div className="divide-y divide-surface-200/10">
          {activeWorkflows.length > 0 ? (
            activeWorkflows.map((idea, index) => (
              <StaggerItem key={idea.id} index={index}>
                <div className="px-6 py-4 hover:bg-surface-100/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <GitBranch className="w-5 h-5 text-primary-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-primary-400">{idea.project_id}</span>
                          <StatusBadge status={idea.status} size="sm" />
                          {idea.estimated_impact && (
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              idea.estimated_impact === 'high' ? 'bg-success-500/10 text-success-400' :
                              idea.estimated_impact === 'medium' ? 'bg-warning-500/10 text-warning-400' : 'bg-surface-300/10 text-surface-400'
                            }`}>
                              {idea.estimated_impact} impact
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-white truncate">{idea.project_name}</h4>
                        <p className="text-xs text-surface-400 truncate mt-1">{idea.description || 'No description'}</p>
                        <div className="mt-2 w-full max-w-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] text-surface-400">Score: {idea.score}/100</span>
                          </div>
                          <Progress value={idea.score} size="sm" variant={idea.score >= 75 ? 'success' : 'primary'} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUpdateIdea(idea)}
                        disabled={profile?.role === 'employee'}
                        leftIcon={TrendingUp}
                      >
                        Update Progress
                      </Button>
                      <Button variant="ghost" size="sm" leftIcon={Eye}>Details</Button>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))
          ) : (
            <EmptyState
              icon={GitBranch}
              title="No active D2-D4 workflows"
              description="Ideas that reach the D2-D4 stage will appear here"
            />
          )}
        </div>
      </Card>

      {/* Update Progress Modal */}
      <Modal
        isOpen={!!updateIdea}
        onClose={() => setUpdateIdea(null)}
        title="Update Progress"
        subtitle={updateIdea?.project_name}
        icon={TrendingUp}
        footer={
          <>
            <Button variant="ghost" onClick={() => setUpdateIdea(null)}>Cancel</Button>
            <Button onClick={handleUpdate} loading={submitting} leftIcon={CheckCircle2}>Save Update</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-100/30 rounded-xl">
            <p className="text-sm text-surface-400 mb-1">Project ID</p>
            <p className="text-sm font-mono text-primary-400">{updateIdea?.project_id}</p>
          </div>
          <Select
            label="Update Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            options={[
              { value: 'd2_d4_workflow', label: 'D2-D4 Workflow (In Progress)' },
              { value: 'final_approval', label: 'Submit for Final Approval' },
              { value: 'approved', label: 'Approved' },
              { value: 'completed', label: 'Completed' },
            ]}
          />
          <Input
            label="Progress Notes"
            value={progressNotes}
            onChange={(e) => setProgressNotes(e.target.value)}
            placeholder="Add notes about current progress..."
          />
          <div className="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <Zap className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-xs text-surface-400">
              Selecting "Final Approval" will move this idea to the final approval stage.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
