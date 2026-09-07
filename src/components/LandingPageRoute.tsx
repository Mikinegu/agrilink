import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePage } from './HomePage.tsx';
import { Footer } from './Footer.tsx';
import { Navbar } from './Navbar.tsx';
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
      case 'marketplace':
      case 'buyer':
        navigate('/buyer/marketplace');
        break;
      case 'farmer-portal':
      case 'farmer':
        navigate(currentUser?.role === 'FARMER' ? '/farmer/dashboard' : '/login');
        break;
      case 'logistics':
        navigate(
          currentUser?.role === 'DRIVER' || currentUser?.role === 'LOGISTICS_ADMIN'
            ? '/logistics/dashboard'
            : '/login'
        );
        break;
      case 'procurement':
        navigate('/buyer/requests');
        break;
      case 'finance':
        navigate('/farmer/finance');
        break;
      case 'admin':
        navigate('/admin/overview');
        break;
      case 'register':
      case 'registration':
      case 'ethiodirect':
        navigate('/register');
        break;
      case 'login':
        navigate('/login');
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
