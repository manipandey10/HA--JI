import { useState, FormEvent, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input, Button } from '../components/ui';
import { Mail, Send, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState(false);
  const { resetPassword } = useAuth();

  const emailError = useMemo(() => {
    if (!touched) return null;
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    return null;
  }, [email, touched]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailError) return;

    setError(null);
    setLoading(true);

    const { error } = await resetPassword(email);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    setSuccess(true);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-8 animate-bounce-in">
          <div className="relative inline-flex mb-6">
            <div className="absolute inset-0 bg-success-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 bg-success-500/15 border border-success-500/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
          <p className="text-surface-400 mb-6 max-w-sm mx-auto">
            We've sent password reset instructions to <span className="text-primary-400 font-medium">{email}</span>
          </p>
          <Link to="/login">
            <Button variant="outline" leftIcon={ArrowLeft}>
              Back to Sign In
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-8">
        <Link to="/login" className="inline-flex items-center gap-2 text-surface-400 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-surface-400">Enter your email and we'll send you reset instructions</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-error-500/10 border border-error-500/30 rounded-xl flex items-center gap-2.5 text-error-400 text-sm animate-fade-in-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched(true)}
          error={emailError || undefined}
          leftIcon={Mail}
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
        />

        <Button
          type="submit"
          loading={loading}
          leftIcon={Send}
          className="w-full"
          size="lg"
        >
          Send Reset Link
        </Button>
      </form>
    </AuthLayout>
  );
}
