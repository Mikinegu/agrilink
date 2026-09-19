import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  Tractor,
  Wallet,
  Landmark,
  Sparkles,
  ShoppingBag,
  FileText,
  Package,
  ShieldCheck,
  Truck,
  MapPin,
  CircleDollarSign,
  Boxes,
  Users,
  Building2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { AgriLinkLogo } from './AgriLinkLogo.tsx';
import { UserRole } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { TranslationDictionary } from '../i18n/types.ts';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const getTranslatedSidebarConfig = (t: TranslationDictionary): Record<UserRole, SidebarItem[]> => ({
  FARMER: [
    { label: t.sidebar.farmerOverview, path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.harvestListings, path: '/farmer/listings', icon: Sprout },
    { label: t.sidebar.farmFields, path: '/farmer/farms', icon: Tractor },
    { label: t.sidebar.escrowWallet, path: '/farmer/escrow', icon: Wallet },
    { label: t.sidebar.agriCreditLoans, path: '/farmer/finance', icon: Landmark },
    { label: t.sidebar.aiCropDoctor, path: '/farmer/ai-advisor', icon: Sparkles, badge: 'AI' },
  ],
  BUYER: [
    { label: t.sidebar.buyerOverview, path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.produceMarketplace, path: '/buyer/marketplace', icon: ShoppingBag },
    { label: t.sidebar.buyRequestsRfqs, path: '/buyer/requests', icon: FileText },
    { label: t.sidebar.ordersTracking, path: '/buyer/orders', icon: Package },
    { label: t.sidebar.escrowPayouts, path: '/buyer/escrow', icon: ShieldCheck },
  ],
  BUSINESS_BUYER: [
    { label: t.sidebar.procurementHub, path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.produceMarketplace, path: '/buyer/marketplace', icon: ShoppingBag },
    { label: t.sidebar.contractRequests, path: '/buyer/requests', icon: FileText },
    { label: t.sidebar.activeShipments, path: '/buyer/orders', icon: Package },
    { label: t.sidebar.escrowManager, path: '/buyer/escrow', icon: ShieldCheck },
  ],
  DRIVER: [
    { label: t.sidebar.driverDashboard, path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.availableLoads, path: '/logistics/loadboard', icon: Truck },
    { label: t.sidebar.activeTrips, path: '/logistics/trip', icon: MapPin },
    { label: t.sidebar.tripEarnings, path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  LOGISTICS_ADMIN: [
    { label: t.sidebar.logisticsFleet, path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.loadBoard, path: '/logistics/loadboard', icon: Truck },
    { label: t.sidebar.dispatchTrips, path: '/logistics/trip', icon: MapPin },
    { label: t.sidebar.fleetRevenue, path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  HUB_OPERATOR: [
    { label: t.sidebar.hubOperations, path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.crossDockLoads, path: '/logistics/loadboard', icon: Truck },
    { label: t.sidebar.activeShipments, path: '/logistics/trip', icon: MapPin },
    { label: t.sidebar.settlementLedger, path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  INPUT_SUPPLIER: [
    { label: t.sidebar.supplierDashboard, path: '/supplier/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.inputCatalog, path: '/supplier/products', icon: Boxes },
  ],
  FINANCIAL_INSTITUTION: [
    { label: t.sidebar.creditUnderwriting, path: '/finance/dashboard', icon: LayoutDashboard },
    { label: t.sidebar.loanApplications, path: '/finance/applications', icon: Landmark },
  ],
  PLATFORM_ADMIN: [
    { label: t.sidebar.executiveOverview, path: '/admin/overview', icon: LayoutDashboard },
    { label: t.sidebar.usersKyb, path: '/admin/users', icon: Users },
    { label: t.sidebar.ordersLogistics, path: '/admin/orders', icon: Package },
    { label: t.sidebar.creditAppraisalDesk, path: '/admin/finance', icon: Landmark },
    { label: t.sidebar.produceCatalog, path: '/buyer/marketplace', icon: ShoppingBag },
    { label: t.sidebar.aiMarketRadar, path: '/farmer/ai-advisor', icon: Sparkles, badge: 'AI' },
  ],
});

export const getTranslatedRoleLabels = (t: TranslationDictionary): Record<UserRole, { title: string; color: string; bg: string }> => ({
  FARMER: { title: t.roles.FARMER, color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  BUYER: { title: t.roles.BUYER, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  BUSINESS_BUYER: { title: t.roles.BUSINESS_BUYER, color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  DRIVER: { title: t.roles.DRIVER, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  LOGISTICS_ADMIN: { title: t.roles.LOGISTICS_ADMIN, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  HUB_OPERATOR: { title: t.roles.HUB_OPERATOR, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  INPUT_SUPPLIER: { title: t.roles.INPUT_SUPPLIER, color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  FINANCIAL_INSTITUTION: { title: t.roles.FINANCIAL_INSTITUTION, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  PLATFORM_ADMIN: { title: t.roles.PLATFORM_ADMIN, color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
});

export const SIDEBAR_CONFIG: Record<UserRole, SidebarItem[]> = {
  FARMER: [
    { label: 'Farmer Overview', path: '/farmer/dashboard', icon: LayoutDashboard },
    { label: 'Harvest Listings', path: '/farmer/listings', icon: Sprout },
    { label: 'Farm & Fields', path: '/farmer/farms', icon: Tractor },
    { label: 'Escrow Wallet', path: '/farmer/escrow', icon: Wallet },
    { label: 'Agri-Credit & Loans', path: '/farmer/finance', icon: Landmark },
    { label: 'AI Crop Doctor', path: '/farmer/ai-advisor', icon: Sparkles, badge: 'AI' },
  ],
  BUYER: [
    { label: 'Buyer Overview', path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: 'Produce Marketplace', path: '/buyer/marketplace', icon: ShoppingBag },
    { label: 'Buy Requests (RFQs)', path: '/buyer/requests', icon: FileText },
    { label: 'Orders & Tracking', path: '/buyer/orders', icon: Package },
    { label: 'Escrow & Payouts', path: '/buyer/escrow', icon: ShieldCheck },
  ],
  BUSINESS_BUYER: [
    { label: 'Procurement Hub', path: '/buyer/dashboard', icon: LayoutDashboard },
    { label: 'Produce Marketplace', path: '/buyer/marketplace', icon: ShoppingBag },
    { label: 'Contract Requests', path: '/buyer/requests', icon: FileText },
    { label: 'Active Shipments', path: '/buyer/orders', icon: Package },
    { label: 'Escrow Manager', path: '/buyer/escrow', icon: ShieldCheck },
  ],
  DRIVER: [
    { label: 'Driver Dashboard', path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: 'Available Loads', path: '/logistics/loadboard', icon: Truck },
    { label: 'Active Trips', path: '/logistics/trip', icon: MapPin },
    { label: 'Trip Earnings', path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  LOGISTICS_ADMIN: [
    { label: 'Logistics Fleet', path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: 'Load Board', path: '/logistics/loadboard', icon: Truck },
    { label: 'Dispatch Trips', path: '/logistics/trip', icon: MapPin },
    { label: 'Fleet Revenue', path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  HUB_OPERATOR: [
    { label: 'Hub Operations', path: '/logistics/dashboard', icon: LayoutDashboard },
    { label: 'Cross-Dock Loads', path: '/logistics/loadboard', icon: Truck },
    { label: 'Active Shipments', path: '/logistics/trip', icon: MapPin },
    { label: 'Settlement Ledger', path: '/logistics/earnings', icon: CircleDollarSign },
  ],
  INPUT_SUPPLIER: [
    { label: 'Supplier Dashboard', path: '/supplier/dashboard', icon: LayoutDashboard },
    { label: 'Input Catalog', path: '/supplier/products', icon: Boxes },
  ],
  FINANCIAL_INSTITUTION: [
    { label: 'Credit Underwriting', path: '/finance/dashboard', icon: LayoutDashboard },
    { label: 'Loan Applications', path: '/finance/applications', icon: Landmark },
  ],
  PLATFORM_ADMIN: [
    { label: 'Executive Overview', path: '/admin/overview', icon: LayoutDashboard },
    { label: 'Users & KYB', path: '/admin/users', icon: Users },
    { label: 'Orders & Logistics', path: '/admin/orders', icon: Package },
    { label: 'Credit Appraisal Desk', path: '/admin/finance', icon: Landmark },
    { label: 'Produce Catalog', path: '/buyer/marketplace', icon: ShoppingBag },
    { label: 'AI Market Radar', path: '/farmer/ai-advisor', icon: Sparkles, badge: 'AI' },
  ],
};

export const ROLE_LABELS: Record<UserRole, { title: string; color: string; bg: string }> = {
  FARMER: { title: 'Producer / Farmer', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  BUYER: { title: 'Commercial Buyer', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  BUSINESS_BUYER: { title: 'Enterprise Buyer', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  DRIVER: { title: 'Fleet Driver', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  LOGISTICS_ADMIN: { title: 'Logistics Operator', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  HUB_OPERATOR: { title: 'Hub Logistics', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  INPUT_SUPPLIER: { title: 'Input Supplier', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  FINANCIAL_INSTITUTION: { title: 'Financial Institution', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  PLATFORM_ADMIN: { title: 'Platform Admin', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

export const DynamicSidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!currentUser) return null;

  const role = currentUser.role || 'FARMER';
  const translatedConfig = getTranslatedSidebarConfig(t);
  const translatedRoles = getTranslatedRoleLabels(t);
  const navItems = translatedConfig[role] || translatedConfig.FARMER;
  const roleBadge = translatedRoles[role] || { title: role, color: 'text-zinc-700', bg: 'bg-zinc-100 border-zinc-200' };

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 text-zinc-900 shadow-sm w-72 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
        <NavLink to="/" className="inline-flex">
          <AgriLinkLogo size="sm" theme="light" badgeText="ET" subtext="National B2B Ecosystem" />
        </NavLink>
        {mobileOpen && (
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-500"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Role Indicator Banner */}
      <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/60">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Active Workspace</span>
          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${roleBadge.bg} ${roleBadge.color}`}>
            {roleBadge.title}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`h-4 w-4 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-zinc-400 group-hover:text-emerald-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${
                        isActive ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>


      {/* Salvage Exchange Quick Entry */}
      <div className="px-3 pb-2">
        <NavLink
          to="/salvage"
          className="flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-900 border border-amber-500/30 hover:bg-amber-500/20 transition-all shadow-xs"
        >
          <span className="flex items-center gap-2">
            <span className="text-amber-600 font-black">⚡</span>
            <span>Salvage Exchange</span>
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-600 text-white font-black">
            B2B
          </span>
        </NavLink>
      </div>

      {/* User Card & Sign Out */}
      <div className="p-3 border-t border-zinc-200 bg-zinc-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white border border-zinc-200 shadow-sm">
          <img
            src={
              currentUser.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.fullName
              )}&background=059669&color=fff&bold=true`
            }
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-zinc-900 truncate">{currentUser.fullName}</p>
            <p className="text-[11px] text-zinc-500 truncate">
              {currentUser.organizationName || currentUser.region || 'Ethiopia'}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            title={t.nav.signOut}
            className="p-2 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-xl text-zinc-700 hover:bg-zinc-100 cursor-pointer"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-zinc-900 text-sm">
            <Sprout className="h-4 w-4 text-emerald-600" />
            <span>AgriLink</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg} ${roleBadge.color}`}>
          {roleBadge.title}
        </span>
      </div>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex h-screen sticky top-0 shrink-0 z-20">{sidebarContent}</aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-72 h-full animate-slide-right">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};
