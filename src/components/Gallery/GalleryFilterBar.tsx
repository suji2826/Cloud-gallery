import React from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Grid2X2,
  Grid3X3,
  LayoutGrid,
  Heart,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { GalleryFilterType, GallerySortOption, GridDensity } from '../../types';

export interface GalleryFilterBarProps {
  filter: GalleryFilterType;
  onFilterChange: (f: GalleryFilterType) => void;
  sort: GallerySortOption;
  onSortChange: (s: GallerySortOption) => void;
  search: string;
  onSearchChange: (s: string) => void;
  density: GridDensity;
  onDensityChange: (d: GridDensity) => void;
  totalResults: number;
}

export const GalleryFilterBar: React.FC<GalleryFilterBarProps> = ({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  search,
  onSearchChange,
  density,
  onDensityChange,
  totalResults,
}) => {
  const filterPills: { id: GalleryFilterType; label: string; icon?: any }[] = [
    { id: 'all', label: 'All Photos' },
    { id: 'recent', label: 'Recent', icon: Clock },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'image/jpeg', label: 'JPEG' },
    { id: 'image/png', label: 'PNG' },
    { id: 'image/webp', label: 'WEBP' },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Top Row: Search Input & Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search photos by title, caption, or tags..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-xs"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort & Grid Density Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 shadow-sm text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value as GallerySortOption)}
              className="bg-transparent text-slate-700 dark:text-slate-300 font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Largest File</option>
              <option value="smallest">Smallest File</option>
              <option value="name-asc">Alphabetical (A–Z)</option>
              <option value="name-desc">Alphabetical (Z–A)</option>
            </select>
          </div>

          {/* Grid Density Toggle */}
          <div className="hidden sm:flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onDensityChange('compact')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                density === 'compact'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Compact Grid"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDensityChange('comfortable')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                density === 'comfortable'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Comfortable Grid"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDensityChange('spacious')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                density === 'spacious'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Spacious Grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Row */}
      <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5">
          {filterPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = filter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => onFilterChange(pill.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                }`}
              >
                {Icon && <Icon className="w-3 h-3" />}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Counter */}
        <span className="text-xs text-slate-400 font-mono shrink-0 whitespace-nowrap">
          {totalResults} {totalResults === 1 ? 'photo' : 'photos'}
        </span>
      </div>
    </div>
  );
};
