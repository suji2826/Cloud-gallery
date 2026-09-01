import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  CloudLightning,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Key,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signInWithGoogle, signInWithEmail, signInWithDemo, isAuthenticated, isConfigured, missingConfigKeys } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const rawFrom = (location.state as any)?.from?.pathname || (location.state as any)?.from;
  const from =
    typeof rawFrom === 'string' &&
    rawFrom.startsWith('/') &&
    !['/login', '/signup', '/forgot-password'].includes(rawFrom)
      ? rawFrom
      : '/dashboard';
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setErrorMessage('');
    setErrorDetails(null);

    try {
      await signInWithGoogle();
      success('Welcome to CloudGallery!', 'Successfully authenticated with Google.');
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Unable to sign in with Google. Please try again.';
      setErrorMessage(msg);
      setErrorDetails(err.details || null);
      error('Authentication Note', msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSigningIn) return;

    setIsSigningIn(true);
    setErrorMessage('');
    try {
      await signInWithEmail(email, password);
      success('Welcome back!', 'Signed in successfully.');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to sign in with email/password.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleDemoSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithDemo('Demo User');
      success('Instant Access Active', 'Logged in as Demo User for testing.');
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to start demo session.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const copyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="login-page"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        {/* Brand Icon & Link */}
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <CloudLightning className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            CloudGallery
          </span>
        </Link>

        {/* Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Welcome to CloudGallery
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          Secure serverless cloud storage for all your photos and memories.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          {/* Missing Configuration Notice */}
          {!isConfigured && missingConfigKeys.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Missing Firebase Environment Variables</span>
              </div>
              <p className="leading-relaxed">
                The following required environment variables are missing from your configuration:
              </p>
              <ul className="list-disc list-inside font-mono text-[11px] space-y-0.5">
                {missingConfigKeys.map((key) => (
                  <li key={key} className="font-bold text-amber-900 dark:text-amber-200">
                    {key}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unauthorized Domain Helper / Firebase Fix Box */}
          {errorDetails?.isDomainError && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-xs text-amber-900 dark:text-amber-200 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-950 dark:text-amber-100">
                <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Firebase Domain Authorization Required</span>
              </div>

              <p className="leading-relaxed">
                Google Sign-In requires your current app domain to be added to Firebase Authorized Domains:
              </p>

              {/* Copy Domain Box */}
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-100/80 dark:bg-amber-900/60 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-amber-200 dark:border-amber-800">
                <span className="truncate flex-1 font-semibold">{currentHostname}</span>
                <button
                  type="button"
                  onClick={copyDomain}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 flex items-center gap-1 text-[10px] font-sans font-bold shadow-xs cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://console.firebase.google.com/project/gallery-881c6/authentication/settings"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <span>Open Firebase Authorized Domains</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-100/50 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-amber-300 dark:border-amber-700 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Instant Test Access (Bypass while adding domain)</span>
                </button>
              </div>
            </div>
          )}

          {/* Operation Not Allowed Helper */}
          {errorDetails?.isOperationNotAllowed && (
            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-blue-950 dark:text-blue-100">
                <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Enable Google Sign-In in Firebase</span>
              </div>
              <p className="leading-relaxed">
                Google provider is currently disabled in your Firebase console for project <strong>gallery-881c6</strong>.
              </p>
              <a
                href="https://console.firebase.google.com/project/gallery-881c6/authentication/providers"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs"
              >
                <span>Enable Google in Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {/* General Error Message */}
          {errorMessage && !errorDetails?.isDomainError && !errorDetails?.isOperationNotAllowed && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Primary Action: Continue with Google */}
          <div className="space-y-4">
            <button
              id="google-signin-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-99"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Signing in with Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Direct authentication via Firebase Google Auth Provider.
            </p>
          </div>

          {/* Optional Direct Demo / Email Access Accordion */}
          <div className="pt-2">
            {!showEmailForm ? (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  type="button"
                  onClick={handleDemoSignIn}
                  className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Quick Test Login</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  Email login
                </button>
              </div>
            ) : (
              <form onSubmit={handleEmailSignIn} className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Firebase Email Login</span>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Hide
                  </button>
                </div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
                <button
                  type="submit"
                  disabled={isSigningIn}
                  className="w-full py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* New to CloudGallery prompt */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to CloudGallery?{' '}
              <Link
                to="/signup"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Learn more & get started
              </Link>
            </p>
          </div>

          {/* Security Guarantee */}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secured with Firebase Auth & AWS Serverless</span>
          </div>
        </div>
      </div>
    </div>
  );
};
