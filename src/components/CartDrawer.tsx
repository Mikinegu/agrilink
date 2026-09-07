import React, { useState } from 'react';
import {
  X,
  Trash2,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Phone,
  User as UserIcon,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { CartItem } from '../types/index.ts';
import { EthiopianPaymentModal } from './EthiopianPaymentModal.tsx';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  subtotalEtb: number;
  deliveryFeeEtb: number;
  serviceFeeEtb: number;
  grandTotalEtb: number;
  onUpdateQuantity: (itemId: number, newQty: number) => void;
  onRemoveItem: (itemId: number) => void;
  onClearCart: () => void;
  onOrderSuccess: (order: any) => void;
  currentUser?: any;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotalEtb,
  deliveryFeeEtb,
  serviceFeeEtb,
  grandTotalEtb,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderSuccess,
  currentUser,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [deliveryModel, setDeliveryModel] = useState<'DIRECT' | 'HUB_CROSS_DOCK'>('DIRECT');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryRegion, setDeliveryRegion] = useState('Addis Ababa');
  const [deliveryZone, setDeliveryZone] = useState('');
  const [deliveryWoreda, setDeliveryWoreda] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [tinNumber, setTinNumber] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleValidateCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!contactName.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!contactPhone.trim() || contactPhone.replace(/\D/g, '').length < 9) {
      setFormError('Please enter a valid Phone Number (e.g. 0961123330).');
      return;
    }
    if (!deliveryAddress.trim()) {
      setFormError('Please enter your Delivery Address or Landmark.');
      return;
    }
    // Open the payment selector modal
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (provider: string, accountNumber: string, txRef: string) => {
    setShowPaymentModal(false);
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress,
          deliveryRegion,
          deliveryZone: deliveryZone || 'Zone 01',
          deliveryWoreda: deliveryWoreda || 'Woreda 01',
          deliveryContactName: contactName,
          deliveryContactPhone: contactPhone,
          deliveryModel,
          hubId: deliveryModel === 'HUB_CROSS_DOCK' ? 1 : null,
          nationalIdNumber: nationalIdNumber || undefined,
          tinNumber: tinNumber || undefined,
          payerAccountNumber: accountNumber,
          notes: orderNotes || undefined,
          paymentMethod: provider,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletedOrder(data.order);
        setStep('success');
        onOrderSuccess(data.order);
      } else {
        const err = await res.json();
        setFormError(err.error || 'Order creation failed after payment. Contact support.');
        setStep('checkout');
      }
    } catch {
      setFormError('Network error. Please contact support with your transaction reference: ' + txRef);
      setStep('checkout');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-zinc-950/60 backdrop-blur-xs flex justify-end">
        <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between relative animate-in slide-in-from-right duration-200">

          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 block">
                AgriLink Procurement & Escrow
              </span>
              <h2 className="text-lg font-black text-zinc-900">
                {step === 'cart'     && `Order Cart (${cartItems.length} items)`}
                {step === 'checkout' && 'Delivery Details'}
                {step === 'success'  && 'Payment Verified & Confirmed'}
              </h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 text-zinc-600 transition-colors cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">

            {/* -- Cart Step -- */}
            {step === 'cart' && (
              <>
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                      <Truck className="h-8 w-8" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900">Your cart is empty</h3>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto">
                      Browse verified fresh crops or agricultural inputs from certified Ethiopian producers.
                    </p>
                    <button onClick={onClose} className="mt-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer">
                      Start Sourcing Produce
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      const title   = item.itemType === 'PRODUCE' ? item.product?.name       : item.inputProduct?.name;
                      const grade   = item.itemType === 'PRODUCE' ? item.product?.grade      : item.inputProduct?.brand;
                      const unit    = item.itemType === 'PRODUCE' ? item.product?.unit       : item.inputProduct?.unit;
                      const img     = (item.itemType === 'PRODUCE' ? item.product?.images?.[0] : item.inputProduct?.images?.[0])
                                    || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80';
                      return (
                        <div key={item.id} className="p-3.5 rounded-xl border border-zinc-200 bg-white flex gap-3.5 shadow-2xs items-center">
                          <img src={img} alt="" className="h-16 w-16 rounded-lg object-cover border border-zinc-200 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-zinc-900 truncate">{title || 'Agricultural Item'}</h4>
                            <span className="text-[10px] text-emerald-800 font-semibold block">{grade?.replace(/_/g, ' ')}</span>
                            <span className="text-xs font-extrabold text-zinc-900">
                              {item.unitPriceEtb.toLocaleString()} ETB <span className="text-[10px] font-normal text-zinc-400">/{unit}</span>
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center border border-zinc-300 rounded-lg overflow-hidden bg-zinc-50">
                              <button onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-2 py-0.5 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer">-</button>
                              <span className="px-2 text-xs font-bold text-zinc-900">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 hover:bg-zinc-200 text-xs font-bold text-zinc-700 cursor-pointer">+</button>
                            </div>
                            <button onClick={() => onRemoveItem(item.id)} className="text-zinc-400 hover:text-rose-600 transition-colors p-1 cursor-pointer">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* -- Checkout Step -- */}
            {step === 'checkout' && (
              <form id="checkout-form" onSubmit={handleValidateCheckout} className="space-y-5">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />{formError}
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4 text-emerald-700" /> Contact Information
                  </span>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Full Name <span className="text-rose-600">*</span></label>
                    <input type="text" required value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="e.g. Abebe Balcha"
                      className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Phone Number <span className="text-rose-600">*</span></label>
                    <div className="relative">
                      <input type="tel" required value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="e.g. 0961123330"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600" />
                      <Phone className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                {/* Delivery Location */}
                <div className="space-y-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-700" /> Delivery Location
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Region</label>
                      <select value={deliveryRegion} onChange={(e) => setDeliveryRegion(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600">
                        <option>Addis Ababa</option>
                        <option>Oromia</option>
                        <option>Amhara</option>
                        <option>Sidama</option>
                        <option>Dire Dawa</option>
                        <option>Tigray</option>
                        <option>SNNPR</option>
                        <option>Somali</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Sub-City / Zone</label>
                      <input type="text" value={deliveryZone} onChange={(e) => setDeliveryZone(e.target.value)} placeholder="e.g. Bole"
                        className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Woreda</label>
                      <input type="text" value={deliveryWoreda} onChange={(e) => setDeliveryWoreda(e.target.value)} placeholder="e.g. 03"
                        className="w-full px-2 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-700 block mb-1">Street Address / Landmark <span className="text-rose-600">*</span></label>
                    <input type="text" required value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="e.g. Near Medhanealem Mall, House #412"
                      className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600" />
                  </div>
                </div>

                {/* Logistics Model */}
                <div>
                  <label className="text-xs font-bold text-zinc-900 block mb-2">Logistics Model</label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button type="button" onClick={() => setDeliveryModel('DIRECT')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${deliveryModel === 'DIRECT' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                      <Truck className="h-4 w-4 mb-1 text-emerald-700" />
                      <span className="text-xs block font-bold text-zinc-900">Direct Delivery</span>
                      <span className="text-[10px] text-zinc-500">Farm ? Buyer Address</span>
                    </button>
                    <button type="button" onClick={() => setDeliveryModel('HUB_CROSS_DOCK')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${deliveryModel === 'HUB_CROSS_DOCK' ? 'border-emerald-600 bg-emerald-50/70 ring-1 ring-emerald-600' : 'border-zinc-200 bg-white hover:bg-zinc-50'}`}>
                      <Building2 className="h-4 w-4 mb-1 text-emerald-700" />
                      <span className="text-xs block font-bold text-zinc-900">Hub Cross-Docking</span>
                      <span className="text-[10px] text-zinc-500">Addis Cold-Hub</span>
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Order Notes (optional)</label>
                  <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)} rows={2} placeholder="Ripeness preference, gate instructions, etc."
                    className="w-full px-3 py-2 bg-white border border-zinc-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 resize-none" />
                </div>
              </form>
            )}

            {/* -- Success Step -- */}
            {step === 'success' && completedOrder && (
              <div className="py-4 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900">Order Active & Driver Dispatched</h3>
                  <p className="text-xs text-zinc-600">
                    Order <span className="font-mono font-bold text-zinc-900">#{completedOrder.orderNumber}</span>
                  </p>
                </div>

                <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-700 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold border-b border-zinc-800 pb-2">
                    <MessageSquare className="h-4 w-4" /> SMS Confirmation Sent
                  </div>
                  <p className="text-xs text-zinc-200 font-mono leading-relaxed">
                    Dear <strong>{completedOrder.deliveryContactName}</strong>, your payment of{' '}
                    <strong className="text-emerald-400">{Number(completedOrder.grandTotalEtb).toLocaleString()} ETB</strong>{' '}
                    is confirmed for Order #{completedOrder.orderNumber}. Driver dispatched to{' '}
                    <strong>{completedOrder.deliveryAddress}</strong>. ETA: 24�48 hrs. AgriLink.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2">
                  <div className="flex justify-between"><span className="text-zinc-500">Total Paid:</span><span className="font-extrabold text-zinc-900">{Number(completedOrder.grandTotalEtb).toLocaleString()} ETB</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Delivery To:</span><span className="font-semibold text-zinc-800">{completedOrder.deliveryAddress}</span></div>
                  <div className="flex justify-between"><span className="text-zinc-500">Logistics:</span><span className="font-bold text-emerald-700">Driver Assigned & In Transit</span></div>
                </div>

                <button onClick={() => { setStep('cart'); onClose(); }} className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-md">
                  Done � View Active Deliveries
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && step !== 'success' && (
            <div className="p-4 sm:p-6 bg-zinc-50 border-t border-zinc-200 space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span><span className="font-bold text-zinc-900">{subtotalEtb.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between">
                  <span>Logistics</span>
                  <span className="font-bold text-zinc-900">{deliveryFeeEtb === 0 ? <span className="text-emerald-700">Free (Bulk)</span> : `${deliveryFeeEtb.toLocaleString()} ETB`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (2%)</span><span className="font-bold text-zinc-900">{serviceFeeEtb.toLocaleString()} ETB</span>
                </div>
                <div className="pt-2 border-t border-zinc-200 flex justify-between text-sm font-black text-emerald-950">
                  <span>Total</span><span>{grandTotalEtb.toLocaleString()} ETB</span>
                </div>
              </div>

              {step === 'cart' ? (
                <>
                  {!currentUser ? (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
                      <p className="text-sm font-bold text-amber-900">Sign in to place your order</p>
                      <p className="text-xs text-amber-700">You need an account to checkout and track your delivery.</p>
                      <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                      >
                        Sign In / Register to Continue
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setStep('checkout')}
                      className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer">
                      Proceed to Checkout <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep('cart')} className="w-1/3 py-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-800 font-bold text-xs cursor-pointer">Back</button>
                  <button form="checkout-form" type="submit" disabled={submitting}
                    className="w-2/3 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60">
                    <ShieldCheck className="h-4 w-4" /> Choose Payment Method <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Ethiopian Payment Modal � rendered outside the drawer */}
      <EthiopianPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amountEtb={grandTotalEtb}
        orderDescription={`${cartItems.length} item${cartItems.length !== 1 ? 's' : ''} � AgriLink Order`}
        contactName={contactName}
        contactPhone={contactPhone}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};
