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
import { BuyRequestsPage } from '../components/BuyRequestsPage.tsx';
import { BuyerOrders } from '../components/BuyerOrders.tsx';
import { BuyerEscrowManager } from '../components/BuyerEscrowManager.tsx';

import { LogisticsDashboard } from '../components/LogisticsDashboard.tsx';
import { LogisticsHubPortal } from '../components/LogisticsHubPortal.tsx';
import { LoadBoard } from '../components/LoadBoard.tsx';
import { ActiveTrip } from '../components/ActiveTrip.tsx';
import { FleetEarnings } from '../components/FleetEarnings.tsx';

import { InputMarketplaceView } from '../components/InputMarketplaceView.tsx';
import { BusinessAgentHub } from '../components/BusinessAgentHub.tsx';
import { AdminPortal } from '../components/AdminPortal.tsx';
import { SalvageExchange } from '../components/SalvageExchange.tsx';
import { AgrilinkInnovationPillars } from '../components/AgrilinkInnovationPillars.tsx';

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
  onDirectPay?: (product: Product) => void;
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
  onDirectPay,
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
      <Route path="/salvage" element={<SalvageExchange />} />
      <Route path="/innovation" element={<AgrilinkInnovationPillars />} />
      <Route path="/agent" element={<Navigate to="/agent/dashboard" replace />} />
      <Route path="/agent/dashboard" element={<BusinessAgentHub onAddToCart={onAddToCart} />} />
      <Route path="/agent/seeds" element={<BusinessAgentHub initialTab="seeds" onAddToCart={onAddToCart} />} />
      <Route path="/agent/supplies" element={<BusinessAgentHub initialTab="supplies" onAddToCart={onAddToCart} />} />
      <Route path="/agent/orders" element={<BusinessAgentHub initialTab="orders" onAddToCart={onAddToCart} />} />
      <Route path="/agent/calculator" element={<BusinessAgentHub initialTab="calculator" onAddToCart={onAddToCart} />} />

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
                  onDirectPay={onDirectPay}
                />
              }
            />
            <Route path="/buyer/requests" element={<BuyRequestsPage />} />
            <Route path="/buyer/orders" element={<BuyerOrders />} />
            <Route path="/buyer/escrow" element={<BuyerEscrowManager />} />
          </Route>

          {/* LOGISTICS WORKSPACE (Role-Isolated for DRIVER, LOGISTICS_ADMIN, HUB_OPERATOR) */}
          <Route
            element={<RoleGuard allowedRoles={['DRIVER', 'LOGISTICS_ADMIN', 'HUB_OPERATOR']} />}
          >
            <Route path="/logistics" element={<Navigate to="/logistics/dashboard" replace />} />
            <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
            <Route path="/logistics/loadboard" element={<LoadBoard />} />
            <Route path="/logistics/trip" element={<ActiveTrip />} />
            <Route path="/logistics/earnings" element={<FleetEarnings />} />
          </Route>

          {/* BUSINESS AGENT / INPUT SUPPLIER WORKSPACE (Role-Isolated for INPUT_SUPPLIER & BUSINESS_AGENT) */}
          <Route element={<RoleGuard allowedRoles={['INPUT_SUPPLIER', 'BUSINESS_AGENT']} />}>
            <Route path="/supplier" element={<Navigate to="/supplier/dashboard" replace />} />
            <Route
              path="/supplier/dashboard"
              element={<BusinessAgentHub onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/products"
              element={<BusinessAgentHub onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/seeds"
              element={<BusinessAgentHub initialTab="seeds" onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/supplies"
              element={<BusinessAgentHub initialTab="supplies" onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/orders"
              element={<BusinessAgentHub initialTab="orders" onAddToCart={onAddToCart} />}
            />
            <Route
              path="/supplier/calculator"
              element={<BusinessAgentHub initialTab="calculator" onAddToCart={onAddToCart} />}
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
