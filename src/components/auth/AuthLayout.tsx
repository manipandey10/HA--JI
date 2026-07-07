import { Building2, TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';

const features = [
  { icon: TrendingUp, title: 'Workflow Analytics', desc: 'Track ideas from submission to completion with real-time metrics' },
  { icon: Shield, title: 'Enterprise Security', desc: 'Role-based access control and secure data management' },
  { icon: Zap, title: 'Smart Automation', desc: 'Automated scoring, validation, and approval workflows' },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-mesh">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-surface-50/20 to-secondary-900/30" />
        <div className="absolute inset-0 bg-dot-pattern opacity-30" />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-blue">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">TSDPL BI</h1>
              <p className="text-surface-400 text-xs">Corporate Workflow</p>
            </div>
          </div>

          {/* Hero content */}
          <div className="max-w-md">
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4 text-balance">
              Transform ideas into <span className="gradient-text">Measurable impact</span>
            </h2>
            <p className="text-surface-400 text-lg leading-relaxed mb-8">
              REPRESENTED BY MRPWORLD
            </p>

            <div className="space-y-5">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + i * 0.1}s`, animationFillMode: 'both' }}
                >
                  <div className="w-10 h-10 rounded-xl bg-surface-100/40 border border-surface-200/30 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-sm">{f.title}</h3>
                    <p className="text-surface-400 text-sm mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-surface-500 text-sm">
            <span>© 2024 TSDPL BI</span>
            <span className="w-1 h-1 rounded-full bg-surface-500" />
            <span>All rights reserved</span>
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Mobile logo */}
        <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-glow-blue">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">TSDPL BI</h1>
            <p className="text-surface-400 text-xs">Corporate Workflow</p>
          </div>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          {children}

       
        </div>
      </div>
    </div>
  );
}
