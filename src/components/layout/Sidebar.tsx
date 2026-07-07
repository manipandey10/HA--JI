import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Lightbulb,
  Grid3X3,
  BarChart3,
  Activity,
  GitBranch,
  CheckCircle2,
  Calculator,
  Workflow,
  Mail,
  Settings,
  ChevronDown,
  Building2,
  X,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Lightbulb, label: 'Idea Workspace', path: '/dashboard/ideas' },
  { icon: Grid3X3, label: 'Project Grid', path: '/dashboard/projects' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Activity, label: 'Activity Logs', path: '/dashboard/activity' },
  { icon: Workflow, label: 'Workflow Tracker', path: '/dashboard/workflow' },
];

const workflowItems: NavItem[] = [
  { icon: CheckCircle2, label: 'D0 Validation', path: '/dashboard/d0-validation' },
  { icon: Calculator, label: 'D1 Score Matrix', path: '/dashboard/d1-score' },
  { icon: GitBranch, label: 'D2-D4 Workflow', path: '/dashboard/d2-d4' },
];

const teamItems: NavItem[] = [
  { icon: Mail, label: 'Notifications', path: '/dashboard/notifications' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

function NavSection({ title, items, defaultExpanded = true }: { title: string; items: NavItem[]; defaultExpanded?: boolean }) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-surface-400 uppercase tracking-wider hover:text-surface-600 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ease-smooth ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
        <nav className="space-y-0.5 pb-2">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500/10 text-primary-400'
                    : 'text-surface-400 hover:text-white hover:bg-surface-100/40'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary-500 to-secondary-500 rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-[18px] h-[18px] transition-colors ${
                      isActive ? 'text-primary-400' : 'text-surface-400 group-hover:text-surface-600'
                    }`}
                  />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-500/20 text-primary-400 rounded-md">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-surface-0/80 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-surface-50/80 backdrop-blur-2xl border-r border-surface-200/20 z-50 transform transition-transform duration-300 ease-smooth lg:translate-x-0 lg:static lg:z-auto flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-200/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-blue">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight">TSDPL BI</h1>
              <p className="text-surface-400 text-[11px]">Corporate Workflow</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-surface-400 hover:text-white hover:bg-surface-100/60 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-none px-3 py-4">
          <NavSection title="Workplace" items={navItems} />
          <NavSection title="Workflow Tools" items={workflowItems} />
          <NavSection title="Team & Admin" items={teamItems} defaultExpanded={false} />
        </div>

        {/* Upgrade card */}
        <div className="px-3 pb-3">
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-500/10 to-secondary-500/10 border border-primary-500/20 p-4">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary-500/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary-400" />
                <span className="text-xs font-semibold text-white">Pro Tip</span>
              </div>
              <p className="text-[11px] text-surface-400 leading-relaxed mb-3">
                Use keyboard shortcuts to navigate faster. Press <kbd className="px-1 py-0.5 bg-surface-100/60 rounded text-[10px] font-mono">⌘K</kbd> to search.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-surface-200/20">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-2 h-2 bg-success-400 rounded-full" />
              <div className="absolute inset-0 w-2 h-2 bg-success-400 rounded-full animate-pulse-ring" />
            </div>
            <span className="text-xs text-surface-400">All systems operational</span>
          </div>
        </div>
      </aside>
    </>
  );
}
