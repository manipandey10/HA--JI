import { useState, FormEvent, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input, Button } from '../components/ui';
import { Mail, Lock, User, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { label: 'Too weak', color: 'bg-error-500' },
    { label: 'Weak', color: 'bg-error-500' },
    { label: 'Fair', color: 'bg-warning-500' },
    { label: 'Good', color: 'bg-primary-500' },
    { label: 'Strong', color: 'bg-success-500' },
    { label: 'Very strong', color: 'bg-success-500' },
  ];

  return { score, ...levels[Math.min(score, 5)] };
}

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({ fullName: false, email: false, password: false, confirmPassword: false });
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const errors = useMemo(() => {
    const e: Record<string, string | null> = {};
    if (touched.fullName && !fullName) e.fullName = 'Full name is required';
    if (touched.fullName && fullName && fullName.length < 2) e.fullName = 'Name must be at least 2 characters';
    if (touched.email && !email) e.email = 'Email is required';
    if (touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address';
    if (touched.password && !password) e.password = 'Password is required';
    if (touched.password && password && password.length < 6) e.password = 'Password must be at least 6 characters';
    if (touched.confirmPassword && !confirmPassword) e.confirmPassword = 'Please confirm your password';
    if (touched.confirmPassword && confirmPassword && password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    return e;
  }, [fullName, email, password, confirmPassword, touched]);

  const strength = getPasswordStrength(password);
  const isFormValid = !Object.values(errors).some(Boolean) && fullName && email && password && confirmPassword === password && acceptTerms;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setLoading(false);
      if (error.message.includes('already registered')) {
        setError('An account with this email already exists');
      } else {
        setError(error.message);
      }
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => navigate('/login'), 2500);
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
          <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
          <p className="text-surface-400 mb-6">Your account has been created successfully. Redirecting to login...</p>
          <div className="w-32 h-1 bg-surface-200/30 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full animate-[shimmer_2s_ease-in-out_infinite]" style={{ width: '100%' }} />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create account</h2>
        <p className="text-surface-400">Join the TSDPL BI workflow platform</p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-error-500/10 border border-error-500/30 rounded-xl flex items-center gap-2.5 text-error-400 text-sm animate-fade-in-up">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
          error={errors.fullName || undefined}
          leftIcon={User}
          placeholder="mrp"
          autoComplete="name"
          autoFocus
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          error={errors.email || undefined}
          leftIcon={Mail}
          placeholder="mani@gmail.com"
          autoComplete="email"
        />

        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((p) => ({ ...p, password: true }))}
            error={errors.password || undefined}
            leftIcon={Lock}
            rightIcon={showPassword ? EyeOff : Eye}
            onRightIconClick={() => setShowPassword(!showPassword)}
            placeholder="Create a password"
            autoComplete="new-password"
          />
          {password && !errors.password && (
            <div className="mt-2.5 animate-fade-in">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                      i < strength.score ? strength.color : 'bg-surface-200/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-surface-400 mt-1.5">Password strength: <span className="font-medium text-surface-600">{strength.label}</span></p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
          error={errors.confirmPassword || undefined}
          leftIcon={Lock}
          placeholder="Confirm your password"
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2.5 cursor-pointer group pt-1">
          <div className="relative mt-0.5">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 bg-surface-100/50 border border-surface-200/50 rounded-md peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-colors flex items-center justify-center">
              {acceptTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          <span className="text-sm text-surface-400 group-hover:text-surface-600 transition-colors">
            I agree to the{' '}
            <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-primary-400 hover:text-primary-300 cursor-pointer">Privacy Policy</span>
          </span>
        </label>

        <Button
          type="submit"
          loading={loading}
          leftIcon={UserPlus}
          className="w-full"
          size="lg"
          disabled={!isFormValid}
        >
          Create Account
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-surface-200/20">
        <p className="text-center text-surface-400 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
