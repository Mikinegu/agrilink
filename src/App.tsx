import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { AppRouter } from './router/AppRouter.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { NotificationsModal } from './components/NotificationsModal.tsx';
import { CallCenterModal } from './components/CallCenterModal.tsx';
import { LiveCallCenterWidget } from './components/LiveCallCenterWidget.tsx';
import { ActionToast, ToastMessage } from './components/ActionToast.tsx';
import { OrderConfirmationModal } from './components/OrderConfirmationModal.tsx';
import { AgriLinkSurveyModal } from './components/AgriLinkSurveyModal.tsx';
import { LanguageProvider, useTranslation } from './i18n/LanguageContext.tsx';
import { Product, ProductCategory, CartItem, Notification } from './types/index.ts';

function AppContent() {
  const { currentUser, token } = useAuth();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // Cart State
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [subtotalEtb, setSubtotalEtb] = useState(0);
  const [deliveryFeeEtb, setDeliveryFeeEtb] = useState(0);
  const [serviceFeeEtb, setServiceFeeEtb] = useState(0);
  const [grandTotalEtb, setGrandTotalEtb] = useState(0);

  // Modals & Action Feedback
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [notifsModalOpen, setNotifsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [callCenterModalOpen, setCallCenterModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [hasRated, setHasRated] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('agrilink_survey_submitted') === 'true';
    }
    return false;
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Toast feedback helper
  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Direct Pay from Product or Marketplace
  const [directPayInitial, setDirectPayInitial] = useState(false);

  const handleSelectProduct = (product: Product) => {
    setDirectPayInitial(false);
    setSelectedProduct(product);
  };

  const handleDirectPayProduct = (product: Product) => {
    setDirectPayInitial(true);
    setSelectedProduct(product);
  };

  // Initial Platform Data Fetching
  const fetchPlatformData = async () => {
    try {
      const [catRes, prodRes, notifRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
        fetch('/api/notifications'),
      ]);

      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) setFeaturedProducts(await prodRes.json());
      if (notifRes.ok) setNotifications(await notifRes.json());
    } catch (err) {
      console.error('Initial load error:', err);
    }
  };

  const fetchCartData = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch('/api/cart', { headers });
      if (res.ok) {
        const data = await res.json();
        setCartItems(data.items || []);
        setSubtotalEtb(data.subtotalEtb || 0);
        setDeliveryFeeEtb(data.deliveryFeeEtb || 0);
        setServiceFeeEtb(data.serviceFeeEtb || 0);
        setGrandTotalEtb(data.grandTotalEtb || 0);
      }
    } catch (err) {
      console.error('Cart fetch error:', err);
    }
  };

  useEffect(() => {
    fetchPlatformData();
    fetchCartData();
  }, [currentUser?.id]);

  // Cart Handlers
  const handleAddToCart = async (product: any, quantity: number) => {
    try {
      const isInput = !!product.supplierId;
      const unitPrice = isInput ? Number(product.priceEtb) : Number(product.pricePerUnitEtb);
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: isInput ? undefined : product.id,
          inputProductId: isInput ? product.id : undefined,
          quantity,
          unitPriceEtb: unitPrice || 100,
        }),
      });

      if (res.ok) {
        await fetchCartData();
        showToast({
          type: 'success',
          title: t.toast.itemAddedTitle,
          description: `${quantity} ${product.unit || t.common.unit} of ${product.name} ${t.toast.itemAddedDesc}`,
        });
      }
    } catch (err) {
      console.error('Add to cart error:', err);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch(`/api/cart/items/${itemId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ quantity: newQty }),
      });
      if (res.ok) fetchCartData();
    } catch (err) {
      console.error('Update qty error:', err);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch(`/api/cart/items/${itemId}`, { method: 'DELETE', headers });
      if (res.ok) {
        fetchCartData();
        showToast({
          type: 'info',
          title: t.toast.itemRemovedTitle,
          description: t.toast.itemRemovedDesc,
        });
      }
    } catch (err) {
      console.error('Remove item error:', err);
    }
  };

  const handleClearCart = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch('/api/cart', { method: 'DELETE', headers });
      if (res.ok) {
        fetchCartData();
        showToast({
          type: 'info',
          title: t.toast.cartClearedTitle,
          description: t.toast.cartClearedDesc,
        });
      }
    } catch (err) {
      console.error('Clear cart error:', err);
    }
  };

  const handleOrderSuccess = (order: any) => {
    setCartDrawerOpen(false);
    fetchCartData();
    setConfirmedOrder(order);
    showToast({
      type: 'success',
      title: t.toast.orderConfirmedTitle,
      description: `Order ${order?.orderNumber || ''} ${t.toast.orderConfirmedDesc}`,
    });
  };

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-emerald-500 selection:text-white">
      {/* Declarative Application Route Tree */}
      <AppRouter
        categories={categories}
        featuredProducts={featuredProducts}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
        cartItemCount={cartTotalCount}
        onOpenCart={() => setCartDrawerOpen(true)}
        unreadNotifsCount={notifications.filter((n) => !n.isRead).length}
        onOpenNotifs={() => setNotifsModalOpen(true)}
        onOpenCallCenter={() => setCallCenterModalOpen(true)}
        onDirectPay={handleDirectPayProduct}
      />

      {/* Global Procurement Cart Drawer */}
      <CartDrawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        cartItems={cartItems}
        subtotalEtb={subtotalEtb}
        deliveryFeeEtb={deliveryFeeEtb}
        serviceFeeEtb={serviceFeeEtb}
        grandTotalEtb={grandTotalEtb}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderSuccess={handleOrderSuccess}
        currentUser={currentUser}
      />

      {/* Product Detail Modal with Direct Pay Section & Cart Actions */}
      {selectedProduct && (
        <ProductDetailModal
          isOpen={!!selectedProduct}
          product={selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setDirectPayInitial(false);
          }}
          onAddToCart={handleAddToCart}
          onOrderSuccess={handleOrderSuccess}
          initialDirectPay={directPayInitial}
          onSelectFarmer={() => setSelectedProduct(null)}
        />
      )}

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notifsModalOpen}
        onClose={() => setNotifsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={async (id) => {
          try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
          } catch {}
        }}
        onViewOrder={() => setNotifsModalOpen(false)}
      />

      {/* Order Confirmation Feedback Modal */}
      {confirmedOrder && (
        <OrderConfirmationModal
          isOpen={!!confirmedOrder}
          order={confirmedOrder}
          onClose={() => setConfirmedOrder(null)}
          onNavigate={(tab) => {
            setConfirmedOrder(null);
          }}
        />
      )}

      {/* 24/7 Support Desk Modal */}
      <CallCenterModal
        isOpen={callCenterModalOpen}
        onClose={() => setCallCenterModalOpen(false)}
      />

      {/* Survey & Satisfaction Modal */}
      <AgriLinkSurveyModal
        isOpen={surveyModalOpen}
        onClose={() => setSurveyModalOpen(false)}
        currentUser={currentUser}
        onSurveySubmitted={(rating) => {
          setHasRated(true);
          try {
            localStorage.setItem('agrilink_survey_submitted', 'true');
          } catch {}
          showToast({
            type: 'success',
            title: t.survey.thankYouTitle,
            description: `${rating}`,
          });
        }}
      />

      {/* Live Call Center Floating Widget */}
      <LiveCallCenterWidget onOpen={() => setCallCenterModalOpen(true)} />

      {/* Floating Rating Trigger */}
      {!hasRated && (
        <button
          onClick={() => setSurveyModalOpen(true)}
          className="fixed bottom-20 right-5 z-40 px-3.5 py-2 rounded-full bg-emerald-950/90 hover:bg-emerald-900 text-white text-xs font-bold border border-emerald-500/40 shadow-xl flex items-center gap-2 backdrop-blur-xs transition-transform hover:scale-105 cursor-pointer"
          title={t.survey.modalTitle}
        >
          <span className="text-amber-300 text-sm">⭐</span>
          <span className="hidden sm:inline">{t.survey.modalTitle}</span>
        </button>
      )}

      {/* Global Toast Feedback */}
      <ActionToast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
