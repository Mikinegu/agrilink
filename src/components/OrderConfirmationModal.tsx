import React, { useState } from 'react';
import {
  CheckCircle2,
  Truck,
  ShieldCheck,
  Download,
  Printer,
  X,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  MessageSquare,
  QrCode,
  Building2,
  Calendar,
  Layers,
  Phone,
} from 'lucide-react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onTrackOrder?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  order,
  onTrackOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'receipt' | 'sms'>('details');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyOrderNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber || 'ORD-2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[92vh]">
        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-zinc-950 to-teal-950 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Escrow Payment Guaranteed
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">Order Confirmed & Active</h3>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Order ID:</span>
              <button
                onClick={handleCopyOrderNumber}
                className="font-mono font-bold text-emerald-300 bg-emerald-900/60 px-2 py-0.5 rounded-lg border border-emerald-700/60 hover:bg-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                title="Click to copy"
              >
                <span>#{order.orderNumber || 'ORD-9821'}</span>
                {copied && <span className="text-[10px] text-emerald-200">✓ Copied</span>}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-zinc-400">Amount Paid:</span>
              <span className="font-extrabold text-emerald-300">
                {Number(order.grandTotalEtb || 0).toLocaleString()} ETB
              </span>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-200 bg-zinc-50 px-6 pt-2 gap-4 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'details'
                ? 'border-b-2 border-emerald-700 text-emerald-950 font-black'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Truck className="h-4 w-4" />
            <span>Fulfillment & Dispatch</span>
          </button>
          <button
            onClick={() => setActiveTab('receipt')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'receipt'
                ? 'border-b-2 border-emerald-700 text-emerald-950 font-black'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Official Escrow VAT Receipt</span>
          </button>
          <button
            onClick={() => setActiveTab('sms')}
            className={`pb-2.5 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sms'
                ? 'border-b-2 border-emerald-700 text-emerald-950 font-black'
                : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Carrier SMS Dispatch</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'details' && (
            <div className="space-y-5">
              {/* Real-time Logistics Pipeline Stepper */}
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Live Logistics Telemetry
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-[11px]">
                    ● DISPATCHING REEFER FLEET
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-2 text-center text-[11px]">
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-emerald-600"></div>
                    <span className="font-bold text-emerald-900 block">Payment Locked</span>
                    <span className="text-[10px] text-zinc-400">Escrow Secured</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-emerald-600 animate-pulse"></div>
                    <span className="font-bold text-emerald-900 block">Driver Assigned</span>
                    <span className="text-[10px] text-zinc-400">Addis Cold Hub</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-zinc-200"></div>
                    <span className="font-semibold text-zinc-500 block">Cross-Docking</span>
                    <span className="text-[10px] text-zinc-400">Pre-Cooled</span>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 rounded-full bg-zinc-200"></div>
                    <span className="font-semibold text-zinc-500 block">Final Dropoff</span>
                    <span className="text-[10px] text-zinc-400">{order.deliveryRegion || 'Addis Ababa'}</span>
                  </div>
                </div>
              </div>

              {/* Order Information Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
                  <span className="font-bold text-zinc-900 block flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-emerald-700" /> Destination
                  </span>
                  <p className="font-semibold text-zinc-800">{order.deliveryAddress || 'Commercial Address'}</p>
                  <p className="text-zinc-500 text-[11px]">
                    {order.deliveryWoreda ? `${order.deliveryWoreda}, ` : ''}{order.deliveryZone || 'Zone 01'}, {order.deliveryRegion || 'Addis Ababa'}
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2">
                  <span className="font-bold text-zinc-900 block flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-emerald-700" /> Recipient Details
                  </span>
                  <p className="font-semibold text-zinc-800">{order.deliveryContactName || 'Buyer'}</p>
                  <p className="font-mono text-zinc-600 text-[11px]">{order.deliveryContactPhone || '0961123330'}</p>
                </div>
              </div>

              {/* Action Call to Track */}
              {onTrackOrder && (
                <div className="p-4 rounded-2xl bg-emerald-950 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg border border-emerald-800">
                  <div className="space-y-1 text-center sm:text-left">
                    <h4 className="text-sm font-bold text-white">Track Refrigerated Fleet in Real Time</h4>
                    <p className="text-xs text-emerald-200/80">
                      View real-time sensor temperature (3.8°C), GPS corridor speed, and route ETA.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onTrackOrder();
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs cursor-pointer transition-all flex items-center gap-2 shrink-0 shadow-md"
                  >
                    <span>Launch Logistics Radar</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="p-6 rounded-2xl border border-zinc-200 bg-white text-zinc-900 space-y-5 shadow-xs font-mono text-xs">
              {/* Receipt Header */}
              <div className="flex items-center justify-between border-b border-zinc-300 pb-4 font-sans">
                <div className="flex items-center gap-3">
                  <img src={agrilinkLogo} alt="Logo" className="h-10 w-10 rounded-full border border-zinc-300 object-cover" />
                  <div>
                    <h4 className="font-black text-sm text-zinc-950">AGRILINK ETHIOPIA ESCROW TRUST</h4>
                    <p className="text-[10px] text-zinc-500">Ministry of Agriculture & ECX Registered Marketplace</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">TIN: 0098124401</span>
                  <span className="text-[10px] text-emerald-700 font-bold">VAT RECEIPT #VAT-{order.orderNumber}</span>
                </div>
              </div>

              {/* Receipt Details */}
              <div className="space-y-1.5 text-zinc-700 text-[11px]">
                <div className="flex justify-between">
                  <span>Date / Time:</span>
                  <span className="font-bold">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span className="font-bold">{order.deliveryContactName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phone Number:</span>
                  <span className="font-bold">{order.deliveryContactPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Gateway:</span>
                  <span className="font-bold">Telebirr / CBE Escrow Switch</span>
                </div>
              </div>

              {/* Line items total */}
              <div className="border-t border-b border-dashed border-zinc-300 py-3 space-y-1.5">
                <div className="flex justify-between font-sans">
                  <span>Escrow Grand Total (ETB):</span>
                  <span className="font-black text-sm text-zinc-950">
                    {Number(order.grandTotalEtb || 0).toLocaleString()} ETB
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Quality Inspection & Cold-Chain:</span>
                  <span>Included</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-sans">
                  <QrCode className="h-8 w-8 text-zinc-800" />
                  <div>
                    <p className="font-bold text-zinc-900">QR Traceability Validated</p>
                    <p>Scanned at Addis Ababa Central Hub</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer font-sans"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Receipt
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sms' && (
            <div className="space-y-4">
              <div className="p-5 bg-zinc-950 text-white rounded-2xl border border-zinc-800 shadow-xl space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <MessageSquare className="h-4 w-4" />
                    <span>Ethio Telecom Carrier SMS (127 / Telebirr)</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Just Now</span>
                </div>

                <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 font-mono text-xs text-zinc-200 leading-relaxed">
                  Dear <strong>{order.deliveryContactName}</strong>, your payment of{' '}
                  <strong className="text-emerald-400">{Number(order.grandTotalEtb || 0).toLocaleString()} ETB</strong>{' '}
                  is confirmed in Escrow for Order #{order.orderNumber}. Cold-chain driver dispatched to{' '}
                  <strong>{order.deliveryAddress}</strong>. ETA: 3-5 Hours. Helpline: 0961123330.
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400">
                  <span>Receiver: {order.deliveryContactPhone}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Carrier Delivered
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-zinc-500 hidden sm:inline">
            Escrow funds released only upon certified receipt inspection.
          </span>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold ml-auto cursor-pointer"
          >
            Close & Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};
