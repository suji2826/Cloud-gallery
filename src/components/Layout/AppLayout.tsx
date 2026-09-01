import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNavigation } from './MobileNavigation';
import { CloudArchitectureModal } from '../CloudInspector/CloudArchitectureModal';
import { StorageStats } from '../../types';
import { photoService } from '../../services/photoService';

export const AppLayout: React.FC = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCloudInspectorOpen, setIsCloudInspectorOpen] = useState(false);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const location = useLocation();

  const fetchStats = async () => {
    try {
      const data = await photoService.getStorageStats();
      setStats(data);
    } catch {
      // Ignored in layout
    }
  };

  useEffect(() => {
    fetchStats();
  }, [location.pathname]);

  return (
    <div id="app-layout-root" className="flex min-h-screen bg-[#F9FAFB] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      {/* Desktop Sidebar */}
      <Sidebar stats={stats} onOpenCloudInspector={() => setIsCloudInspectorOpen(true)} />

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenCloudInspector={() => setIsCloudInspectorOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          onOpenCloudInspector={() => setIsCloudInspectorOpen(true)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshStats: fetchStats }} />
        </main>
        {/* Clean Minimalism Architecture Footer */}
        <footer className="h-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium uppercase tracking-wider shrink-0 select-none">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="truncate">Infrastructure: AWS Lambda • S3 • DynamoDB • CloudFront</span>
          </div>
          <span className="shrink-0 hidden xs:inline">Region: us-east-1 • Node v18.x</span>
        </footer>
      </div>

      {/* Cloud Architecture Inspection Modal */}
      <CloudArchitectureModal
        isOpen={isCloudInspectorOpen}
        onClose={() => setIsCloudInspectorOpen(false)}
      />
    </div>
  );
};
