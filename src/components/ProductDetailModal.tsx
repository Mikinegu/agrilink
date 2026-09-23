import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  Award,
  Truck,
  Sparkles,
  Star,
  FileText,
  Building2,
  ChevronRight,
  Info,
  Clock,
  ArrowRight,
  Factory,
  Briefcase,
  Store,
  Globe,
  Sprout,
  Check,
  Plus,
  Minus,
  Mountain,
  Tag,
  Package,
  HeartHandshake,
  Zap,
  CreditCard,
  Lock,
  ArrowLeft,
  Printer,
  Receipt,
} from 'lucide-react';
import { Product } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { EthiopianPaymentModal } from './EthiopianPaymentModal.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen?: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onRequestQuote?: (product: Product) => void;
  onOrderSuccess?: (order: any) => void;
  initialDirectPay?: boolean;
  onSelectFarmer?: () => void;
  onDirectOrder?: (product: Product, quantity: number) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen = true,
  onClose,
  onAddToCart,
  onRequestQuote,
  onOrderSuccess,
  initialDirectPay = false,
  onSelectFarmer,
}) => {
  const { currentUser, token } = useAuth();
  const { t, currentLanguage } = useTranslation();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState<number>(product?.minOrderQuantity || 1);
  const [activeTab, setActiveTab] = useState<'overview' | 'farmer' | 'quality' | 'reviews'>('overview');
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Direct Pay Section State
  const [isDirectPayMode, setIsDirectPayMode] = useState(initialDirectPay);
  const [deliveryModel, setDeliveryModel] = useState<'FARM_GATE_PICKUP' | 'DIRECT' | 'HUB_CROSS_DOCK'>('FARM_GATE_PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState('Addis Ababa Central Wholesale Terminal, Bole Sub-City');
  const [contactName, setContactName] = useState(currentUser?.fullName || 'Direct Procurement Buyer');
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || '0961123330');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentProvider, setPaymentProvider] = useState<'TELEBIRR' | 'CBE_BIRR' | 'CHAPA' | 'AWASH'>('TELEBIRR');

  // Payment Modal Trigger & Processing
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSubmittingDirect, setIsSubmittingDirect] = useState(false);
  const [directSuccessOrder, setDirectSuccessOrder] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialDirectPay) {
      setIsDirectPayMode(true);
    }
  }, [initialDirectPay]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'];

  const effectiveQty = Math.max(product.minOrderQuantity || 1, quantity);
  const itemSubtotal = effectiveQty * product.pricePerUnitEtb;
  const isDirectFarmerPickup = deliveryModel === 'FARM_GATE_PICKUP';
  const deliveryFee = isDirectFarmerPickup ? 0 : (itemSubtotal > 20000 ? 0 : 2500);
  const serviceFeeEtb = Math.round(itemSubtotal * 0.02);
  const grandTotalEtb = itemSubtotal + deliveryFee + serviceFeeEtb;

  const handleAddToCartClick = () => {
    onAddToCart(product, effectiveQty);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleQtyChange = (val: number) => {
    const min = product.minOrderQuantity || 1;
    const max = product.availableQuantity || 999999;
    const clamped = Math.max(min, Math.min(max, val));
    setQuantity(clamped);
  };

  // Direct Pay Handlers
  const handleStartDirectPayment = () => {
    setErrorMessage(null);
    if (!contactPhone || contactPhone.trim().length < 9) {
      setErrorMessage(t.realPayment.validPhoneRequired);
      return;
    }
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalSuccess = async (provider: string, accountNumber: string, txRef: string) => {
    setIsPaymentModalOpen(false);
    setIsSubmittingDirect(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (currentUser?.id) headers['x-user-id'] = String(currentUser.id);

      const res = await fetch('/api/orders/direct', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          userId: currentUser?.id,
          buyerId: currentUser?.id,
          productId: product.id,
          quantity: effectiveQty,
          deliveryAddress: deliveryAddress || currentUser?.address || 'Addis Ababa, Ethiopia',
          deliveryRegion: 'Addis Ababa',
          deliveryContactName: contactName || currentUser?.fullName || 'Direct Buyer',
          deliveryContactPhone: contactPhone || currentUser?.phone || '+251 91 000 0000',
          deliveryModel,
          paymentMethod: provider,
          transactionRef: txRef,
          payerAccountNumber: accountNumber,
          notes: orderNotes || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDirectSuccessOrder(data.order);
        if (onOrderSuccess) {
          onOrderSuccess(data.order);
        }
      } else {
        setErrorMessage(data.error || 'Failed to complete direct order. Funds may be held in escrow.');
      }
    } catch (err: any) {
      setErrorMessage('Network error during order completion. Ref: ' + txRef);
    } finally {
      setIsSubmittingDirect(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-150">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-100/90 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* ── Direct Purchase Confirmed Screen ── */}
          {directSuccessOrder ? (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {t.realPayment.statusLockedInEscrow}
                </span>
                <h2 className="text-2xl font-black text-zinc-900 mt-3">
                  {t.realPayment.directOrderSuccessNotice}
                </h2>
                <p className="text-sm text-zinc-500 mt-1">
                  Order #{directSuccessOrder.orderNumber} • Reference: {directSuccessOrder.orderNumber}
                </p>
              </div>

              {/* Order Details Card */}
              <div className="max-w-md mx-auto bg-zinc-50 rounded-2xl p-5 border border-zinc-200 text-left space-y-3 text-xs">
                <div className="flex justify-between pb-2 border-b border-zinc-200">
                  <span className="text-zinc-500 font-semibold">{product.name}</span>
                  <span className="font-bold text-zinc-900">{effectiveQty} {product.unit}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.realPayment.subtotalAmount}</span>
                  <span className="font-semibold text-zinc-800">{itemSubtotal.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">{t.realPayment.serviceFee2Percent}</span>
                  <span className="font-semibold text-zinc-800">{serviceFeeEtb.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Multimodal Delivery</span>
                  <span className="font-semibold text-zinc-800">{deliveryFee === 0 ? 'FREE' : `${deliveryFee.toLocaleString()} ETB`}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-200 text-sm font-black text-emerald-950">
                  <span>{t.realPayment.totalSettledAmount}</span>
                  <span>{grandTotalEtb.toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>{t.realPayment.printReceiptBtn}</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {t.common.close}
                </button>
              </div>
            </div>
          ) : isDirectPayMode ? (
            /* ── DIRECT PAY SECTION BEFORE CART ── */
            <div className="p-6 sm:p-8 space-y-6">
              {/* Back to Overview Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <button
                  onClick={() => setIsDirectPayMode(false)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Product Details</span>
                </button>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{t.realPayment.instantEscrowLock} (NBE Compliant)</span>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                  {t.realPayment.directPayTitle}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-500 mt-1">
                  {t.realPayment.directPaySubtitle}
                </p>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <Info className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Product & Quantity Adjustment */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-start gap-4">
                    <img
                      src={images[0]}
                      alt={product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-zinc-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 block truncate">
                        {product.categoryName} • Lot #{product.lotBatchNumber.slice(-6)}
                      </span>
                      <h3 className="font-bold text-sm text-zinc-900 truncate mt-0.5">{product.name}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{product.farmLocation || product.region}</span>
                      </p>
                      <p className="text-xs font-black text-emerald-950 mt-2">
                        {product.pricePerUnitEtb.toLocaleString()} ETB <span className="text-[10px] text-zinc-500 font-normal">/{product.unit}</span>
                      </p>
                    </div>
                  </div>

                  {/* Quantity Adjustment */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-700">Direct Order Quantity:</span>
                      <span className="text-zinc-500">Min: {product.minOrderQuantity || 1} {product.unit}s</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-zinc-50 shadow-2xs">
                        <button
                          onClick={() => handleQtyChange(effectiveQty - (product.minOrderQuantity || 1))}
                          className="p-2 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={effectiveQty}
                          onChange={(e) => handleQtyChange(Number(e.target.value))}
                          className="w-20 text-center text-sm font-black text-zinc-900 bg-white focus:outline-none py-1.5"
                        />
                        <button
                          onClick={() => handleQtyChange(effectiveQty + (product.minOrderQuantity || 1))}
                          className="p-2 hover:bg-zinc-200 text-zinc-700 cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <span className="text-xs font-bold text-zinc-600 uppercase">{product.unit}s</span>
                    </div>
                  </div>

                  {/* Multimodal Logistics Selector */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-700 block">Multimodal Fulfillment Route</span>
                      {isDirectFarmerPickup && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ✓ 0 ETB Logistics (Zero Freight)
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryModel('FARM_GATE_PICKUP')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          deliveryModel === 'FARM_GATE_PICKUP'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/30'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs block font-bold">Direct Farmer Pickup</span>
                          <span className="text-[9px] font-black px-1 rounded bg-emerald-600 text-white">0 ETB</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-normal">Farm-gate self-collection. Free logistics.</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryModel('DIRECT')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          deliveryModel === 'DIRECT'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/30'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="text-xs block font-bold">Direct Farm Dispatch</span>
                        <span className="text-[10px] text-zinc-500 font-normal">Carrier freight truck to your door</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryModel('HUB_CROSS_DOCK')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          deliveryModel === 'HUB_CROSS_DOCK'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/30'
                            : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300'
                        }`}
                      >
                        <span className="text-xs block font-bold">Hub Cross-Dock</span>
                        <span className="text-[10px] text-zinc-500 font-normal">Cold-chain terminal inspection</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right: Escrow Calculation & Payment Rail */}
                <div className="md:col-span-6 space-y-4">
                  {/* Recipient & Destination Inputs */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 space-y-3">
                    <span className="text-xs font-bold text-zinc-700 block">Delivery Destination & Contact</span>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Contact Phone</label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="09XXXXXXXX"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Delivery Address</label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Destination address"
                          className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Financial Breakdown Card */}
                  <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-3 shadow-md">
                    <div className="flex items-center justify-between text-xs text-emerald-200 border-b border-emerald-800/80 pb-2">
                      <span>Commodity Subtotal</span>
                      <span className="font-mono font-bold text-white">{itemSubtotal.toLocaleString()} ETB</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-emerald-200">
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3 text-amber-400" />
                        <span>AgriLink Escrow Fee (2%)</span>
                      </span>
                      <span className="font-mono text-emerald-100">{serviceFeeEtb.toLocaleString()} ETB</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-emerald-200">
                      <span>Freight & Logistics</span>
                      <span className="font-mono text-emerald-100 font-bold">
                        {deliveryFee === 0 ? (
                          <span className="text-amber-300 font-extrabold bg-emerald-900/80 px-2 py-0.5 rounded border border-emerald-700">
                            0 ETB (FREE Direct Farm Pickup)
                          </span>
                        ) : (
                          `${deliveryFee.toLocaleString()} ETB`
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm font-black pt-2 border-t border-emerald-800">
                      <span className="text-emerald-300">Total Escrow Deposit:</span>
                      <span className="text-lg font-mono text-amber-300">{grandTotalEtb.toLocaleString()} ETB</span>
                    </div>
                  </div>

                  {/* Quick Action: Authorize Payment */}
                  <button
                    onClick={handleStartDirectPayment}
                    disabled={isSubmittingDirect}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  >
                    <Zap className="h-4 w-4 text-amber-300 fill-amber-300" />
                    <span>{t.realPayment.proceedToDirectPayment}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-[11px] text-zinc-400 text-center flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Funds held safely in trust until you confirm delivery quality</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── STANDARD PRODUCT OVERVIEW (WITH DUAL ACTIONS) ── */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              {/* Product Gallery & Farmer Badge (Left Column) */}
              <div className="md:col-span-5 p-6 bg-zinc-50 border-r border-zinc-200 flex flex-col justify-between">
                <div>
                  {/* Main Image */}
                  <div className="aspect-4/3 rounded-2xl overflow-hidden bg-zinc-200 mb-3 border border-zinc-200 shadow-xs relative">
                    <img
                      src={images[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/90 text-white shadow-xs backdrop-blur-xs border border-emerald-500/30">
                      {product.grade.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Thumbnails */}
                  {images.length > 1 && (
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 cursor-pointer transition-all shrink-0 ${
                            selectedImageIndex === idx ? 'border-emerald-600 scale-105' : 'border-zinc-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={img} alt="thumb" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Verified Producer Card */}
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Verified Smallholder
                      </span>
                      {product.farmerRating && (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          {product.farmerRating} / 5.0
                        </span>
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-zinc-900">{product.farmerName || 'Verified Producer'}</h4>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        <span>{product.farmLocation || 'Oromia Regional Farm'}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                      <span>Harvest: {product.harvestDate || 'Fresh Batch'}</span>
                      <span className="font-mono text-zinc-400">Lot: {product.lotBatchNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Instant Escrow Notice */}
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-950 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>100% Escrow Protection: Released only after certified inspection.</span>
                </div>
              </div>

              {/* Product Specifications & Dual Action Footer (Right Column) */}
              <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">
                      {product.categoryName} • {product.variety || 'Certified Grade'}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">ID #{product.id}</span>
                  </div>

                  <h1 className="text-2xl font-black text-zinc-900 leading-tight mb-2">
                    {product.name}
                  </h1>

                  {/* Pricing Bar */}
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 mb-5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Wholesale Unit Price</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-950">
                          {product.pricePerUnitEtb.toLocaleString()} ETB
                        </span>
                        <span className="text-xs font-bold text-zinc-500">/{product.unit}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Available Lot Stock</span>
                      <span className="text-sm font-extrabold text-zinc-800">
                        {product.availableQuantity.toLocaleString()} {product.unit}s
                      </span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b border-zinc-200 mb-4 gap-6 text-xs font-bold">
                    <button
                      onClick={() => setActiveTab('overview')}
                      className={`pb-2.5 transition-colors cursor-pointer ${
                        activeTab === 'overview'
                          ? 'border-b-2 border-emerald-600 text-emerald-700'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab('quality')}
                      className={`pb-2.5 transition-colors cursor-pointer ${
                        activeTab === 'quality'
                          ? 'border-b-2 border-emerald-600 text-emerald-700'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Quality & Testing
                    </button>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className={`pb-2.5 transition-colors cursor-pointer ${
                        activeTab === 'reviews'
                          ? 'border-b-2 border-emerald-600 text-emerald-700'
                          : 'text-zinc-500 hover:text-zinc-800'
                      }`}
                    >
                      Buyer Feedback
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div className="text-xs text-zinc-600 leading-relaxed min-h-[140px]">
                    {activeTab === 'overview' && (
                      <div className="space-y-3">
                        <p>{product.description}</p>
                        <div className="grid grid-cols-2 gap-2.5 pt-2">
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                            <span className="text-zinc-400 text-[10px] uppercase font-bold block">Moisture Content</span>
                            <span className="font-bold text-zinc-900">{product.moistureContent ? `${product.moistureContent}%` : 'Standard (< 13%)'}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                            <span className="text-zinc-400 text-[10px] uppercase font-bold block">Fulfillment Model</span>
                            <span className="font-bold text-zinc-900">Direct or Regional Cross-Dock</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'quality' && (
                      <div className="space-y-2.5">
                        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-emerald-700" />
                            <div>
                              <span className="font-bold block text-xs">Quality Score: {product.qualityScore || 98}%</span>
                              <span className="text-[10px] text-emerald-800">Verified by AgriLink Regional Hub Inspectors</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white font-black text-[10px]">
                            PASSED GRADE A
                          </span>
                        </div>
                      </div>
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-2">
                        <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-bold text-zinc-900">Alemayehu Tadesse (Bole Grocers)</span>
                            <div className="flex items-center text-amber-500">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                              <span className="font-bold ml-1 text-xs">5.0</span>
                            </div>
                          </div>
                          <p className="text-zinc-600 text-xs">Outstanding batch, uniform grain size and prompt dispatch via AgriLink.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── FOOTER: DUAL ACTIONS (PAY DIRECTLY OR ADD TO CART) ── */}
                <div className="mt-6 pt-4 border-t border-zinc-200 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-zinc-600">Quantity:</span>
                      <div className="flex items-center border border-zinc-300 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => handleQtyChange(effectiveQty - (product.minOrderQuantity || 1))}
                          className="p-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={effectiveQty}
                          onChange={(e) => handleQtyChange(Number(e.target.value))}
                          className="w-16 text-center text-xs font-black text-zinc-900 focus:outline-none"
                        />
                        <button
                          onClick={() => handleQtyChange(effectiveQty + (product.minOrderQuantity || 1))}
                          className="p-2 hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs font-bold text-zinc-500">{product.unit}s</span>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="text-[10px] text-zinc-400 font-bold uppercase block">Estimated Subtotal</span>
                      <span className="text-lg font-black text-emerald-950">
                        {itemSubtotal.toLocaleString()} ETB
                      </span>
                    </div>
                  </div>

                  {/* Dual Action Buttons: Pay Directly OR Add to Cart */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* PRIMARY ACTION 1: PAY DIRECTLY & LOCK ESCROW */}
                    <button
                      onClick={() => setIsDirectPayMode(true)}
                      className="py-3 px-4 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer group"
                    >
                      <Zap className="h-4 w-4 text-amber-300 fill-amber-300 group-hover:scale-110 transition-transform" />
                      <span>{t.realPayment.payDirectlyBtn}</span>
                    </button>

                    {/* PRIMARY ACTION 2: ADD TO CART */}
                    <button
                      onClick={handleAddToCartClick}
                      disabled={addedSuccess}
                      className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        addedSuccess
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      {addedSuccess ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-400" />
                          <span>Added to Cart!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>{t.home.quickProcurementTitle ? 'Add to Cart' : 'Add to Cart'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Embedded Ethiopian Multi-Channel Payment Gateway Modal for Direct Purchase */}
      {isPaymentModalOpen && (
        <EthiopianPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amountEtb={grandTotalEtb}
          orderDescription={`Direct Purchase: ${effectiveQty} ${product.unit}s of ${product.name}`}
          contactName={contactName}
          contactPhone={contactPhone}
          onPaymentSuccess={handlePaymentModalSuccess}
          isDirectFarmerPickup={isDirectFarmerPickup}
          deliveryFeeEtb={deliveryFee}
        />
      )}
    </>
  );
};
