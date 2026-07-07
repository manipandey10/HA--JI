import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Search,
  Zap,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Idea } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Select, StatusBadge, EmptyState, useToast, StaggerItem, StaggerGroup, Modal, Textarea } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  refreshIdeas: () => void;
  loading: boolean;
}

const d0LeverOptions = [
  { value: '', label: 'Select lever...' },
  { value: 'cost_reduction', label: 'Cost Reduction' },
  { value: 'revenue_growth', label: 'Revenue Growth' },
  { value: 'efficiency', label: 'Efficiency Improvement' },
  { value: 'quality', label: 'Quality Enhancement' },
  { value: 'innovation', label: 'Innovation' },
];

export default function D0ValidationPage() {
  const { ideas, refreshIdeas, loading } = useOutletContext<OutletContextType>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [validatingIdea, setValidatingIdea] = useState<Idea | null>(null);
  const [d0Lever, setD0Lever] = useState('');
  const [validationNotes, setValidationNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const pendingValidation = useMemo(() => {
    return ideas.filter(i =>
      i.current_stage === 'd0_validation' || i.status === 'submitted'
    ).filter(i =>
      i.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.project_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [ideas, searchTerm]);

  const completedValidation = useMemo(() => {
    return ideas.filter(i =>
      i.current_stage !== 'd0_validation' && i.status !== 'submitted' && i.d0_lever
    );
  }, [ideas]);

  const stats = useMemo(() => ({
    pending: pendingValidation.length,
    completed: completedValidation.length,
    validated: ideas.filter(i => i.d0_lever).length,
    issues: ideas.filter(i => i.status === 'rejected').length,
  }), [pendingValidation, completedValidation, ideas]);

  const handleValidate = async () => {
    if (!validatingIdea) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('ideas')
      .update({
        d0_lever: d0Lever,
        current_stage: 'd1_scoring',
        status: 'd1_scoring',
        updated_at: new Date().toISOString(),
      })
      .eq('id', validatingIdea.id);

    setSubmitting(false);

    if (error) {
      toast('error', 'Validation failed', error.message);
      return;
    }

    refreshIdeas();
    setValidatingIdea(null);
    setD0Lever('');
    setValidationNotes('');
    toast('success', 'Idea validated', `${validatingIdea.project_name} moved to D1 Scoring`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="shimmer h-28 rounded-2xl" />)}
        </div>
        <div className="shimmer h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Clock, label: 'Pending Validation', value: stats.pending, color: 'text-warning-400', bg: 'bg-warning-500/10' },
          { icon: CheckCircle2, label: 'Completed', value: stats.completed, color: 'text-success-400', bg: 'bg-success-500/10' },
          { icon: FileCheck, label: 'Validated', value: stats.validated, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: AlertTriangle, label: 'Issues Found', value: stats.issues, color: 'text-error-400', bg: 'bg-error-500/10' },
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

      {/* Validation Queue */}
      <Card padding="none">
        <div className="px-6 py-5 border-b border-surface-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-white">D0 Validation Queue</h3>
            <p className="text-sm text-surface-400 mt-0.5">Review and validate ideas before scoring</p>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
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
        </div>

        <div className="divide-y divide-surface-200/10">
          {pendingValidation.length > 0 ? (
            pendingValidation.map((idea, index) => (
              <StaggerItem key={idea.id} index={index}>
                <div className="px-6 py-4 hover:bg-surface-100/30 transition-colors group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-warning-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-warning-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-primary-400">{idea.project_id}</span>
                          <StatusBadge status={idea.status} size="sm" />
                        </div>
                        <h4 className="text-sm font-medium text-white truncate">{idea.project_name}</h4>
                        <p className="text-xs text-surface-400 truncate mt-1">{idea.description || 'No description provided'}</p>
                        <div className="flex items-center gap-3 mt-2">
                          {idea.d0_lever ? (
                            <span className="text-[11px] font-medium px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-md">
                              {idea.d0_lever.replace(/_/g, ' ')}
                            </span>
                          ) : (
                            <span className="text-[11px] text-surface-400">Awaiting lever assignment</span>
                          )}
                          <span className="text-[11px] text-surface-400">
                            {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        setValidatingIdea(idea);
                        setD0Lever(idea.d0_lever || '');
                      }}
                      disabled={profile?.role === 'employee'}
                      leftIcon={CheckCircle2}
                    >
                      Validate
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            ))
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Queue is empty"
              description="All ideas have been validated. New submissions will appear here."
            />
          )}
        </div>
      </Card>

      {/* Validation Modal */}
      <Modal
        isOpen={!!validatingIdea}
        onClose={() => setValidatingIdea(null)}
        title="Validate Idea"
        subtitle={validatingIdea?.project_name}
        icon={CheckCircle2}
        footer={
          <>
            <Button variant="ghost" onClick={() => setValidatingIdea(null)}>Cancel</Button>
            <Button onClick={handleValidate} loading={submitting} leftIcon={CheckCircle2}>Approve & Advance</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-surface-100/30 rounded-xl">
            <p className="text-sm text-surface-400 mb-1">Project ID</p>
            <p className="text-sm font-mono text-primary-400">{validatingIdea?.project_id}</p>
          </div>
          <Select
            label="D0 Lever"
            value={d0Lever}
            onChange={(e) => setD0Lever(e.target.value)}
            options={d0LeverOptions}
          />
          <Textarea
            label="Validation Notes"
            value={validationNotes}
            onChange={(e) => setValidationNotes(e.target.value)}
            rows={3}
            placeholder="Add any validation notes or observations..."
          />
          <div className="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <Zap className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-xs text-surface-400">
              On approval, this idea will advance to <span className="text-primary-400 font-medium">D1 Score Matrix</span> for evaluation.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
