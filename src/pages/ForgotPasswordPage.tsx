import React from 'react';
import { Link } from 'react-router-dom';
import { CloudLightning, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { GoogleIcon } from './LoginPage';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <div
      id="forgot-password-page"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8"
    >
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
            <CloudLightning className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-900 dark:text-white">
            CloudGallery
          </span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Access & Security
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
          CloudGallery uses Google Sign-In for seamless, passwordless authentication.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-sm rounded-2xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                Because your account is authenticated directly via Google, you do not need a separate password for CloudGallery.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                If you are having trouble accessing your Google Account, please visit the Google Account Recovery page at accounts.google.com.
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full h-12 flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs bg-white dark:bg-slate-800 text-sm font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-all cursor-pointer"
            >
              <GoogleIcon className="w-5 h-5 shrink-0" />
              <span>Continue with Google</span>
            </button>

            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Protected by Google & Firebase Security</span>
          </div>
        </div>
      </div>
    </div>
  );
};
