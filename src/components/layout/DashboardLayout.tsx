import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { supabase, Idea } from '../../lib/supabase';
import { Modal, Input, Textarea, Button, useToast } from '../ui';
import { Lightbulb, Sparkles } from 'lucide-react';

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Monitor your workflow metrics and track ideas' },
  '/dashboard/ideas': { title: 'Idea Workspace', subtitle: 'Manage and track ideas through the workflow' },
  '/dashboard/projects': { title: 'Project Grid', subtitle: 'View all projects in a visual grid' },
  '/dashboard/analytics': { title: 'Analytics', subtitle: 'Deep insights into your workflow performance' },
  '/dashboard/activity': { title: 'Activity Logs', subtitle: 'Track all actions across the platform' },
  '/dashboard/workflow': { title: 'Workflow Tracker', subtitle: 'Monitor ideas through each workflow stage' },
  '/dashboard/d0-validation': { title: 'D0 Validation', subtitle: 'Validate ideas before they enter scoring' },
  '/dashboard/d1-score': { title: 'D1 Score Matrix', subtitle: 'Score ideas on impact vs effort' },
  '/dashboard/d2-d4': { title: 'D2-D4 Workflow', subtitle: 'Track ideas through development stages' },
  '/dashboard/notifications': { title: 'Notifications', subtitle: 'Stay updated on important events' },
  '/dashboard/settings': { title: 'Settings', subtitle: 'Manage your account and preferences' },
};

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newIdeaModalOpen, setNewIdeaModalOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();

  const meta = pageMeta[location.pathname] || { title: 'Dashboard', subtitle: 'Monitor your workflow metrics' };

  useEffect(() => {
    fetchIdeas();
  }, []);

  const fetchIdeas = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ideas')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setIdeas(data);
    setLoading(false);
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      setFormError('Project name is required');
      return;
    }

    setFormError(null);
    setSubmitting(true);

    const projectId = `PRJ-${Date.now().toString(36).toUpperCase()}`;

    const { error } = await supabase.from('ideas').insert({
      project_id: projectId,
      project_name: projectName,
      description,
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setProjectName('');
    setDescription('');
    setNewIdeaModalOpen(false);
    fetchIdeas();
    toast('success', 'Idea submitted', `${projectId} has been created successfully. Admin has been notified.`);

    // Trigger the email-sender edge function to process the queue immediately
    // The database trigger already queued emails to admins/reviewers + created notifications
    try {
      await supabase.functions.invoke('email-sender', {
        body: { action: 'process_queue' },
      });
    } catch {
      // Email queue processing is best-effort; the cron job will also process it
    }
  };

  return (
    <div className="min-h-screen bg-mesh">
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(true)}
            onNewIdea={() => setNewIdeaModalOpen(true)}
            pageTitle={meta.title}
            pageSubtitle={meta.subtitle}
          />

          <main className="flex-1 overflow-y-auto scrollbar-none">
            <div className="px-4 lg:px-6 py-6 max-w-[1600px] mx-auto">
              <Outlet context={{ ideas, refreshIdeas: fetchIdeas, loading }} />
            </div>
          </main>
        </div>
      </div>

      <Modal
        isOpen={newIdeaModalOpen}
        onClose={() => setNewIdeaModalOpen(false)}
        title="Submit New Idea"
        subtitle="Create a new project idea to enter the workflow"
        icon={Lightbulb}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setNewIdeaModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitIdea} loading={submitting} leftIcon={Sparkles}>
              Submit Idea
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitIdea} className="space-y-4">
          {formError && (
            <div className="p-3 bg-error-500/10 border border-error-500/30 rounded-xl text-error-400 text-sm">
              {formError}
            </div>
          )}
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
            required
            autoFocus
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe your idea..."
          />
        </form>
      </Modal>
    </div>
  );
}
