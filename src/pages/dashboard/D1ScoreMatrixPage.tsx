import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  Target,
  Zap,
  Award,
  Search,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Idea } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, StatusBadge, Button, EmptyState, useToast, StaggerItem, StaggerGroup, Modal } from '../../components/ui';

interface OutletContextType {
  ideas: Idea[];
  refreshIdeas: () => void;
  loading: boolean;
}

const impactToScore: Record<string, number> = { high: 3, medium: 2, low: 1 };
const effortToScore: Record<string, number> = { quick_win: 3, mid_effort: 2, high_effort: 1 };

export default function D1ScoreMatrixPage() {
  const { ideas, refreshIdeas, loading } = useOutletContext<OutletContextType>();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [scoringIdea, setScoringIdea] = useState<Idea | null>(null);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const scoredIdeas = useMemo(() => {
    return ideas.filter(i => i.estimated_impact && i.implementability);
  }, [ideas]);

  const stats = useMemo(() => {
    const scored = ideas.filter(i => i.score > 0);
    const avg = scored.length > 0 ? Math.round(scored.reduce((a, i) => a + i.score, 0) / scored.length) : 0;
    return {
      avg,
      high: scored.filter(i => i.score >= 75).length,
      medium: scored.filter(i => i.score >= 50 && i.score < 75).length,
      low: scored.filter(i => i.score < 50).length,
    };
  }, [ideas]);

  const matrixData = useMemo(() => {
    return scoredIdeas.map(idea => ({
      ...idea,
      x: effortToScore[idea.implementability || 'mid_effort'] || 2,
      y: impactToScore[idea.estimated_impact || 'medium'] || 2,
    }));
  }, [scoredIdeas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter(i =>
      i.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.project_id.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
  }, [ideas, searchTerm]);

  const handleScore = async () => {
    if (!scoringIdea) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('ideas')
      .update({
        score,
        current_stage: 'd2_d4_workflow',
        status: 'd2_d4_workflow',
        updated_at: new Date().toISOString(),
      })
      .eq('id', scoringIdea.id);

    setSubmitting(false);

    if (error) {
      toast('error', 'Scoring failed', error.message);
      return;
    }

    refreshIdeas();
    setScoringIdea(null);
    setScore(0);
    toast('success', 'Score saved', `${scoringIdea.project_name} scored ${score}/100 and moved to D2-D4`);
  };

  const getQuadrant = (x: number, y: number) => {
    if (x >= 2.5 && y >= 2.5) return { label: 'Quick Wins', color: 'text-success-400', bg: 'bg-success-500/5' };
    if (x < 2.5 && y >= 2.5) return { label: 'Major Projects', color: 'text-primary-400', bg: 'bg-primary-500/5' };
    if (x >= 2.5 && y < 2.5) return { label: 'Fill-ins', color: 'text-warning-400', bg: 'bg-warning-500/5' };
    return { label: 'Time Sinks', color: 'text-error-400', bg: 'bg-error-500/5' };
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
          { icon: Award, label: 'Average Score', value: stats.avg, suffix: '/100', color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: TrendingUp, label: 'High Score (75+)', value: stats.high, color: 'text-success-400', bg: 'bg-success-500/10' },
          { icon: Minus, label: 'Medium (50-74)', value: stats.medium, color: 'text-warning-400', bg: 'bg-warning-500/10' },
          { icon: ArrowDownRight, label: 'Low (<50)', value: stats.low, color: 'text-error-400', bg: 'bg-error-500/10' },
        ].map((stat, i) => (
          <StaggerItem key={i} index={i}>
            <Card hover>
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-surface-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-white tabular-nums">{stat.value}{stat.suffix}</p>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>

      {/* Impact vs Effort Matrix */}
      <StaggerItem index={0}>
        <Card>
          <CardHeader title="Impact vs Effort Matrix" subtitle="Strategic positioning of ideas based on impact and implementability" icon={Target} />
          <div className="relative h-80 sm:h-96 mt-4">
            {/* Grid background */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1">
              {[
                getQuadrant(1, 3), getQuadrant(3, 3),
                getQuadrant(1, 1), getQuadrant(3, 1),
              ].map((q, i) => (
                <div key={i} className={`${q.bg} rounded-xl border border-surface-200/10 flex items-start justify-end p-3`}>
                  <span className={`text-xs font-medium ${q.color}`}>{q.label}</span>
                </div>
              ))}
            </div>

            {/* Axis labels */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-surface-400 font-medium origin-center whitespace-nowrap">
              Impact →
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-surface-400 font-medium">
              Implementability →
            </div>

            {/* Dots */}
            {matrixData.map((idea) => (
              <div
                key={idea.id}
                className="absolute w-8 h-8 -ml-4 -mt-4 group cursor-pointer transition-transform hover:scale-125 hover:z-10"
                style={{
                  left: `${((idea.x - 0.5) / 3) * 100}%`,
                  top: `${(1 - (idea.y - 0.5) / 3) * 100}%`,
                }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${
                  idea.score >= 75 ? 'bg-success-500' : idea.score >= 50 ? 'bg-primary-500' : 'bg-warning-500'
                }`}>
                  {idea.score}
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-surface-50 border border-surface-200/30 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-large z-20">
                  {idea.project_name}
                </div>
              </div>
            ))}

            {matrixData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-surface-400">No scored ideas yet. Assign impact and effort to ideas to see them here.</p>
              </div>
            )}
          </div>
        </Card>
      </StaggerItem>

      {/* Score Rankings Table */}
      <StaggerItem index={0}>
        <Card padding="none">
          <div className="px-6 py-5 border-b border-surface-200/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-white">Score Rankings</h3>
              <p className="text-sm text-surface-400 mt-0.5">Ideas ranked by score</p>
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
          <div className="overflow-x-auto">
            {filteredIdeas.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200/20">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden sm:table-cell">Impact</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden md:table-cell">Effort</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-surface-400 uppercase tracking-wider hidden lg:table-cell">Status</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200/10">
                  {filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-surface-100/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-500/10 rounded-lg flex items-center justify-center">
                            <span className="text-[10px] font-mono text-primary-400">{idea.project_id.slice(-2)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{idea.project_name}</p>
                            <p className="text-xs text-surface-400 font-mono">{idea.project_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className={`text-xs font-medium capitalize ${
                          idea.estimated_impact === 'high' ? 'text-success-400' :
                          idea.estimated_impact === 'medium' ? 'text-warning-400' : 'text-surface-400'
                        }`}>
                          {idea.estimated_impact || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="text-xs text-surface-400 capitalize">{idea.implementability?.replace(/_/g, ' ') || 'N/A'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-surface-200/20 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                idea.score >= 75 ? 'bg-success-500' : idea.score >= 50 ? 'bg-primary-500' : 'bg-warning-500'
                              }`}
                              style={{ width: `${idea.score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-white tabular-nums">{idea.score}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell"><StatusBadge status={idea.status} size="sm" /></td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setScoringIdea(idea); setScore(idea.score); }}
                          disabled={profile?.role === 'employee'}
                          leftIcon={Calculator}
                        >
                          Score
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState icon={Calculator} title="No ideas found" description="Try adjusting your search" />
            )}
          </div>
        </Card>
      </StaggerItem>

      {/* Scoring Modal */}
      <Modal
        isOpen={!!scoringIdea}
        onClose={() => setScoringIdea(null)}
        title="Score Idea"
        subtitle={scoringIdea?.project_name}
        icon={Calculator}
        footer={
          <>
            <Button variant="ghost" onClick={() => setScoringIdea(null)}>Cancel</Button>
            <Button onClick={handleScore} loading={submitting} leftIcon={Award}>Save Score & Advance</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="p-4 bg-surface-100/30 rounded-xl">
            <p className="text-sm text-surface-400 mb-1">Project ID</p>
            <p className="text-sm font-mono text-primary-400">{scoringIdea?.project_id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-3">Score (0-100)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(parseInt(e.target.value))}
                className="flex-1 accent-primary-500"
              />
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold ${
                score >= 75 ? 'bg-success-500/15 text-success-400' :
                score >= 50 ? 'bg-primary-500/15 text-primary-400' : 'bg-warning-500/15 text-warning-400'
              }`}>
                {score}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-surface-400">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
            <Zap className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <p className="text-xs text-surface-400">
              On save, this idea will advance to <span className="text-primary-400 font-medium">D2-D4 Workflow</span>.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
