import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  User,
  Bell,
  Shield,
  Mail,
  Save,
  Check,
  Send,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Lock,
  Smartphone,
} from 'lucide-react';
import { Card, CardHeader, Input, Button, useToast, StaggerItem } from '../../components/ui';

type Tab = 'profile' | 'notifications' | 'security' | 'email';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'email', label: 'Email System', icon: Mail },
];

interface EmailQueueItem {
  id: string;
  to_email: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [department, setDepartment] = useState(profile?.department || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  const [ideaSubmitted, setIdeaSubmitted] = useState(true);
  const [workflowUpdate, setWorkflowUpdate] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const [emailQueue, setEmailQueue] = useState<EmailQueueItem[]>([]);
  const [emailStats, setEmailStats] = useState({ pending: 0, sent: 0, failed: 0 });
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [processingQueue, setProcessingQueue] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setDepartment(profile.department || '');
    }
  }, [profile]);

  useEffect(() => {
    fetchEmailQueue();
  }, []);

  const fetchEmailQueue = async () => {
    const { data } = await supabase.from('email_queue').select('*').order('created_at', { ascending: false }).limit(20);
    if (data) {
      setEmailQueue(data as EmailQueueItem[]);
      setEmailStats({
        pending: (data as EmailQueueItem[]).filter(e => e.status === 'pending').length,
        sent: (data as EmailQueueItem[]).filter(e => e.status === 'sent').length,
        failed: (data as EmailQueueItem[]).filter(e => e.status === 'failed').length,
      });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, department, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      toast('error', 'Save failed', error.message);
      return;
    }

    setSaved(true);
    toast('success', 'Profile updated', 'Your changes have been saved');
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      toast('error', 'Email required', 'Please enter an email address');
      return;
    }

    setSendingTest(true);
    const { error } = await supabase.functions.invoke('email-sender', {
      body: { to: testEmail, subject: 'TSDPL BI - Test Email', message: 'This is a test email from TSDPL BI Portal.' },
    });

    setSendingTest(false);

    if (error) {
      toast('error', 'Send failed', error.message);
      return;
    }

    setTestEmail('');
    toast('success', 'Test email sent', `Email sent to ${testEmail}`);
    fetchEmailQueue();
  };

  const handleProcessQueue = async () => {
    setProcessingQueue(true);
    const { error } = await supabase.functions.invoke('send-notification', {
      body: { action: 'process_queue' },
    });

    setProcessingQueue(false);

    if (error) {
      toast('error', 'Processing failed', error.message);
      return;
    }

    toast('success', 'Queue processed', 'Email queue has been processed');
    fetchEmailQueue();
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0" style={{ backgroundColor: checked ? '#3b82f6' : '#33415580' }}>
      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Settings</h2>
        <p className="text-sm text-surface-400 mt-1">Manage your account and platform preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto scrollbar-none bg-surface-100/30 border border-surface-200/20 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary-500/15 text-primary-400'
                : 'text-surface-400 hover:text-white hover:bg-surface-100/40'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <StaggerItem index={0}>
          <Card>
            <CardHeader title="Profile Information" subtitle="Update your personal details" icon={User} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} leftIcon={User} />
              <Input label="Email Address" value={user?.email || ''} disabled leftIcon={Mail} className="opacity-60" />
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Engineering" />
              <div>
                <label className="block text-sm font-medium text-surface-600 mb-2">Role</label>
                <div className="px-4 py-2.5 bg-surface-100/30 border border-surface-200/30 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary-400" />
                  <span className="text-sm text-white capitalize">{profile?.role || 'employee'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-6">
              <Button onClick={handleSaveProfile} loading={saving} leftIcon={Save}>
                Save Changes
              </Button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-success-400 animate-fade-in-up">
                  <Check className="w-4 h-4" />
                  Saved!
                </span>
              )}
            </div>
          </Card>
        </StaggerItem>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <StaggerItem index={0}>
            <Card>
              <CardHeader title="Notification Preferences" subtitle="Choose how you want to be notified" icon={Bell} />
              <div className="space-y-1">
                {[
                  { icon: Mail, title: 'Email Notifications', desc: 'Receive notifications via email', checked: emailNotifications, onChange: () => setEmailNotifications(!emailNotifications) },
                  { icon: Smartphone, title: 'Browser Notifications', desc: 'Show notifications in your browser', checked: browserNotifications, onChange: () => setBrowserNotifications(!browserNotifications) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-surface-200/10 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface-100/40 rounded-xl flex items-center justify-center">
                        <item.icon className="w-5 h-5 text-surface-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{item.title}</p>
                        <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <Toggle checked={item.checked} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem index={1}>
            <Card>
              <CardHeader title="Notification Types" subtitle="Select which events trigger notifications" icon={Zap} />
              <div className="space-y-1">
                {[
                  { title: 'Idea Submitted', desc: 'When a new idea is submitted', checked: ideaSubmitted, onChange: () => setIdeaSubmitted(!ideaSubmitted) },
                  { title: 'Workflow Updates', desc: 'When an idea moves to a new stage', checked: workflowUpdate, onChange: () => setWorkflowUpdate(!workflowUpdate) },
                  { title: 'Weekly Digest', desc: 'Summary of activity every week', checked: weeklyDigest, onChange: () => setWeeklyDigest(!weeklyDigest) },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-4 border-b border-surface-200/10 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{item.title}</p>
                      <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle checked={item.checked} onChange={item.onChange} />
                  </div>
                ))}
              </div>
            </Card>
          </StaggerItem>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <StaggerItem index={0}>
            <Card>
              <CardHeader title="Password" subtitle="Manage your account password" icon={Lock} />
              <div className="space-y-4 max-w-md">
                <Input label="Current Password" type="password" leftIcon={Lock} placeholder="Enter current password" />
                <Input label="New Password" type="password" leftIcon={Lock} placeholder="Enter new password" />
                <Input label="Confirm Password" type="password" leftIcon={Lock} placeholder="Confirm new password" />
                <Button leftIcon={Shield}>Update Password</Button>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem index={1}>
            <Card>
              <CardHeader title="Two-Factor Authentication" subtitle="Add an extra layer of security" icon={Smartphone} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-100/40 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-surface-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Authenticator App</p>
                    <p className="text-xs text-surface-400 mt-0.5">Use an authenticator app for verification codes</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
            </Card>
          </StaggerItem>
        </div>
      )}

      {/* Email System Tab */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          <StaggerItem index={0}>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Clock, label: 'Pending', value: emailStats.pending, color: 'text-warning-400', bg: 'bg-warning-500/10' },
                { icon: CheckCircle2, label: 'Sent', value: emailStats.sent, color: 'text-success-400', bg: 'bg-success-500/10' },
                { icon: XCircle, label: 'Failed', value: emailStats.failed, color: 'text-error-400', bg: 'bg-error-500/10' },
              ].map((stat, i) => (
                <Card key={i} hover>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-surface-400">{stat.label}</p>
                      <p className="text-xl font-bold text-white tabular-nums">{stat.value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </StaggerItem>

          <StaggerItem index={1}>
            <Card>
              <CardHeader title="Send Test Email" subtitle="Verify email delivery" icon={Send} />
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  leftIcon={Mail}
                  placeholder="recipient@company.com"
                  className="flex-1"
                />
                <Button onClick={handleSendTestEmail} loading={sendingTest} leftIcon={Send}>
                  Send Test
                </Button>
              </div>
            </Card>
          </StaggerItem>

          <StaggerItem index={2}>
            <Card>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-white">Email Queue</h3>
                  <p className="text-sm text-surface-400 mt-0.5">Recent emails in the processing queue</p>
                </div>
                <Button variant="outline" onClick={handleProcessQueue} loading={processingQueue} leftIcon={Loader2}>
                  Process Queue
                </Button>
              </div>
              <div className="space-y-2">
                {emailQueue.length > 0 ? (
                  emailQueue.map((email) => (
                    <div key={email.id} className="flex items-center gap-3 p-3 bg-surface-100/30 rounded-xl hover:bg-surface-100/50 transition-colors">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        email.status === 'sent' ? 'bg-success-500/10' :
                        email.status === 'failed' ? 'bg-error-500/10' : 'bg-warning-500/10'
                      }`}>
                        {email.status === 'sent' ? <CheckCircle2 className="w-4 h-4 text-success-400" /> :
                         email.status === 'failed' ? <XCircle className="w-4 h-4 text-error-400" /> :
                         <Clock className="w-4 h-4 text-warning-400" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{email.subject}</p>
                        <p className="text-xs text-surface-400 truncate">To: {email.to_email}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-md capitalize ${
                        email.status === 'sent' ? 'bg-success-500/10 text-success-400' :
                        email.status === 'failed' ? 'bg-error-500/10 text-error-400' : 'bg-warning-500/10 text-warning-400'
                      }`}>
                        {email.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-surface-400 text-center py-8">No emails in queue</p>
                )}
              </div>
            </Card>
          </StaggerItem>
        </div>
      )}
    </div>
  );
}
