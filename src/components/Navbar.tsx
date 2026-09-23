import React, { useState, useEffect } from 'react';
import { AgriLinkLogo } from './AgriLinkLogo.tsx';
import {
  ShoppingCart,
  Bell,
  ChevronDown,
  Globe,
  Truck,
  Building2,
  Landmark,
  ShieldCheck,
  Menu,
  X,
  Phone,
  UserPlus,
  ArrowUpRight,
  Sprout,
  Store,
  Layers,
  Eye,
  CheckCircle2,
  LogIn,
  Users,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { User, UserRole } from '../types/index.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';

interface NavbarProps {
  currentUser: User | null;
  allUsers: User[];
  onSwitchUser: (userId: number) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  unreadNotifsCount: number;
  onOpenNotifs: () => void;
  onOpenRegister?: () => void;
  onOpenBrandModal?: () => void;
  onOpenAuthModal?: () => void;
  onLogoutToGuest?: () => void;
  onOpenCallCenter?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  setActiveTab,
  cartItemCount,
  onOpenCart,
  unreadNotifsCount,
  onOpenNotifs,
  onOpenRegister,
  onOpenBrandModal,
  onOpenAuthModal,
  onLogoutToGuest,
  onOpenCallCenter,
}) => {
  const { t } = useTranslation();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);

  // Smart Hide on Scroll Down / Reveal on Scroll Up
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 15);

      if (currentScrollY > lastScrollY && currentScrollY > 60) {
        // User scrolling down -> smoothly hide top header
        setIsVisible(false);
        setRoleDropdownOpen(false);
        setMoreDropdownOpen(false);
      } else if (currentScrollY < lastScrollY) {
        // User scrolling up -> smoothly reveal header
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'FARMER':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'BUSINESS_BUYER':
      case 'BUYER':
        return 'bg-blue-50 text-blue-800 border-blue-300';
      case 'INPUT_SUPPLIER':
      case 'BUSINESS_AGENT':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'DRIVER':
      case 'LOGISTICS_ADMIN':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      case 'FINANCIAL_INSTITUTION':
        return 'bg-teal-50 text-teal-800 border-teal-300';
      case 'HUB_OPERATOR':
        return 'bg-orange-50 text-orange-800 border-orange-300';
      case 'PLATFORM_ADMIN':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-300';
    }
  };

  // ── Role-isolated navigation ──────────────────────────────────────────────
  // Each role sees ONLY the tabs relevant to their workflow. Zero cross-role leakage.
  const role = currentUser?.role;

  const ALL_NAV: Record<string, { id: string; label: string; isAi?: boolean }[]> = {
    FARMER: [
      { id: 'farmer-dashboard', label: t.sidebar.farmerOverview },
      { id: 'farmer-listings',  label: t.sidebar.harvestListings },
      { id: 'farmer-farms',     label: t.sidebar.farmFields },
      { id: 'farmer-escrow',    label: t.sidebar.escrowWallet },
      { id: 'farmer-finance',   label: t.sidebar.agriCreditLoans },
    ],
    BUYER: [
      { id: 'buyer-dashboard',   label: t.sidebar.buyerOverview },
      { id: 'marketplace',       label: t.nav.marketplace },
      { id: 'procurement',       label: t.sidebar.buyRequestsRfqs },
      { id: 'buyer-orders',      label: t.sidebar.ordersTracking },
      { id: 'buyer-escrow',      label: t.sidebar.escrowManager },
    ],
    BUSINESS_BUYER: [
      { id: 'buyer-dashboard',   label: t.sidebar.procurementHub },
      { id: 'marketplace',       label: t.nav.marketplace },
      { id: 'procurement',       label: t.sidebar.contractRequests },
      { id: 'buyer-orders',      label: t.sidebar.activeShipments },
      { id: 'buyer-escrow',      label: t.sidebar.escrowManager },
    ],
    INPUT_SUPPLIER: [
      { id: 'supplier-dashboard', label: 'Business Agent (Seeds & Inputs)' },
      { id: 'seeds',              label: 'Certified Seeds' },
      { id: 'supplies',           label: 'Fertilizers & Tech' },
      { id: 'orders',             label: 'Co-op Requests' },
      { id: 'calculator',         label: 'Input Calculator' },
    ],
    BUSINESS_AGENT: [
      { id: 'supplier-dashboard', label: 'Business Agent (Seeds & Inputs)' },
      { id: 'seeds',              label: 'Certified Seeds' },
      { id: 'supplies',           label: 'Fertilizers & Tech' },
      { id: 'orders',             label: 'Co-op Requests' },
      { id: 'calculator',         label: 'Input Calculator' },
    ],
    DRIVER: [
      { id: 'driver-dashboard',   label: t.sidebar.driverDashboard },
      { id: 'loadboard',          label: t.sidebar.availableLoads },
      { id: 'active-trips',       label: t.sidebar.activeTrips },
      { id: 'earnings',           label: t.sidebar.tripEarnings },
    ],
    LOGISTICS_ADMIN: [
      { id: 'logistics-dashboard', label: t.sidebar.logisticsFleet },
      { id: 'loadboard',           label: t.sidebar.loadBoard },
      { id: 'active-trips',        label: t.sidebar.dispatchTrips },
      { id: 'earnings',            label: t.sidebar.fleetRevenue },
    ],
    HUB_OPERATOR: [
      { id: 'hub-dashboard',      label: t.sidebar.hubOperations },
      { id: 'loadboard',          label: t.sidebar.crossDockLoads },
      { id: 'active-trips',       label: t.sidebar.activeShipments },
    ],
    FINANCIAL_INSTITUTION: [
      { id: 'finance-dashboard',    label: t.sidebar.creditUnderwriting },
      { id: 'finance-applications', label: t.sidebar.loanApplications },
    ],
    PLATFORM_ADMIN: [
      { id: 'admin-overview',     label: t.sidebar.executiveOverview },
      { id: 'admin-users',        label: t.sidebar.usersKyb },
      { id: 'admin-orders',       label: t.sidebar.ordersLogistics },
      { id: 'admin-finance',      label: t.sidebar.creditAppraisalDesk },
      { id: 'innovation',         label: 'Innovation (4 Pillars) 🔬' },
    ],
    GUEST: [
      { id: 'marketplace',   label: t.nav.marketplace },
      { id: 'agent',         label: 'Business Agent (Seeds & Inputs) 🌱' },
      { id: 'salvage',       label: 'Salvage Exchange ⚡' },
      { id: 'innovation',    label: 'Core Innovation Engine (4 Pillars) 🔬' },
      { id: 'about',         label: t.nav.about },
    ],
  };

  const ALL_EXTRA: Record<string, { id: string; label: string; icon: any }[]> = {
    FARMER: [],
    BUYER: [],
    BUSINESS_BUYER: [],
    INPUT_SUPPLIER: [],
    BUSINESS_AGENT: [],
    DRIVER: [],
    LOGISTICS_ADMIN: [],
    HUB_OPERATOR: [],
    FINANCIAL_INSTITUTION: [],
    PLATFORM_ADMIN: [
      { id: 'intelligence', label: t.nav.aiIntelligence, icon: Sparkles },
      { id: 'about',        label: t.nav.about,          icon: Globe },
    ],
    GUEST: [
      { id: 'intelligence', label: t.nav.aiIntelligence, icon: Sparkles },
      { id: 'about',        label: t.nav.about,          icon: Globe },
    ],
  };

  const effectiveRole = (role && ALL_NAV[role]) ? role : 'GUEST';
  const coreNavItems  = ALL_NAV[effectiveRole]  || ALL_NAV.GUEST;
  const extraNavItems = ALL_EXTRA[effectiveRole] || [];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setMoreDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-zinc-200/80'
          : 'bg-white/98 backdrop-blur-xs border-b border-zinc-200 shadow-2xs'
      }`}
    >
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 sm:gap-6">
            <AgriLinkLogo
              size="sm"
              theme="light"
              badgeText="ETHIOPIA"
              onClick={() => {
                if (onOpenBrandModal) onOpenBrandModal();
                else handleNavClick('home');
              }}
            />

            {/* Desktop Clean Nav Items */}
            <nav className="hidden lg:flex items-center gap-1">
              {coreNavItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              {/* Extra Items Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                    extraNavItems.some((e) => e.id === activeTab)
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {moreDropdownOpen && (
                  <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 py-1.5 z-50 animate-in fade-in duration-100">
                    {extraNavItems.map((sec) => {
                      const Icon = sec.icon;
                      const isSecActive = activeTab === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => handleNavClick(sec.id)}
                          className={`w-full px-3 py-1.5 text-left flex items-center gap-2 text-xs font-medium cursor-pointer ${
                            isSecActive ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-zinc-700 hover:bg-zinc-50'
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${isSecActive ? 'text-emerald-700' : 'text-zinc-400'}`} />
                          <span>{sec.label}</span>
                        </button>
                      );
                    })}
                    {onOpenCallCenter && (
                      <button
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          onOpenCallCenter();
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-xs text-emerald-800 hover:bg-emerald-50 border-t border-zinc-100 mt-1 pt-1.5 font-semibold cursor-pointer"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Call Center & Support</span>
                      </button>
                    )}
                    {onOpenBrandModal && (
                      <button
                        onClick={() => {
                          setMoreDropdownOpen(false);
                          onOpenBrandModal();
                        }}
                        className="w-full px-3 py-1.5 text-left flex items-center gap-2 text-xs text-zinc-700 hover:bg-zinc-50 font-medium cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-500" />
                        <span>Logo & Credentials</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Right Actions: Pro User Account / Sign In Trigger */}
          <div className="flex items-center gap-2">
            {/* Language Switcher Dropdown */}
            <LanguageSelector variant="compact" />
            
            {/* Conditional Display: Guest Mode vs Logged In Account */}
            {!currentUser ? (
              <div className="flex items-center gap-2">
                {/* Log In Button */}
                {onOpenAuthModal && (
                  <button
                    onClick={onOpenAuthModal}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title={t.nav.login}
                  >
                    <LogIn className="h-3.5 w-3.5 text-emerald-400" />
                    <span>{t.nav.login}</span>
                  </button>
                )}

                {/* Sign Up Button */}
                {onOpenRegister && (
                  <button
                    onClick={onOpenRegister}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    title={t.nav.register}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>{t.nav.register}</span>
                  </button>
                )}
              </div>
            ) : (
              /* Authenticated User Menu */
              <div className="relative">
                <button
                  onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:border-zinc-300 bg-zinc-50/80 hover:bg-white text-xs transition-colors cursor-pointer"
                  title="Account Profile & Settings"
                >
                  <img
                    src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={currentUser?.fullName || 'User'}
                    className="h-6 w-6 rounded-full object-cover shrink-0 border border-zinc-300"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="font-bold text-zinc-900 text-xs leading-none max-w-[100px] truncate">
                      {currentUser?.fullName || 'User'}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 leading-none">
                      {currentUser?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-0.5" />
                </button>

                {roleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-zinc-200 py-2 z-50 animate-in fade-in duration-100">
                    <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50">
                      <p className="text-xs font-black text-zinc-950 leading-none">{currentUser.fullName}</p>
                      <p className="text-[11px] text-zinc-500 mt-1">{currentUser.email || currentUser.phone}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getRoleBadgeColor(currentUser.role)}`}>
                          {currentUser.role.replace('_', ' ')}
                        </span>
                        {currentUser.organizationName && (
                          <span className="text-[10px] text-zinc-500 truncate max-w-[140px]">
                            {currentUser.organizationName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* If Super Admin, allow persona switching; otherwise lock to user's classified workspace */}
                    {currentUser.role === 'PLATFORM_ADMIN' ? (
                      <>
                        <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          {t.nav.switchProfile}
                        </div>

                        <div className="max-h-48 overflow-y-auto px-1">
                          {allUsers.map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                onSwitchUser(u.id);
                                setRoleDropdownOpen(false);
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between hover:bg-emerald-50/60 transition-colors cursor-pointer ${
                                currentUser?.id === u.id ? 'bg-emerald-50/90 font-bold text-emerald-950' : 'text-zinc-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                                  alt={u.fullName}
                                  className="h-6 w-6 rounded-full object-cover shrink-0"
                                />
                                <div>
                                  <p className="text-xs font-bold leading-none">{u.fullName}</p>
                                  <p className="text-[10px] text-zinc-400 mt-0.5">{u.organizationName || u.region}</p>
                                </div>
                              </div>
                              <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold border ${getRoleBadgeColor(u.role)}`}>
                                {t.roles[u.role as keyof typeof t.roles] || u.role.replace('_', ' ')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="p-3">
                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 mb-2">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                            {t.common.actions === 'እርምጃዎች' ? 'የተመደበ የስራ ቦታ' : 'Classified Workspace'}
                          </p>
                          <p className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                            {t.roles[currentUser.role as keyof typeof t.roles] || currentUser.role}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            handleNavClick(
                              currentUser.role === 'FARMER' ? 'farmer-dashboard'
                              : currentUser.role === 'BUYER' || currentUser.role === 'BUSINESS_BUYER' ? 'buyer-dashboard'
                              : currentUser.role === 'INPUT_SUPPLIER' || currentUser.role === 'BUSINESS_AGENT' ? 'supplier-dashboard'
                              : currentUser.role === 'FINANCIAL_INSTITUTION' ? 'finance-dashboard'
                              : 'logistics-dashboard'
                            );
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                        >
                          <Sprout className="h-3.5 w-3.5" />
                          <span>{t.common.actions === 'እርምጃዎች' ? 'ወደ ስራ ቦታዬ ግባ' : 'Enter My Workspace'}</span>
                        </button>
                      </div>
                    )}

                    {/* Account Settings & Sign Out */}
                    <div className="p-2 border-t border-zinc-100 space-y-1.5">
                      {onOpenRegister && (
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onOpenRegister();
                          }}
                          className="w-full py-1.5 px-3 rounded-xl border border-zinc-200 hover:border-emerald-600 text-zinc-800 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <UserPlus className="h-3.5 w-3.5 text-emerald-700" />
                          <span>{t.nav.register}</span>
                        </button>
                      )}

                      {onLogoutToGuest && (
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            onLogoutToGuest();
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                        >
                          <LogOut className="h-3.5 w-3.5 text-rose-400" />
                          <span>{t.nav.signOut}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Notifications Bell */}
            <button
              onClick={onOpenNotifs}
              className="relative p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-rose-600 text-white text-[8px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Cart Button (Visible only to buyers, guests, or platform admins) */}
            {(!currentUser || currentUser.role === 'BUYER' || currentUser.role === 'BUSINESS_BUYER' || currentUser.role === 'PLATFORM_ADMIN') && (
              <button
                onClick={onOpenCart}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                title="Procurement Cart"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span>{cartItemCount}</span>
              </button>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 py-2 space-y-1 bg-white">
            {/* Language Switcher in Mobile Drawer */}
            <div className="px-1 py-1">
              <LanguageSelector variant="expanded" />
            </div>

            {onOpenAuthModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold bg-emerald-700 text-white flex items-center gap-2 mb-2 cursor-pointer"
              >
                <LogIn className="h-4 w-4" /> {t.nav.login}
              </button>
            )}

            <button
              onClick={() => handleNavClick('home')}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                activeTab === 'home' ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {t.nav.home}
            </button>
            {[...coreNavItems, ...extraNavItems].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            {onOpenCallCenter && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCallCenter();
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 flex items-center gap-1.5 mt-1 cursor-pointer"
              >
                <Phone className="h-3.5 w-3.5 text-emerald-600" /> {t.nav.callCenter}
              </button>
            )}
            {onOpenBrandModal && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBrandModal();
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5"
              >
                <Eye className="h-3.5 w-3.5 text-zinc-500" /> View Logo & Brand
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
