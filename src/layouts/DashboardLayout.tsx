import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DynamicSidebar, ROLE_LABELS } from '../components/DynamicSidebar.tsx';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from '../components/LanguageSelector.tsx';
import { Bell, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { currentUser, switchPersona } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePersonaSwitch = async (userId: number) => {
    const user = await switchPersona(userId);
    if (user) {
      navigate(getRoleDashboardPath(user.role));
    }
  };

  const role = currentUser?.role || 'FARMER';
  const roleMeta = ROLE_LABELS[role] || { title: role, color: 'text-zinc-700', bg: 'bg-zinc-100 border-zinc-200' };

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans text-zinc-900">
      {/* Dynamic Role-Isolated Sidebar */}
      <DynamicSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-6 hidden md:flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-zinc-400">Workspace /</span>
            <h1 className="text-sm font-bold text-zinc-800 capitalize">
              {location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || 'Overview'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSelector variant="compact" />

            {/* Quick Demo Switcher Pill for reviewer ease */}
            <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl text-xs">
              <span className="text-[11px] font-semibold text-zinc-500 px-2 flex items-center gap-1">
                <UserCheck className="h-3 w-3" /> {t.nav.switchProfile}:
              </span>
              <button
                onClick={() => handlePersonaSwitch(1)}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentUser?.role === 'FARMER'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                }`}
              >
                {t.roles.FARMER}
              </button>
              <button
                onClick={() => handlePersonaSwitch(6)}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentUser?.role === 'BUYER' || currentUser?.role === 'BUSINESS_BUYER'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                }`}
              >
                {t.roles.BUYER}
              </button>
              <button
                onClick={() => handlePersonaSwitch(8)}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                }`}
              >
                {t.nav.logistics}
              </button>
              <button
                onClick={() => handlePersonaSwitch(10)}
                className={`px-2 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  currentUser?.role === 'PLATFORM_ADMIN'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                }`}
              >
                {t.nav.admin}
              </button>
            </div>

            {/* Salvage Exchange Quick Link */}
            <button
              onClick={() => navigate('/salvage')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 text-amber-900 font-bold text-xs hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
              title="B2B Distressed Harvest Salvage Exchange"
            >
              <span className="text-amber-600 font-black">⚡</span>
              <span>Salvage Exchange</span>
            </button>

            {/* Verification Badge */}
            {currentUser?.isVerified && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{t.common.verified}</span>
              </div>
            )}
          </div>
        </header>

        {/* Routed Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
