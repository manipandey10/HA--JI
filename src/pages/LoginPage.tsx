import { useState, FormEvent, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Input, Button } from '../components/ui';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState({ email: false, password: false });
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const emailError = useMemo(() => {
    if (!touched.email) return null;
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
    return null;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return null;
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  }, [password, touched.password]);

  const isFormValid = !emailError && !passwordError && email && password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!isFormValid) return;

    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.');
      } else {
        setError(error.message);
      }
      return;
    }

    navigate('/dashboard');
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome </h2>
        <p className="text-surface-400">Sign in to your account to continue</p>
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
          onBlur={() => setTouched((p) => ({ ...p, email: true }))}
          error={emailError || undefined}
          leftIcon={Mail}
          placeholder="mani@gmail.com"
          autoComplete="email"
          autoFocus
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((p) => ({ ...p, password: true }))}
          error={passwordError || undefined}
          leftIcon={Lock}
          rightIcon={showPassword ? EyeOff : Eye}
          onRightIconClick={() => setShowPassword(!showPassword)}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-surface-200/40 rounded-full peer-checked:bg-primary-500 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-4" />
            </div>
            <span className="text-sm text-surface-400 group-hover:text-surface-600 transition-colors">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          loading={loading}
          leftIcon={LogIn}
          className="w-full"
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-surface-200/20">
        <p className="text-center text-surface-400 text-sm">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
