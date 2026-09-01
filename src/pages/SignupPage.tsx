import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CloudLightning, Lock, Mail, User, ArrowRight, ShieldCheck, Check, X } from 'lucide-react';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SignupPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { signUp } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Password strength calculations
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  const strengthScore = [hasMinLength, hasNumber, hasSpecial, hasUppercase].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!hasMinLength) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await signUp({ name, email, password });
      success('Account created!', 'Welcome to CloudGallery. Your Cognito session is active.');
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Sign up failed. Please try again.';
      setErrorMsg(msg);
      error('Sign Up Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="signup-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <CloudLightning className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            CloudGallery
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Create your cloud account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 space-y-5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Morgan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Password Strength:
                  </span>
                  <span
                    className={`font-bold ${
                      strengthScore <= 1
                        ? 'text-rose-500'
                        : strengthScore <= 3
                        ? 'text-amber-500'
                        : 'text-emerald-500'
                    }`}
                  >
                    {strengthScore <= 1 ? 'Weak' : strengthScore <= 3 ? 'Medium' : 'Strong'}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-300 ${
                        step <= strengthScore
                          ? strengthScore <= 1
                            ? 'bg-rose-500'
                            : strengthScore <= 3
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                          : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] text-slate-500">
                  <span className={hasMinLength ? 'text-emerald-500' : ''}>
                    {hasMinLength ? '✓' : '•'} 8+ characters
                  </span>
                  <span className={hasUppercase ? 'text-emerald-500' : ''}>
                    {hasUppercase ? '✓' : '•'} Uppercase letter
                  </span>
                  <span className={hasNumber ? 'text-emerald-500' : ''}>
                    {hasNumber ? '✓' : '•'} Number
                  </span>
                  <span className={hasSpecial ? 'text-emerald-500' : ''}>
                    {hasSpecial ? '✓' : '•'} Special symbol
                  </span>
                </div>
              </div>
            )}

            <Input
              label="Confirm Password"
              type="password"
              showPasswordToggle
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              error={
                confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined
              }
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </form>

          {/* Security Guarantee */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Encrypted with AWS Cognito User Pools</span>
          </div>
        </div>
      </div>
    </div>
  );
};
