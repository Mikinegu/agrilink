import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthGuard } from '../guards/AuthGuard.tsx';
import { RoleGuard } from '../guards/RoleGuard.tsx';
import { DashboardLayout } from '../layouts/DashboardLayout.tsx';
import { LandingPageRoute } from '../components/LandingPageRoute.tsx';
import { LoginPage } from '../components/LoginPage.tsx';
import EthioDirectRegistration from '../components/EthioDirectRegistration.tsx';
import { NotFoundPage } from '../components/NotFoundPage.tsx';

// Role-Isolated Pages
import { FarmerDashboard } from '../components/FarmerDashboard.tsx';
import { FarmerListings } from '../components/FarmerListings.tsx';
import { FarmerEscrowWallet } from '../components/FarmerEscrowWallet.tsx';
import { FarmerPortal } from '../components/FarmerPortal.tsx';
import { FinancePortal } from '../components/FinancePortal.tsx';
import { AgriIntelligenceRadar } from '../components/AgriIntelligenceRadar.tsx';

import { BuyerDashboard } from '../components/BuyerDashboard.tsx';
import { MarketplaceView } from '../components/MarketplaceView.tsx';
import { BusinessProcurement } from '../components/BusinessProcurement.tsx';
import { BuyerOrders } from '../components/BuyerOrders.tsx';
import { BuyerEscrowManager } from '../components/BuyerEscrowManager.tsx';

import { LogisticsDashboard } from '../components/LogisticsDashboard.tsx';
import { LogisticsHubPortal } from '../components/LogisticsHubPortal.tsx';

import { InputMarketplaceView } from '../components/InputMarketplaceView.tsx';
import { AdminPortal } from '../components/AdminPortal.tsx';

import { useAuth } from '../context/AuthContext.tsx';
import { ProductCategory, Product } from '../types/index.ts';

interface AppRouterProps {
  categories: ProductCategory[];
  featuredProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: any, quantity: number) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  unreadNotifsCount: number;
  onOpenNotifs: () => void;
  onOpenCallCenter?: () => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  categories,
  featuredProducts,
  onSelectProduct,
  onAddToCart,
  cartItemCount,
  onOpenCart,
  unreadNotifsCount,
  onOpenNotifs,
  onOpenCallCenter,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  return (
    <Routes>
      {/* ── 1. Public Routes ────────────────────────────────────────── */}
      <Route
        path="/"
        element={
          <LandingPageRoute
            categories={categories}
            featuredProducts={featuredProducts}
            onSelectProduct={onSelectProduct}
            cartItemCount={cartItemCount}
            onOpenCart={onOpenCart}
            unreadNotifsCount={unreadNotifsCount}
            onOpenNotifs={onOpenNotifs}
            onOpenCallCenter={onOpenCallCenter}
          />
        }
      />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<EthioDirectRegistration />} />

      {/* ── 2. Authenticated Dashboard Shell ────────────────────────── */}
      <Route element={<AuthGuard />}>
        <Route element={<DashboardLayout />}>
          {/* FARMER WORKSPACE (Role-Isolated for FARMER) */}
          <Route element={<RoleGuard allowedRoles={['FARMER']} />}>
            <Route path="/farmer" element={<Navigate to="/farmer/dashboard" replace />} />
            <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
            <Route path="/farmer/listings" element={<FarmerListings />} />
            <Route
              path="/farmer/farms"
              element={
                <FarmerPortal
                  currentUser={currentUser}
                  onRefreshData={() => {}}
                  onNavigateToFinance={() => navigate('/farmer/finance')}
                />
              }
            />
            <Route path="/farmer/escrow" element={<FarmerEscrowWallet />} />
            <Route path="/farmer/finance" element={<FinancePortal currentUser={currentUser} />} />
            <Route
              path="/farmer/ai-advisor"
              element={
                <AgriIntelligenceRadar
                  currentUser={currentUser}
                  onNavigate={(tab) =>
                    navigate(tab === 'finance' ? '/farmer/finance' : '/farmer/dashboard')
                  }
                  onAddToCart={onAddToCart}
                />
              }
            />
          </Route>

          {/* BUYER WORKSPACE (Role-Isolated for BUYER & BUSINESS_BUYER) */}
          <Route element={<RoleGuard allowedRoles={['BUYER', 'BUSINESS_BUYER']} />}>
            <Route path="/buyer" element={<Navigate to="/buyer/dashboard" replace />} />
            <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
            <Route
              path="/buyer/marketplace"
              element={
                <MarketplaceView
                  categories={categories}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                />
              }
            />
            <Route
              path="/buyer/requests"
              element={<BusinessProcurement currentUser={currentUser} />}
            />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/escrow" element={<BuyerEscrowManager />} />
          </Route>

          {/* LOGISTICS WORKSPACE (Role-Isolated for DRIVER, LOGISTICS_ADMIN, HUB_OPERATOR) */}
          <Route
            element={<RoleGuard allowedRoles={['DRIVER', 'LOGISTICS_ADMIN', 'HUB_OPERATOR']} />}
          >
            <Route path="/logistics" element={<Navigate to="/logistics/dashboard" replace />} />
            <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
            <Route
              path="/logistics/loadboard"
              element={<LogisticsHubPortal currentUser={currentUser} />}
            />
            <Route
              path="/logistics/trip"
              element={<LogisticsHubPortal currentUser={currentUser} />}
            />
            <Route path="/logistics/earnings" element={<LogisticsDashboard />} />
          </Route>

          {/* INPUT SUPPLIER WORKSPACE (Role-Isolated for INPUT_SUPPLIER) */}
          <Route element={<RoleGuard allowedRoles={['INPUT_SUPPLIER']} />}>
            <Route path="/supplier" element={<Navigate to="/supplier/dashboard" replace />} />
            <Route
              path="/supplier/dashboard"
              element={<InputMarketplaceView onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/products"
              element={<InputMarketplaceView onAddToCart={onAddToCart} />}
            />
          </Route>

          {/* FINANCIAL INSTITUTION WORKSPACE (Role-Isolated for FINANCIAL_INSTITUTION & PLATFORM_ADMIN) */}
          <Route element={<RoleGuard allowedRoles={['FINANCIAL_INSTITUTION', 'PLATFORM_ADMIN']} />}>
            <Route path="/finance" element={<Navigate to="/finance/dashboard" replace />} />
            <Route path="/finance/dashboard" element={<FinancePortal currentUser={currentUser} />} />
            <Route path="/finance/applications" element={<FinancePortal currentUser={currentUser} />} />
          </Route>

          {/* PLATFORM ADMIN WORKSPACE (Role-Isolated for PLATFORM_ADMIN) */}
          <Route element={<RoleGuard allowedRoles={['PLATFORM_ADMIN']} />}>
            <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
            <Route
              path="/admin/overview"
              element={<AdminPortal currentUser={currentUser} onRefreshAll={() => {}} />}
            />
            <Route
              path="/admin/users"
              element={<AdminPortal currentUser={currentUser} onRefreshAll={() => {}} />}
            />
            <Route
              path="/admin/orders"
              element={<AdminPortal currentUser={currentUser} onRefreshAll={() => {}} />}
            />
            <Route
              path="/admin/finance"
              element={<FinancePortal currentUser={currentUser} />}
            />
            <Route
              path="/admin/*"
              element={<AdminPortal currentUser={currentUser} onRefreshAll={() => {}} />}
            />
          </Route>
        </Route>
      </Route>

      {/* ── 3. 404 Fallback ────────────────────────────────────────── */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
