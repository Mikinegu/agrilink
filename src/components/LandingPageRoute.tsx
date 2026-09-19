import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from './HomePage.tsx';
import { Footer } from './Footer.tsx';
import { Navbar } from './Navbar.tsx';
import { CommodityTickerBar } from './CommodityTickerBar.tsx';
import { useAuth, getRoleDashboardPath } from '../context/AuthContext.tsx';
import { ProductCategory, Product } from '../types/index.ts';

interface LandingPageRouteProps {
  categories: ProductCategory[];
  featuredProducts: Product[];
  onSelectProduct: (product: Product) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  unreadNotifsCount: number;
  onOpenNotifs: () => void;
  onOpenCallCenter?: () => void;
}

export const LandingPageRoute: React.FC<LandingPageRouteProps> = ({
  categories,
  featuredProducts,
  onSelectProduct,
  cartItemCount,
  onOpenCart,
  unreadNotifsCount,
  onOpenNotifs,
  onOpenCallCenter,
}) => {
  const { currentUser, logout, switchPersona } = useAuth();
  const navigate = useNavigate();

  const handleNavigate = (tab: string) => {
    switch (tab) {
      case 'home':
        navigate('/');
        break;

      // ── Farmer-specific routes ──
      case 'farmer-dashboard':
      case 'farmer-portal':
      case 'farmer':
        if (currentUser?.role === 'FARMER') navigate('/farmer/dashboard');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'farmer-listings':
        if (currentUser?.role === 'FARMER') navigate('/farmer/listings');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'farmer-farms':
        if (currentUser?.role === 'FARMER') navigate('/farmer/farms');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'farmer-escrow':
        if (currentUser?.role === 'FARMER') navigate('/farmer/escrow');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'farmer-finance':
        if (currentUser?.role === 'FARMER') navigate('/farmer/finance');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;

      // ── Buyer-specific routes ──
      case 'buyer-dashboard':
      case 'buyer':
        if (currentUser?.role === 'BUYER' || currentUser?.role === 'BUSINESS_BUYER') navigate('/buyer/dashboard');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'marketplace':
        if (currentUser?.role === 'FARMER') {
          navigate('/farmer/listings');
        } else if (currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN' || currentUser?.role === 'HUB_OPERATOR') {
          navigate('/logistics/dashboard');
        } else if (currentUser?.role === 'INPUT_SUPPLIER') {
          navigate('/supplier/dashboard');
        } else if (currentUser?.role === 'FINANCIAL_INSTITUTION') {
          navigate('/finance/dashboard');
        } else {
          navigate('/buyer/marketplace');
        }
        break;
      case 'procurement':
        if (currentUser?.role === 'BUYER' || currentUser?.role === 'BUSINESS_BUYER') navigate('/buyer/requests');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'buyer-orders':
        if (currentUser?.role === 'BUYER' || currentUser?.role === 'BUSINESS_BUYER') navigate('/buyer/orders');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'buyer-escrow':
        if (currentUser?.role === 'BUYER' || currentUser?.role === 'BUSINESS_BUYER') navigate('/buyer/escrow');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;

      // ── Supplier-specific routes ──
      case 'supplier-dashboard':
      case 'inputs':
        if (currentUser?.role === 'INPUT_SUPPLIER') navigate('/supplier/dashboard');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;

      // ── Logistics-specific routes ──
      case 'driver-dashboard':
      case 'logistics-dashboard':
      case 'hub-dashboard':
      case 'logistics':
        if (currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN' || currentUser?.role === 'HUB_OPERATOR') {
          navigate('/logistics/dashboard');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;
      case 'loadboard':
        if (currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN' || currentUser?.role === 'HUB_OPERATOR') {
          navigate('/logistics/loadboard');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;
      case 'active-trips':
        if (currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN' || currentUser?.role === 'HUB_OPERATOR') {
          navigate('/logistics/trip');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;
      case 'earnings':
        if (currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN' || currentUser?.role === 'HUB_OPERATOR') {
          navigate('/logistics/earnings');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;

      // ── Finance routes ──
      case 'finance-dashboard':
      case 'finance':
        if (currentUser?.role === 'FINANCIAL_INSTITUTION' || currentUser?.role === 'PLATFORM_ADMIN') {
          navigate('/finance/dashboard');
        } else if (currentUser?.role === 'FARMER') {
          navigate('/farmer/finance');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;
      case 'finance-applications':
        if (currentUser?.role === 'FINANCIAL_INSTITUTION' || currentUser?.role === 'PLATFORM_ADMIN') {
          navigate('/finance/applications');
        } else if (currentUser) {
          navigate(getRoleDashboardPath(currentUser.role));
        } else {
          navigate('/login');
        }
        break;

      // ── Platform Admin routes ──
      case 'admin-overview':
      case 'admin':
        if (currentUser?.role === 'PLATFORM_ADMIN') navigate('/admin/overview');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'admin-users':
        if (currentUser?.role === 'PLATFORM_ADMIN') navigate('/admin/users');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'admin-orders':
        if (currentUser?.role === 'PLATFORM_ADMIN') navigate('/admin/orders');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;
      case 'admin-finance':
        if (currentUser?.role === 'PLATFORM_ADMIN') navigate('/admin/finance');
        else if (currentUser) navigate(getRoleDashboardPath(currentUser.role));
        else navigate('/login');
        break;

      case 'register':
      case 'registration':
      case 'ethiodirect':
        navigate('/register');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'salvage':
        navigate('/salvage');
        break;
      case 'innovation':
      case 'pillars':
      case 'pitch':
        navigate('/innovation');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans text-zinc-900">
      <Navbar
        currentUser={currentUser}
        allUsers={[]}
        onSwitchUser={async (id) => {
          const user = await switchPersona(id);
          if (user) navigate(getRoleDashboardPath(user.role));
        }}
        activeTab="home"
        setActiveTab={handleNavigate}
        cartItemCount={cartItemCount}
        onOpenCart={onOpenCart}
        unreadNotifsCount={unreadNotifsCount}
        onOpenNotifs={onOpenNotifs}
        onOpenRegister={() => navigate('/register')}
        onOpenAuthModal={() => navigate('/login')}
        onLogoutToGuest={logout}
        onOpenCallCenter={onOpenCallCenter}
      />

      <main className="flex-1 pt-14 sm:pt-16">
        <CommodityTickerBar variant="dark" />
        <HomePage
          onNavigate={handleNavigate}
          categories={categories}
          featuredProducts={featuredProducts}
          onSelectProduct={onSelectProduct}
          currentUser={currentUser}
          onOpenLogin={() => navigate('/login')}
          onOpenSignUp={() => navigate('/register')}
          onOpenBrand={() => {}}
          onLogoutToGuest={logout}
          onOpenCallCenter={onOpenCallCenter}
        />
      </main>

      <Footer onNavigate={handleNavigate} onOpenCallCenter={onOpenCallCenter} />
    </div>
  );
};
