import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CloudLightning, ShieldCheck, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GoogleIcon } from './LoginPage';

export const SignupPage: React.FC = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { signInWithGoogle, isAuthenticated } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    if (isSigningIn) return;

    setIsSigningIn(true);
    setErrorMessage('');

    try {
      await signInWithGoogle();
      success('Welcome to CloudGallery!', 'Your account has been created and authenticated.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err.message || 'Unable to sign in. Please try again.';
      setErrorMessage(msg);
      error('Authentication Error', msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div
      id="signup-page"
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

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          New to CloudGallery?
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          Start storing your high-resolution photos on enterprise serverless cloud infrastructure.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Benefits bullets */}
          <div className="space-y-2.5 py-1">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Instant Google Sign-In — no passwords required</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Private S3 bucket storage with automatic thumbnails</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Sub-millisecond metadata indexing via DynamoDB</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-4 pt-2">
            <button
              id="google-signup-btn"
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSigningIn}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-99"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Your photos are securely stored using cloud infrastructure.
            </p>
          </div>

          {/* Already have an account */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                Sign In
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
