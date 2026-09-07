import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sprout, ArrowLeft, Home, Compass } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const NotFoundPage: React.FC = () => {
  const { currentUser, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();

  const homePath = currentUser ? getRoleDashboardPath(currentUser.role) : '/';

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6 shadow-sm">
        <Sprout className="h-8 w-8" />
      </div>

      <span className="text-xs font-black tracking-widest uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-3">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight mb-3">
        Field Out of Range
      </h1>

      <p className="text-sm text-zinc-500 max-w-md mb-8 leading-relaxed">
        The route or agricultural resource you are looking for has moved, is restricted by role security, or does not exist.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700 font-bold text-sm shadow-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Go Back</span>
        </button>

        <Link
          to={homePath}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all hover:scale-102 cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>{currentUser ? 'Return to Workspace' : 'Return to Home'}</span>
        </Link>
      </div>
    </div>
  );
};
