import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CloudLightning,
  ShieldCheck,
  Zap,
  HardDrive,
  Database,
  Globe,
  ArrowRight,
  Sparkles,
  Lock,
  Search,
  Smartphone,
  CheckCircle2,
  Layers,
  Image,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      title: 'Secure Cloud Storage',
      desc: 'Original photos are stored in private Amazon S3 buckets protected by short-lived pre-signed URLs.',
      icon: Lock,
      badge: 'Amazon S3',
    },
    {
      title: 'Fast Direct S3 Upload',
      desc: 'Browser uploads directly to S3 via pre-signed PUT URLs, eliminating backend server bottlenecks.',
      icon: Zap,
      badge: 'Pre-Signed URLs',
    },
    {
      title: 'Automatic Thumbnails',
      desc: 'S3 ObjectCreated triggers AWS Lambda with Sharp image processing to create lightweight 800px thumbnails.',
      icon: Image,
      badge: 'AWS Lambda + Sharp',
    },
    {
      title: 'Global CDN Delivery',
      desc: 'Optimized thumbnails are cached and delivered through Amazon CloudFront edge nodes worldwide.',
      icon: Globe,
      badge: 'CloudFront CDN',
    },
    {
      title: 'DynamoDB Photo Index',
      desc: 'Sub-millisecond metadata querying, tagging, captioning, and favorite status via DynamoDB single-table design.',
      icon: Database,
      badge: 'Amazon DynamoDB',
    },
    {
      title: 'Multi-Device Access',
      desc: 'Responsive, accessible interface crafted with modern React and Tailwind CSS for mobile, tablet, and desktop.',
      icon: Smartphone,
      badge: 'Responsive PWA',
    },
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-[#F9FAFB] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Navigation Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-6 sm:px-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <CloudLightning className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              CloudGallery
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                Serverless
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Sign In
              </Button>
              <Button variant="primary" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-16 sm:pt-20 sm:pb-24 max-w-6xl mx-auto text-center flex flex-col items-center">
        {/* Subtle Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6">
          <ShieldCheck className="w-4 h-4" />
          <span>Production Serverless Cloud Architecture</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 dark:text-white max-w-3xl leading-[1.15]">
          Your Photos.{' '}
          <span className="text-blue-600 dark:text-blue-400">
            Securely Stored in the Cloud.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Upload, organize, and access your memories from anywhere with CloudGallery. Built with Firebase
          Authentication, S3 Pre-Signed URLs, Lambda thumbnail engines, DynamoDB metadata, and CloudFront.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
          >
            {isAuthenticated ? 'Open My Gallery' : 'Start Free Cloud Gallery'}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            leftIcon={<Layers className="w-4 h-4" />}
            onClick={() => {
              const archElem = document.getElementById('architecture-flow');
              archElem?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore Cloud Architecture
          </Button>
        </div>

        {/* Interactive Architecture Flow Banner */}
        <div
          id="architecture-flow"
          className="mt-14 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                End-to-End Serverless Cloud Pipeline
              </span>
            </div>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active System Flow
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { name: 'React Frontend', desc: 'Pre-Signed PUT', icon: Smartphone, color: 'text-blue-600' },
              { name: 'Firebase Auth', desc: 'Secure ID Tokens', icon: ShieldCheck, color: 'text-emerald-600' },
              { name: 'API Gateway', desc: 'Protected Routes', icon: Zap, color: 'text-amber-500' },
              { name: 'AWS Lambda', desc: 'Sharp Thumbnails', icon: Layers, color: 'text-orange-500' },
              { name: 'Amazon S3', desc: 'Private & Thumbs', icon: HardDrive, color: 'text-blue-700' },
              { name: 'CloudFront CDN', desc: 'Global Edge', icon: Globe, color: 'text-purple-600' },
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-left space-y-1.5"
                >
                  <Icon className={`w-5 h-5 ${node.color}`} />
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {node.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-16 bg-white dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Engineered for Speed, Scale & Privacy
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Modern serverless patterns ensure your photos are securely encrypted, instantaneously
              retrieved, and cost-effective.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 hover:border-blue-300 dark:hover:border-blue-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call To Action */}
      <section className="px-6 py-20 max-w-4xl mx-auto text-center space-y-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Start organizing your photos in the cloud.
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Experience instant direct S3 uploads, automatic thumbnail rendering, and lightning-fast
          DynamoDB search.
        </p>
        <div className="pt-2">
          <Button
            size="lg"
            variant="primary"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/signup')}
          >
            Create Your Account Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-8 px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} CloudGallery. Serverless Cloud Photo Architecture.</p>
      </footer>
    </div>
  );
};
