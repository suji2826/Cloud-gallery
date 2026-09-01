import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Moon,
  Sun,
  Upload,
  Search,
  CloudLightning,
  Sparkles,
  Layers,
  Heart,
  HardDrive,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../UI/Button';

export interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenCloudInspector: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  showSearch?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenCloudInspector,
  searchQuery = '',
  onSearchChange,
  showSearch = false,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      id="app-header"
      className="h-16 sm:h-20 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md gap-4"
    >
      {/* Left: Mobile Menu / Search */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand */}
        <div className="flex md:hidden items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <CloudLightning className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
            CloudGallery
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs sm:max-w-md hidden xs:block">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search your cloud gallery..."
            className="block w-full pl-9 sm:pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl leading-5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 text-xs sm:text-sm transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Serverless Architecture Status Badge */}
        <div
          onClick={onOpenCloudInspector}
          className="hidden sm:flex items-center space-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-full cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors select-none"
          title="Click to view AWS Serverless architecture details"
        >
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>Serverless Architecture: Online</span>
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          aria-label="Toggle Theme"
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* New Upload Button */}
        <button
          type="button"
          onClick={() => navigate('/upload')}
          className="bg-blue-600 text-white px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5 sm:gap-2 active:scale-98 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>New Upload</span>
        </button>
      </div>
    </header>
  );
};
