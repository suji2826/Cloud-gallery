import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Layers,
  Key,
} from 'lucide-react';
import { Button } from '../components/UI/Button';
import { CloudBadge } from '../components/UI/CloudBadge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { photoService } from '../services/photoService';
import { StorageStats, CloudArchitectureStatus } from '../types';
import { formatDate } from '../utils/formatters';
import { AWS_CONFIG } from '../config/aws-config';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [, setStats] = useState<StorageStats | null>(null);
  const [, setCloudStatus] = useState<CloudArchitectureStatus | null>(null);

  useEffect(() => {
    photoService.getStorageStats().then(setStats).catch(() => {});
    photoService.getCloudStatus().then(setCloudStatus).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div id="profile-page" className="max-w-4xl mx-auto space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Account & Cloud Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your profile, theme preferences, and review serverless AWS resource mappings.
        </p>
      </div>

      {/* User Information Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-4">
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name || 'User'}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-2xl object-cover shadow-md border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {user?.name || 'Cloud User'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <CloudBadge type="firebase" size="md" />
        </div>

        {/* Account Details Specs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-500" />
              <span>Firebase UID</span>
            </span>
            <p className="font-mono font-bold text-slate-900 dark:text-slate-100 truncate">
              {user?.id || '—'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <span className="text-slate-400 font-medium">Member Since</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              {user?.createdAt ? formatDate(user.createdAt) : 'August 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* Theme Preference Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Appearance & Theme
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Choose your interface theme preference.
        </p>

        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Monitor },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTheme(item.id as any)}
                className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* AWS Cloud Configuration Overview */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Cloud Infrastructure Mapping
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            {AWS_CONFIG.region}
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Auth Provider</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">Firebase Authentication (Google)</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Originals S3 Bucket</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{AWS_CONFIG.s3.originalsBucket}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Thumbnails S3 Bucket</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{AWS_CONFIG.s3.thumbnailsBucket}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">DynamoDB Metadata Table</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{AWS_CONFIG.dynamodb.tableName}</span>
          </div>
          <div className="py-2.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 font-medium">CloudFront Distribution</span>
            <span className="font-mono text-slate-800 dark:text-slate-200">{AWS_CONFIG.cloudFront.distributionDomain}</span>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="p-6 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Logout</h4>
          <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
            Terminate your active session and return to the login screen.
          </p>
        </div>
        <Button
          variant="danger"
          size="md"
          leftIcon={<LogOut className="w-4 h-4" />}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
