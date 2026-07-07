import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Info,
  CheckCircle2,
  Calculator,
  GitBranch,
  Award,
  Save,
  Send,
  Edit2,
  Trash2,
  FileDown,
  Eye,
  Lightbulb,
  Filter,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Idea } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, Button, Input, Textarea, Select, StatusBadge, EmptyState, useToast, StaggerItem } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  refreshIdeas: () => void;
  loading: boolean;
}

const workflowStages = [
  { id: 'idea_info', label: 'Idea Info', icon: Info },
  { id: 'd0_validation', label: 'D0 Validation', icon: CheckCircle2 },
  { id: 'd1_scoring', label: 'D1 Score Matrix', icon: Calculator },
  { id: 'd2_d4_workflow', label: 'D2-D4 Workflow', icon: GitBranch },
  { id: 'final_approval', label: 'Final Approval', icon: Award },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'd0_validation', label: 'D0 Validation' },
  { value: 'd1_scoring', label: 'D1 Scoring' },
  { value: 'd2_d4_workflow', label: 'D2-D4 Workflow' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const d0LeverOptions = [
  { value: '', label: 'Select lever...' },
  { value: 'cost_reduction', label: 'Cost Reduction' },
  { value: 'revenue_growth', label: 'Revenue Growth' },
  { value: 'efficiency', label: 'Efficiency Improvement' },
  { value: 'quality', label: 'Quality Enhancement' },
  { value: 'innovation', label: 'Innovation' },
];

export default function IdeaWorkspace() {
  const { ideas, refreshIdeas, loading } = useOutletContext<OutletContextType>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    d0_lever: '',
    estimated_impact: 'medium' as 'low' | 'medium' | 'high',
    implementability: 'mid_effort' as 'high_effort' | 'mid_effort' | 'quick_win',
    score: 0,
  });

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesSearch = idea.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.project_id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || idea.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [ideas, searchTerm, statusFilter]);

  const handleSelectIdea = (idea: Idea) => {
    setSelectedIdea(idea);
    setFormData({
      project_name: idea.project_name,
      description: idea.description || '',
      d0_lever: idea.d0_lever || '',
      estimated_impact: idea.estimated_impact || 'medium',
      implementability: idea.implementability || 'mid_effort',
      score: idea.score,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedIdea) return;
    setSaving(true);

    const { error } = await supabase
      .from('ideas')
      .update({ ...formData, updated_at: new Date().toISOString() })
      .eq('id', selectedIdea.id);

    setSaving(false);

    if (error) {
      toast('error', 'Save failed', error.message);
      return;
    }

    refreshIdeas();
    setIsEditing(false);
    toast('success', 'Changes saved', 'Idea details have been updated');
  };

  const handleSubmitForApproval = async () => {
    if (!selectedIdea) return;
    setSubmitting(true);

    const stageIndex = workflowStages.findIndex(s => s.id === selectedIdea.current_stage);
    const nextStage = workflowStages[Math.min(stageIndex + 1, workflowStages.length - 1)];

    const { error } = await supabase
      .from('ideas')
      .update({
        current_stage: nextStage.id,
        status: nextStage.id === 'final_approval' ? 'final_approval' : selectedIdea.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', selectedIdea.id);

    setSubmitting(false);

    if (error) {
      toast('error', 'Submission failed', error.message);
      return;
    }

    refreshIdeas();
    toast('success', 'Moved to next stage', `Idea is now in ${nextStage.label}`);
  };

  const handleDelete = async () => {
    if (!selectedIdea || !confirm('Are you sure you want to delete this idea? This action cannot be undone.')) return;

    const { error } = await supabase.from('ideas').delete().eq('id', selectedIdea.id);

    if (error) {
      toast('error', 'Delete failed', error.message);
      return;
    }

    refreshIdeas();
    setSelectedIdea(null);
    toast('success', 'Idea deleted', 'The idea has been permanently removed');
  };

  const getStageStatus = (stageId: string) => {
    if (!selectedIdea) return 'pending';
    const currentIndex = workflowStages.findIndex(s => s.id === selectedIdea.current_stage);
    const stageIndex = workflowStages.findIndex(s => s.id === stageId);
    if (stageIndex < currentIndex) return 'completed';
    if (stageIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Ideas List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            inputSize="sm"
            leftIcon={Search}
            placeholder="Search ideas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto pl-9 pr-8 py-2 bg-surface-100/50 border border-surface-200/30 rounded-xl text-sm text-white focus:outline-none focus:border-primary-500/50 cursor-pointer appearance-none"
            >
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value} className="bg-surface-50">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Ideas List */}
        <Card padding="none" className="overflow-hidden">
          <div className="px-4 py-3.5 border-b border-surface-200/20 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Ideas</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-primary-500/15 text-primary-400 rounded-md">{filteredIdeas.length}</span>
          </div>
          <div className="max-h-[calc(100vh-22rem)] overflow-y-auto scrollbar-none">
            {loading ? (
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shimmer h-20 rounded-xl" />
                ))}
              </div>
            ) : filteredIdeas.length > 0 ? (
              filteredIdeas.map((idea, index) => (
                <StaggerItem key={idea.id} index={index}>
                  <button
                    onClick={() => handleSelectIdea(idea)}
                    className={`w-full p-4 text-left border-b border-surface-200/10 transition-all hover:bg-surface-100/30 relative ${
                      selectedIdea?.id === idea.id ? 'bg-surface-100/40' : ''
                    }`}
                  >
                    {selectedIdea?.id === idea.id && (
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-secondary-500" />
                    )}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono text-primary-400">{idea.project_id}</span>
                      <StatusBadge status={idea.status} size="sm" />
                    </div>
                    <h4 className="text-sm font-medium text-white truncate">{idea.project_name}</h4>
                    <p className="text-xs text-surface-400 truncate mt-1">{idea.description || 'No description'}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-surface-500">
                        {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      {idea.estimated_impact && (
                        <span className={`text-[11px] font-medium ${
                          idea.estimated_impact === 'high' ? 'text-success-400' :
                          idea.estimated_impact === 'medium' ? 'text-warning-400' : 'text-surface-400'
                        }`}>
                          {idea.estimated_impact} impact
                        </span>
                      )}
                    </div>
                  </button>
                </StaggerItem>
              ))
            ) : (
              <EmptyState
                icon={Lightbulb}
                title="No ideas found"
                description={searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Submit your first idea to get started'}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Idea Details */}
      <div className="lg:col-span-2">
        {selectedIdea ? (
          <div className="space-y-5">
            {/* Workflow Stepper */}
            <Card>
              <h3 className="text-base font-semibold text-white mb-5">Workflow Progress</h3>
              <div className="flex items-center justify-between">
                {workflowStages.map((stage, index) => {
                  const status = getStageStatus(stage.id);
                  return (
                    <div key={stage.id} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            status === 'completed'
                              ? 'bg-success-500/20 text-success-400 border border-success-500/30'
                              : status === 'current'
                              ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                              : 'bg-surface-100/40 text-surface-400 border border-surface-200/20'
                          }`}
                        >
                          {status === 'current' && (
                            <span className="absolute inset-0 rounded-xl border-2 border-primary-500/40 animate-pulse-ring" />
                          )}
                          <stage.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-[11px] font-medium text-center hidden sm:block ${
                          status === 'current' ? 'text-primary-400' : status === 'completed' ? 'text-success-400' : 'text-surface-400'
                        }`}>
                          {stage.label}
                        </span>
                      </div>
                      {index < workflowStages.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 rounded-full transition-colors duration-500 ${
                          getStageStatus(stage.id) === 'completed' ? 'bg-success-500/50' : 'bg-surface-200/20'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Project Details */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Project Details</h3>
                  <p className="text-sm text-surface-400 mt-0.5">Basic information about this idea</p>
                </div>
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button size="sm" onClick={handleSave} loading={saving} leftIcon={Save}>Save</Button>
                    </>
                  ) : (
                    profile?.role !== 'employee' && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} leftIcon={Edit2}>Edit</Button>
                    )
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Project ID"
                  value={selectedIdea.project_id}
                  disabled
                  className="opacity-60"
                />
                <Input
                  label="Project Name"
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  disabled={!isEditing}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>
              </div>
            </Card>

            {/* Assessment Parameters */}
            <Card>
              <h3 className="text-base font-semibold text-white mb-5">Assessment Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <Select
                  label="D0 Lever"
                  value={formData.d0_lever}
                  onChange={(e) => setFormData({ ...formData, d0_lever: e.target.value })}
                  options={d0LeverOptions}
                  disabled={!isEditing}
                />

                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">Estimated Impact</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high'].map((impact) => (
                      <button
                        key={impact}
                        type="button"
                        onClick={() => isEditing && setFormData({ ...formData, estimated_impact: impact as 'low' | 'medium' | 'high' })}
                        disabled={!isEditing}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all ${
                          formData.estimated_impact === impact
                            ? impact === 'high'
                              ? 'bg-success-500/20 text-success-400 border border-success-500/40'
                              : impact === 'medium'
                              ? 'bg-warning-500/20 text-warning-400 border border-warning-500/40'
                              : 'bg-surface-300/20 text-surface-500 border border-surface-300/40'
                            : 'bg-surface-100/30 text-surface-400 border border-surface-200/20 hover:border-surface-200/40'
                        }`}
                      >
                        {impact}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-600 mb-2">Implementability</label>
                  <div className="flex gap-2">
                    {[
                      { value: 'quick_win', label: 'Quick Win' },
                      { value: 'mid_effort', label: 'Mid Effort' },
                      { value: 'high_effort', label: 'High Effort' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => isEditing && setFormData({ ...formData, implementability: option.value as 'high_effort' | 'mid_effort' | 'quick_win' })}
                        disabled={!isEditing}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-medium transition-all ${
                          formData.implementability === option.value
                            ? 'bg-primary-500/20 text-primary-400 border border-primary-500/40'
                            : 'bg-surface-100/30 text-surface-400 border border-surface-200/20 hover:border-surface-200/40'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="mt-5 animate-fade-in-up">
                  <Input
                    label="Score (0-100)"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.score}
                    onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                  />
                </div>
              )}
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSubmitForApproval}
                loading={submitting}
                disabled={profile?.role === 'employee'}
                leftIcon={Send}
              >
                Submit For Approval
              </Button>
              <Button variant="outline" leftIcon={FileDown}>Export Excel</Button>
              <Button variant="outline" leftIcon={Eye}>Download PDF</Button>
              {profile?.role === 'admin' && (
                <Button variant="danger" onClick={handleDelete} leftIcon={Trash2}>Delete</Button>
              )}
            </div>
          </div>
        ) : (
          <Card className="h-full flex items-center justify-center min-h-[400px]">
            <EmptyState
              icon={Lightbulb}
              title="Select an Idea"
              description="Choose an idea from the list to view details and manage workflow stages"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
