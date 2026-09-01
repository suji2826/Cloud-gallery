import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, LayoutDashboard, Images } from 'lucide-react';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div
      id="not-found-page"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
        404
      </h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-3">
        Page not found
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-8">
        The cloud resource or route you requested could not be located in our routing table.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          leftIcon={<LayoutDashboard className="w-4 h-4" />}
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
        >
          {isAuthenticated ? 'Open Dashboard' : 'Return Home'}
        </Button>
        {isAuthenticated && (
          <Button
            variant="secondary"
            leftIcon={<Images className="w-4 h-4" />}
            onClick={() => navigate('/gallery')}
          >
            Photos Gallery
          </Button>
        )}
      </div>
    </div>
  );
};
