import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DynamicSidebar, ROLE_LABELS } from '../components/DynamicSidebar.tsx';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from '../components/LanguageSelector.tsx';
import { Bell, ShieldCheck, RefreshCw, UserCheck } from 'lucide-react';
import { CommodityTickerBar } from '../components/CommodityTickerBar.tsx';

export const DashboardLayout: React.FC = () => {
  const { currentUser, switchPersona } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handlePersonaSwitch = async (userId: number | string) => {
    const user = await switchPersona(userId);
    if (user) {
      navigate(getRoleDashboardPath(user.role));
    }
  };

  const role = currentUser?.role || 'FARMER';
  const roleMeta = ROLE_LABELS[role] || { title: role, color: 'text-zinc-700', bg: 'bg-zinc-100 border-zinc-200' };

  return (
    <div className={`flex min-h-screen font-sans text-zinc-900 ${
      role === 'FARMER'
        ? 'bg-gradient-to-br from-emerald-50/40 via-stone-50 to-amber-50/20'
        : 'bg-zinc-50'
    }`}>
      {/* Dynamic Role-Isolated Sidebar */}
      <DynamicSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-6 hidden md:flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200/60 text-zinc-500 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                {t.sidebar.farmerOverview.split(' ')[1] ? (t.common.actions === 'እርምጃዎች' ? 'የስራ ቦታ' : t.common.actions === 'Tarkaanfiiwwan' ? 'Bakka Hojii' : 'Workspace') : 'Workspace'}
              </span>
            </div>
            <span className="text-zinc-300">/</span>
            <h1 className="text-sm font-black text-zinc-900 capitalize tracking-tight flex items-center gap-2">
              {location.pathname.split('/').filter(Boolean).slice(-1)[0]?.replace(/-/g, ' ') || t.common.details}
            </h1>

            {/* Live Database Sync Indicator */}
            <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-semibold ml-2 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 beacon-pulse shrink-0" />
              <span>PostgreSQL Cluster: Addis Node (0.04s)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSelector variant="compact" />

            {/* Classified Role Indicator (Switcher only for PLATFORM_ADMIN) */}
            {currentUser?.role === 'PLATFORM_ADMIN' ? (
              <div className="flex items-center gap-1 bg-zinc-100/90 border border-zinc-200/60 p-1 rounded-xl text-xs shadow-2xs">
                <span className="text-[11px] font-semibold text-zinc-500 px-2 flex items-center gap-1">
                  <UserCheck className="h-3.5 w-3.5 text-zinc-500" /> Admin Switcher:
                </span>
                <button
                  onClick={() => handlePersonaSwitch(1)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'FARMER' ? 'bg-emerald-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  {t.roles.FARMER}
                </button>
                <button
                  onClick={() => handlePersonaSwitch(6)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'BUYER' || role === 'BUSINESS_BUYER' ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  {t.roles.BUYER}
                </button>
                <button
                  onClick={() => handlePersonaSwitch(8)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'DRIVER' || role === 'LOGISTICS_ADMIN' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  {t.nav.logistics}
                </button>
                <button
                  onClick={() => handlePersonaSwitch('INPUT_SUPPLIER')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'INPUT_SUPPLIER' || (role as string) === 'BUSINESS_AGENT'
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  Business Agent
                </button>
                <button
                  onClick={() => handlePersonaSwitch('FINANCIAL_INSTITUTION')}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'FINANCIAL_INSTITUTION'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  Bank / Finance
                </button>
                <button
                  onClick={() => handlePersonaSwitch(10)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                    role === 'PLATFORM_ADMIN' ? 'bg-rose-600 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-950 hover:bg-white'
                  }`}
                >
                  {t.nav.admin}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-100 border border-zinc-200/80 text-xs font-bold text-zinc-700 shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-zinc-400 font-medium">
                  {t.common.actions === 'እርምጃዎች' ? 'የተመደበ የስራ መስክ' : t.common.actions === 'Tarkaanfiiwwan' ? 'Gareen Ramadame' : 'Classified'}:
                </span>
                <span className={roleMeta.color}>{roleMeta.title}</span>
              </div>
            )}

            {/* Salvage Exchange Quick Link */}
            <button
              onClick={() => navigate('/salvage')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/30 text-amber-900 font-extrabold text-xs hover:bg-amber-500/20 transition-all cursor-pointer shadow-xs"
              title={t.modalsAndCheckout.salvageTitle}
            >
              <span className="text-amber-600 font-black">⚡</span>
              <span>{t.modalsAndCheckout.salvageBadge}</span>
            </button>

            {/* Verification Badge */}
            {currentUser?.isVerified && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>{t.common.verified}</span>
              </div>
            )}
          </div>
        </header>

        {/* Live Ethiopian Commodity Ticker & Converter Bar */}
        <CommodityTickerBar variant="dark" />

        {/* Routed Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
