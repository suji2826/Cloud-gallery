import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/UI/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
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
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          variant="primary"
          leftIcon={<Home className="w-4 h-4" />}
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </div>
    </div>
  );
};
