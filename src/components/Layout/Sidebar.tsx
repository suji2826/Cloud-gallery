import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Images,
  UploadCloud,
  Heart,
  Settings,
  LogOut,
  Layers,
  CloudLightning,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageStats } from '../../types';
import { formatBytes } from '../../utils/formatters';

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  stats?: StorageStats | null;
  onOpenCloudInspector?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  stats,
  onOpenCloudInspector,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Gallery', path: '/gallery', icon: Images },
    { label: 'Upload Photos', path: '/upload', icon: UploadCloud },
    { label: 'Favorites', path: '/favorites', icon: Heart },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const usedBytes = stats?.totalSizeBytes || 0;
  const quotaBytes = stats?.quotaLimitBytes || 5 * 1024 * 1024 * 1024; // 5 GB default quota
  const percentage = Math.min(100, Math.round((usedBytes / quotaBytes) * 100));

  return (
    <aside
      id="app-sidebar"
      className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shrink-0 z-30 select-none"
    >
      {/* Brand Header */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <CloudLightning className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          CloudGallery
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-800 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mr-3 shrink-0" />
              <span>{item.label}</span>
              {item.path === '/favorites' && stats && stats.favoritesCount > 0 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                  {stats.favoritesCount}
                </span>
              )}
            </NavLink>
          );
        })}

        {/* Cloud Inspector Trigger */}
        <div className="pt-4">
          <button
            type="button"
            onClick={onOpenCloudInspector}
            className="w-full flex items-center px-4 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl transition-colors text-left group cursor-pointer"
          >
            <Layers className="w-5 h-5 mr-3 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs leading-none text-slate-700 dark:text-slate-300">
                Cloud Inspector
              </p>
              <p className="text-[10px] text-slate-400 mt-1">S3 • Lambda • DynamoDB</p>
            </div>
          </button>
        </div>
      </nav>

      {/* Cloud Storage Usage Card & User Profile */}
      <div className="p-4 mt-auto border-t border-slate-100 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl mb-4 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            <span>Storage Used</span>
            <span>{percentage}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">
            {formatBytes(usedBytes)} of {formatBytes(quotaBytes)} used
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center gap-3 p-2 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name || 'User'}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold truncate text-slate-900 dark:text-white">
              {user?.name || 'Cloud User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {user?.email || 'Google Account'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
