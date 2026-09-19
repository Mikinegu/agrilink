import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  TrendingUp,
  Package,
  Truck,
  Award,
  Sparkles,
  RefreshCw,
  Database,
  Layers,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  CreditCard,
  Phone,
  MapPin,
  FileText,
  Eye,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Printer,
  X,
  ArrowUpRight,
  Building2,
  Calendar,
  Wallet,
  ShieldCheck,
  QrCode,
  Tag,
  UserCheck,
  CircleDot,
  Volume2,
  VolumeX,
  Download,
  Zap,
  Snowflake,
  Bot,
  Radio,
} from 'lucide-react';
import { User, Order, Payment, Product } from '../types/index.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';

interface AdminPortalProps {
  currentUser: User | null;
  onRefreshAll: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onRefreshAll,
}) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'payments' | 'produce' | 'users' | 'analytics'>('orders');
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Smart AI & Automation State
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

  // Admin Presence & Autonomous AI Payment Controller ("Admin Away Protocol")
  const [aiControllerStatus, setAiControllerStatus] = useState<any>(null);
  const [presenceUpdating, setPresenceUpdating] = useState(false);
  const [rejectModalPayment, setRejectModalPayment] = useState<any | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<any | null>(null);
  const [actionInProgressId, setActionInProgressId] = useState<number | null>(null);
  const [showAiAuditDrawer, setShowAiAuditDrawer] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);

  // Web Audio API Order Alert Chime (synthesized pleasant 2-tone melodic frequency)
  const playOrderChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // Audio playback prevented by browser autoplay policy until user interaction
    }
  };

  const fetchAdminData = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [ovRes, ordRes, payRes, usrRes, prodRes, aiRes, aiCtrlRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/payments'),
        fetch('/api/auth/users'),
        fetch('/api/products'),
        fetch('/api/admin/ai-insights'),
        fetch('/api/admin/ai-controller/status'),
      ]);

      if (ovRes.ok) setMetrics(await ovRes.json());
      if (ordRes.ok) {
        const freshOrders = await ordRes.json();
        setOrdersList(freshOrders);
        if (lastOrderCount > 0 && freshOrders.length > lastOrderCount) {
          const newest = freshOrders[0];
          playOrderChime();
          showFeedback(`⚡ New Order Received! #${newest.orderNumber} (${newest.grandTotalEtb?.toLocaleString()} ETB)`);
        }
        setLastOrderCount(freshOrders.length);
      }
      if (payRes.ok) setPaymentsList(await payRes.json());
      if (usrRes.ok) setAllUsers(await usrRes.json());
      if (prodRes.ok) setProductsList(await prodRes.json());
      if (aiRes.ok) setAiInsights(await aiRes.json());
      if (aiCtrlRes && aiCtrlRes.ok) setAiControllerStatus(await aiCtrlRes.json());
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // Real-time Admin Heartbeat: signals admin presence while browser tab is active
  useEffect(() => {
    const sendHeartbeat = async () => {
      try {
        await fetch('/api/admin/ai-controller/heartbeat', { method: 'POST' });
      } catch {}
    };
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 15000); // Heartbeat every 15s
    window.addEventListener('focus', sendHeartbeat);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', sendHeartbeat);
    };
  }, []);

  useEffect(() => {
    fetchAdminData(false);

    // Real-time background sync polling every 6 seconds
    const interval = setInterval(() => {
      fetchAdminData(true);
    }, 6000);

    return () => clearInterval(interval);
  }, [lastOrderCount, soundEnabled]);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 5000);
  };

  const handleSeedDatabase = async () => {
    if (!confirm('Re-seed the database with fresh authentic Ethiopian farmer crops and active buyer orders?')) return;
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      if (res.ok) {
        showFeedback('Database refreshed with verified farmer harvests and orders!');
        await fetchAdminData();
        onRefreshAll();
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Smart 1-Click Auto Dispatch Single Order
  const handleAutoDispatch = async (orderId: number) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/auto-dispatch`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`⚡ Smart Auto-Dispatched #${data.order.orderNumber} via ${data.corridor} with Driver ${data.driver?.fullName || 'Assigned Carrier'}!`);
        await fetchAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        showFeedback(data.error || 'Failed to auto-dispatch order');
      }
    } catch (err) {
      console.error('Auto dispatch error:', err);
    }
  };

  // Smart Batch Auto Dispatch All Eligible Pending Orders
  const handleBatchDispatch = async () => {
    const eligibleCount = ordersList.filter(
      (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY_FOR_PICKUP'
    ).length;

    if (eligibleCount === 0) {
      showFeedback('No pending orders requiring dispatch right now.');
      return;
    }

    if (!confirm(`Execute Smart 1-Click Auto-Dispatch for all ${eligibleCount} confirmed customer orders?`)) return;

    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/admin/orders/batch-dispatch', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || `Successfully dispatched ${data.count} orders!`);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Batch dispatch error:', err);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Smart Batch Release Escrow Payouts for Delivered Orders
  const handleBatchReleaseEscrow = async () => {
    const deliveredCount = ordersList.filter(
      (o) => o.orderStatus === 'DELIVERED' && o.paymentStatus !== 'RELEASED_TO_FARMER'
    ).length;

    if (deliveredCount === 0) {
      showFeedback('All delivered orders have already had escrow released to farmers.');
      return;
    }

    if (!confirm(`Settle escrow payout for all ${deliveredCount} delivered orders and release funds to farmers?`)) return;

    setIsBatchProcessing(true);
    try {
      const res = await fetch('/api/admin/orders/batch-release-escrow', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || `Released escrow for ${data.count} orders!`);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Batch escrow error:', err);
    } finally {
      setIsBatchProcessing(false);
    }
  };

  // Export Filtered Orders as Clean CSV Spreadsheet
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      showFeedback('No orders to export with current filters.');
      return;
    }

    const headers = [
      'Order Number',
      'Order Date',
      'Buyer Name',
      'Phone',
      'Delivery Address',
      'Payment Status',
      'Payment Provider',
      'Transaction Ref',
      'Fulfillment Status',
      'Subtotal ETB',
      'Service Fee ETB',
      'Delivery Fee ETB',
      'Grand Total ETB',
      'Items Summary',
      'AI Risk Score',
      'Logistics Corridor',
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString().split('T')[0]}"`,
      `"${(o.buyerName || o.deliveryContactName || '').replace(/"/g, '""')}"`,
      `"${o.deliveryContactPhone || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.paymentStatus}"`,
      `"${o.payment?.provider || ''}"`,
      `"${o.payment?.transactionRef || ''}"`,
      `"${o.orderStatus}"`,
      o.totalAmountEtb,
      o.serviceFeeEtb || 0,
      o.deliveryFeeEtb || 0,
      o.grandTotalEtb,
      `"${(o.items || []).map((i) => `${i.quantity}x ${i.name}`).join('; ').replace(/"/g, '""')}"`,
      `"${o.smartScore?.riskScore ? `${o.smartScore.riskScore}% (${o.smartScore.riskLevel})` : '99% (LOW)'}"`,
      `"${o.smartScore?.routeRecommendation || 'Addis-Adama Expressway'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AgriLink_Orders_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showFeedback(`Exported ${filteredOrders.length} orders to CSV successfully.`);
  };

  // Update Payment Status
  const handleUpdatePaymentStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: status }),
      });
      if (res.ok) {
        showFeedback(`Payment status updated to "${status}" successfully.`);
        await fetchAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          const updated = ordersList.find((o) => o.id === orderId);
          if (updated) setSelectedOrder({ ...updated, paymentStatus: status as any });
        }
      }
    } catch (err) {
      console.error('Payment update error:', err);
    }
  };

  // Update Dispatch / Order Status
  const handleUpdateOrderStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/dispatch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: status }),
      });
      if (res.ok) {
        showFeedback(`Fulfillment status updated to "${status}".`);
        await fetchAdminData();
        if (selectedOrder && selectedOrder.id === orderId) {
          const updated = ordersList.find((o) => o.id === orderId);
          if (updated) setSelectedOrder({ ...updated, orderStatus: status as any });
        }
      }
    } catch (err) {
      console.error('Order status update error:', err);
    }
  };

  // Presence Toggle (Human Control vs. AI Auto-Pilot)
  const handleTogglePresence = async (newMode: 'HUMAN_CONTROL' | 'AI_AUTOPILOT') => {
    setPresenceUpdating(true);
    try {
      const isHumanPresent = newMode === 'HUMAN_CONTROL';
      const res = await fetch('/api/admin/ai-controller/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode, isHumanPresent }),
      });
      if (res.ok) {
        showFeedback(
          newMode === 'HUMAN_CONTROL'
            ? '👤 Human Admin Presence Confirmed. AI Assistant in STANDBY mode.'
            : '🤖 AI Auto-Pilot Engaged! AI Assistant is now autonomously evaluating and passing incoming payments.'
        );
        await fetchAdminData(true);
      }
    } catch (err) {
      console.error('Failed to toggle presence:', err);
    } finally {
      setPresenceUpdating(false);
    }
  };

  // Human Admin Manually Passes / Accepts Payment
  const handlePassPayment = async (paymentId: number) => {
    setActionInProgressId(paymentId);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes: 'Manually verified and accepted by Human Admin Desk' }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`✅ Payment #${paymentId} accepted and passed! Order confirmed.`);
        await fetchAdminData(true);
        onRefreshAll();
      } else {
        alert(data.error || 'Failed to pass payment');
      }
    } catch (err: any) {
      alert(err.message || 'Error passing payment');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Human Admin Rejects Payment
  const handleRejectPayment = async () => {
    if (!rejectModalPayment) return;
    setActionInProgressId(rejectModalPayment.id);
    try {
      const res = await fetch(`/api/admin/payments/${rejectModalPayment.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: rejectReason || 'Payment verification failed during human audit.' }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(`❌ Payment #${rejectModalPayment.id} rejected.`);
        setRejectModalPayment(null);
        setRejectReason('');
        await fetchAdminData(true);
        onRefreshAll();
      } else {
        alert(data.error || 'Failed to reject payment');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting payment');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Filtered Orders
  const filteredOrders = ordersList.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      ord.orderNumber.toLowerCase().includes(q) ||
      (ord.buyerName && ord.buyerName.toLowerCase().includes(q)) ||
      ord.deliveryContactName.toLowerCase().includes(q) ||
      ord.deliveryContactPhone.includes(q) ||
      ord.deliveryAddress.toLowerCase().includes(q) ||
      (ord.payment?.transactionRef && ord.payment.transactionRef.toLowerCase().includes(q)) ||
      (ord.items && ord.items.some((it) => it.name.toLowerCase().includes(q)));

    const matchesStatus = selectedStatusFilter === 'ALL' || ord.orderStatus === selectedStatusFilter;
    const matchesPayment = selectedPaymentFilter === 'ALL' || ord.paymentStatus === selectedPaymentFilter;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const getPaymentStatusBadge = (status: string, p?: any) => {
    switch (status) {
      case 'PAID':
        if (p?.passedBy === 'AI_ASSISTANT') {
          return (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs cursor-pointer hover:bg-indigo-100 transition-colors"
              onClick={() => setSelectedAuditLog(p)}
              title={p.aiReason || 'Autonomously verified & passed by AI Assistant'}
            >
              <Bot className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              <span>Passed by AI</span>
            </span>
          );
        }
        if (p?.passedBy === 'HUMAN_ADMIN') {
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span>Passed by Admin</span>
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> {t.adminPortal.statusPaid}
          </span>
        );
      case 'ESCROW_HELD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="h-3 w-3 text-blue-600" /> {t.adminPortal.statusEscrowHeld}
          </span>
        );
      case 'RELEASED_TO_FARMER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
            <Wallet className="h-3 w-3 text-teal-600" /> {t.adminPortal.statusSettledFarmer}
          </span>
        );
      case 'PENDING_APPROVAL':
      case 'PENDING':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="h-3 w-3 text-amber-600" /> Pending Admin Pass
          </span>
        );
      case 'FLAGGED_SUSPICIOUS':
        return (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 cursor-pointer hover:bg-rose-100 transition-colors"
            onClick={() => setSelectedAuditLog(p)}
            title={p.aiReason || 'Flagged by AI Assistant for manual investigation'}
          >
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600" /> Flagged by AI
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="h-3 w-3 text-rose-600" /> Rejected by Admin
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="h-3 w-3 text-rose-600" /> REFUNDED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-300">
            {status}
          </span>
        );
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" /> {t.adminPortal.statusDelivered}
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 animate-pulse">
            <Truck className="h-3 w-3" /> {t.adminPortal.statusInTransit}
          </span>
        );
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="h-3 w-3" /> {t.adminPortal.statusDispatched}
          </span>
        );
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" /> {t.adminPortal.statusPreparing}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Toast Alert Feedback */}
      {actionSuccessMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 border border-emerald-500 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-300" />
          <span className="text-xs font-bold">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Owner Header */}
      <div className="bg-gradient-to-r from-zinc-950 via-emerald-950 to-zinc-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden border border-emerald-800/40">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldAlert className="h-4 w-4 text-emerald-400" /> {t.adminPortal.commandCenterBadge}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              {t.adminPortal.title}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              {t.adminPortal.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <LanguageSelector variant="pill" theme="dark" className="bg-emerald-950/70 border border-emerald-400/30 text-emerald-100" />
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playOrderChime();
                showFeedback(next ? '🔊 Audio order chimes enabled' : '🔇 Audio chimes muted');
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border ${
                soundEnabled
                  ? 'bg-emerald-900/60 border-emerald-400/40 text-emerald-300 hover:bg-emerald-800/80'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:bg-zinc-700/80'
              }`}
              title={soundEnabled ? 'Order sound alert active (Click to mute)' : 'Order sound muted (Click to unmute)'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
              <span>{soundEnabled ? 'Chime ON' : 'Muted'}</span>
            </button>
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Database className="h-4 w-4" /> {seeding ? t.adminPortal.seedingBtn : t.adminPortal.refreshDbBtn}
            </button>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-inner">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live DB Sync</span>
            </div>
            <button
              onClick={() => fetchAdminData(false)}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-all"
              title={t.adminPortal.refreshLiveTooltip}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Top Executive Metrics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">{t.adminPortal.gmvTitle}</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-zinc-950 mt-1 block">
            {metrics ? (metrics.gmvEtb || 0).toLocaleString() : '1,240,000'} <span className="text-xs font-bold text-zinc-500">{t.common.currency}</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> {t.adminPortal.escrowProtected}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">{t.adminPortal.collectedPaymentsTitle}</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-950 mt-1 block">
            {metrics ? (metrics.totalPaidAmountEtb || metrics.gmvEtb || 0).toLocaleString() : '1,120,000'} <span className="text-xs font-bold text-zinc-500">{t.common.currency}</span>
          </span>
          <span className="text-[11px] text-blue-700 font-medium mt-1.5 block">
            {t.adminPortal.paymentChannels}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">{t.adminPortal.totalOrdersTitle}</span>
            <Package className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-zinc-900 mt-1 block">
            {ordersList.length || (metrics ? metrics.totalOrdersCount : 0)} {t.adminPortal.ordersSuffix}
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> {ordersList.filter((o) => o.orderStatus === 'DELIVERED').length} {t.adminPortal.deliveredSuffix}
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">{t.adminPortal.platformFeeTitle}</span>
            <Award className="h-4 w-4 text-teal-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-teal-950 mt-1 block">
            {metrics ? (metrics.platformRevenueEtb || 0).toLocaleString() : '24,800'} <span className="text-xs font-bold text-zinc-500">{t.common.currency}</span>
          </span>
          <span className="text-[11px] text-zinc-500 font-medium mt-1.5 block">
            {t.adminPortal.feeDescription}
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'orders'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>{t.adminPortal.tabOrders}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-bold">
            {ordersList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'payments'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>{t.adminPortal.tabPayments}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[10px] font-bold">
            {paymentsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('produce')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'produce'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Tag className="h-4 w-4" />
          <span>{t.adminPortal.tabProduce}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold">
            {productsList.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'users'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{t.adminPortal.tabUsers}</span>
          <span className="px-1.5 py-0.2 rounded-md bg-zinc-200 text-zinc-800 text-[10px] font-bold">
            {allUsers.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. ORDERS & CUSTOMERS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          {/* AI Market Intelligence & Logistics Copilot */}
          <div className="bg-gradient-to-br from-zinc-950 via-slate-900 to-emerald-950 rounded-3xl p-5 sm:p-6 text-white border border-emerald-500/30 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 shadow-inner shrink-0">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-black tracking-wide text-white">
                      AgriLink AI Copilot & Market Intelligence
                    </h3>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      99.4% Platform Health
                    </span>
                  </div>
                  <p className="text-xs text-zinc-300 mt-1 max-w-3xl leading-relaxed">
                    {aiInsights?.aiSummary || 'Real-time telemetry matching smallholder crop yields, cold-chain trucks, and escrow vaults across Ethiopia.'}
                  </p>
                </div>
              </div>

              {/* Health KPI Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[11px]">
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold">Cold-Chain</span>
                  <span className="font-black text-cyan-300 flex items-center gap-1">
                    <Snowflake className="h-3 w-3" /> 100% On-Time
                  </span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[11px]">
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold">Escrow Solvency</span>
                  <span className="font-black text-emerald-300 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> 100% Backed
                  </span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10 text-[11px]">
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold">Fraud Anomaly</span>
                  <span className="font-black text-amber-300">0.01% (Low)</span>
                </div>
              </div>
            </div>

            {/* Actionable Live Insights Bar */}
            {aiInsights?.actionableAlerts && aiInsights.actionableAlerts.length > 0 && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiInsights.actionableAlerts.map((alt: any) => (
                  <div
                    key={alt.id}
                    className="bg-white/5 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3 transition-all text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-emerald-300 text-xs truncate">{alt.title}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                        alt.urgency === 'HIGH' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {alt.urgency}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-300 line-clamp-2 leading-relaxed">{alt.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Smart Batch Actions Bar */}
          <div className="bg-gradient-to-r from-emerald-950/10 via-zinc-50 to-teal-950/10 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Zap className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              </div>
              <div>
                <div className="text-xs font-black text-zinc-900">Smart Logistics & Escrow Batch Automation</div>
                <div className="text-[11px] text-zinc-500">1-Click Auto-Dispatch, Bulk Farmer Settlements & Official Tax Audit Exports</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Auto-dispatch all button */}
              <button
                onClick={handleBatchDispatch}
                disabled={
                  isBatchProcessing ||
                  ordersList.filter(
                    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY_FOR_PICKUP'
                  ).length === 0
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  ordersList.filter(
                    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY_FOR_PICKUP'
                  ).length > 0
                    ? 'bg-zinc-950 hover:bg-zinc-800 text-white'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
                title="Automatically matches verified reefer/cargo drivers for all confirmed orders"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                <span>
                  Auto-Dispatch All ({ordersList.filter(
                    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.orderStatus === 'READY_FOR_PICKUP'
                  ).length})
                </span>
              </button>

              {/* Batch release escrow button */}
              <button
                onClick={handleBatchReleaseEscrow}
                disabled={
                  isBatchProcessing ||
                  ordersList.filter((o) => o.orderStatus === 'DELIVERED' && o.paymentStatus !== 'RELEASED_TO_FARMER').length === 0
                }
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  ordersList.filter((o) => o.orderStatus === 'DELIVERED' && o.paymentStatus !== 'RELEASED_TO_FARMER').length > 0
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
                title="Release escrow payment to smallholder farmers for all delivered consignments"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>
                  Settle Escrows ({ordersList.filter((o) => o.orderStatus === 'DELIVERED' && o.paymentStatus !== 'RELEASED_TO_FARMER').length})
                </span>
              </button>

              {/* Export CSV button */}
              <button
                onClick={handleExportCsv}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                title="Download Ethiopian Revenue Authority / Tax Audit CSV"
              >
                <Download className="h-3.5 w-3.5 text-zinc-500" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder={t.adminPortal.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
                >
                  {t.adminPortal.clearSearch}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {/* Order Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-700 cursor-pointer"
              >
                <option value="ALL">{t.adminPortal.allDeliveryStatuses}</option>
                <option value="CONFIRMED">{t.adminPortal.statusDispatched}</option>
                <option value="IN_TRANSIT">{t.adminPortal.statusInTransit}</option>
                <option value="DELIVERED">{t.adminPortal.statusDelivered}</option>
                <option value="PREPARING">{t.adminPortal.statusPreparing}</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-700 cursor-pointer"
              >
                <option value="ALL">{t.adminPortal.allPaymentStatuses}</option>
                <option value="PAID">{t.adminPortal.statusPaid}</option>
                <option value="ESCROW_HELD">{t.adminPortal.statusEscrowHeld}</option>
                <option value="RELEASED_TO_FARMER">{t.adminPortal.statusSettledFarmer}</option>
                <option value="PENDING">{t.adminPortal.statusPending}</option>
              </select>
            </div>
          </div>

          {/* Orders Count and Status Summary */}
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>
              {t.adminPortal.showing} <strong className="text-zinc-900">{filteredOrders.length}</strong> {t.adminPortal.of}{' '}
              <strong className="text-zinc-900">{ordersList.length}</strong> {t.adminPortal.customerOrders}
            </span>
            <span className="font-mono text-[11px] text-zinc-400">{t.adminPortal.livePostgresSync}</span>
          </div>

          {/* Orders Cards Grid / Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
              <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900">{t.adminPortal.noMatchingOrders}</h3>
              <p className="text-xs text-zinc-500 mt-1">{t.adminPortal.noMatchingOrdersSubtitle}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white rounded-2xl border border-zinc-200 hover:border-zinc-300 shadow-2xs hover:shadow-xs transition-all p-5 sm:p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-mono font-extrabold text-sm text-zinc-950">
                          {ord.orderNumber}
                        </span>
                        {getPaymentStatusBadge(ord.paymentStatus)}
                        {getOrderStatusBadge(ord.orderStatus)}
                        
                        {/* Smart AI Risk Badge */}
                        {ord.smartScore && (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              ord.smartScore.riskLevel === 'LOW'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : ord.smartScore.riskLevel === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-rose-50 text-rose-800 border-rose-300'
                            }`}
                          >
                            <ShieldCheck className="h-3 w-3" />
                            {ord.smartScore.riskScore}% AI Verified • {ord.smartScore.riskLevel} RISK
                          </span>
                        )}

                        {/* Cold Chain Indicator */}
                        {ord.smartScore?.perishabilityRisk === 'HIGH' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            <Snowflake className="h-3 w-3 text-cyan-600" /> Cold-Chain Priority
                          </span>
                        )}

                        <span className="text-[11px] text-zinc-400 font-mono">
                          • {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Who Ordered */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <div className="flex items-center gap-1 font-bold text-zinc-900">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{t.adminPortal.buyerLabel}: {ord.buyerName || ord.deliveryContactName}</span>
                          {ord.buyer?.organizationName && (
                            <span className="text-zinc-500 font-normal">({ord.buyer.organizationName})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-zinc-400" />
                          <a href={`tel:${ord.deliveryContactPhone}`} className="hover:underline text-emerald-800 font-medium">
                            {ord.deliveryContactPhone}
                          </a>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{ord.deliveryAddress}</span>
                        </div>
                      </div>

                      {/* Recommended Logistics Corridor */}
                      {ord.smartScore?.routeRecommendation && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-semibold mt-1">
                          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
                          <span>Recommended Route: <strong>{ord.smartScore.routeRecommendation}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Order Financial Amount */}
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-zinc-500 block">{t.adminPortal.totalOrderValue}</span>
                      <span className="text-xl font-black text-emerald-950">
                        {ord.grandTotalEtb.toLocaleString()} <span className="text-xs font-bold text-zinc-500">{t.common.currency}</span>
                      </span>
                      {ord.payment?.provider && (
                        <span className="text-[11px] text-zinc-500 font-medium block">
                          {t.adminPortal.viaProvider} {ord.payment.provider.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Products Ordered Breakdown */}
                  <div className="py-3">
                    <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                      {t.adminPortal.cropsInOrder} ({ord.items?.length || 0} {ord.items?.length === 1 ? t.adminPortal.itemWord : t.adminPortal.itemsWord})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {ord.items?.map((it) => (
                        <div
                          key={it.id}
                          className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 flex items-start justify-between gap-2"
                        >
                          <div>
                            <div className="font-bold text-xs text-zinc-900">{it.name}</div>
                            <div className="text-[11px] text-zinc-500">
                              {t.adminPortal.quantityLabel}: <strong className="text-zinc-800">{it.quantity} {it.unit}</strong> @ {it.unitPriceEtb} {t.common.currency}/{it.unit}
                            </div>
                            {it.lotBatchNumber && (
                              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                                {t.adminPortal.lotPrefix}: {it.lotBatchNumber}
                              </div>
                            )}
                          </div>
                          <span className="font-black text-xs text-zinc-900 whitespace-nowrap">
                            {it.subtotalEtb.toLocaleString()} {t.common.currency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Details & Quick Actions */}
                  <div className="pt-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                      {ord.payment?.transactionRef && (
                        <div className="flex items-center gap-1 font-mono text-[11px]">
                          <CreditCard className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{t.adminPortal.txRefLabel}: <strong>{ord.payment.transactionRef}</strong></span>
                        </div>
                      )}
                      {ord.payerAccountNumber && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span>{t.adminPortal.payerAcctLabel}: <strong>{ord.payerAccountNumber}</strong></span>
                        </div>
                      )}
                      {ord.tinNumber && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <span>{t.adminPortal.tinLabel}: <strong>{ord.tinNumber}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Owner Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Smart 1-Click Auto Dispatch Button */}
                      {(ord.orderStatus === 'CONFIRMED' || ord.orderStatus === 'PREPARING' || ord.orderStatus === 'READY_FOR_PICKUP') && (
                        <button
                          onClick={() => handleAutoDispatch(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-black cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                          title="Smart Auto-Dispatch: Automatically match refrigerated/cargo driver and launch transit"
                        >
                          <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Smart Auto-Dispatch
                        </button>
                      )}

                      {/* One-click Verify / Pay */}
                      {ord.paymentStatus !== 'PAID' && ord.paymentStatus !== 'RELEASED_TO_FARMER' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(ord.id, 'PAID')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> {t.adminPortal.verifyPaidBtn}
                        </button>
                      )}

                      {/* Release Escrow to Farmer */}
                      {ord.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(ord.id, 'RELEASED_TO_FARMER')}
                          className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                          title="Release escrow payment to the smallholder farmer after delivery confirmation"
                        >
                          <Wallet className="h-3.5 w-3.5" /> {t.adminPortal.releaseEscrowToFarmerBtn}
                        </button>
                      )}

                      {/* Dispatch Status Controls */}
                      {ord.orderStatus !== 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, ord.orderStatus === 'CONFIRMED' ? 'IN_TRANSIT' : 'DELIVERED')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          {ord.orderStatus === 'CONFIRMED' ? t.adminPortal.markInTransitBtn : t.adminPortal.markDeliveredBtn}
                        </button>
                      )}

                      {/* View Dossier Modal */}
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-500" /> {t.adminPortal.dossierBtn}
                      </button>

                      {/* View / Print Official Receipt */}
                      <button
                        onClick={() => setInvoiceModalOrder(ord)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                        title="View Official Ethiopian Tax Invoice & Receipt"
                      >
                        <Printer className="h-3.5 w-3.5 text-zinc-500" /> {t.adminPortal.invoiceBtn}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAYMENTS & ESCROW LEDGER TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-emerald-950 to-teal-950 rounded-2xl p-6 text-white border border-emerald-800/40">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {t.adminPortal.vaultBadge}
                </span>
                <h3 className="text-xl font-black mt-1">{t.adminPortal.paymentRailsTitle}</h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                  {t.adminPortal.paymentRailsSubtitle}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] text-zinc-300 uppercase block font-semibold">{t.adminPortal.totalEscrowVolume}</span>
                  <span className="text-lg font-black text-white">
                    {metrics ? (metrics.gmvEtb || 0).toLocaleString() : '1,240,000'} {t.common.currency}
                  </span>
                </div>
                <div className="bg-white/10 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] text-zinc-300 uppercase block font-semibold">{t.adminPortal.transactionsSettled}</span>
                  <span className="text-lg font-black text-emerald-300">{paymentsList.length} {t.adminPortal.settledCountSuffix}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-zinc-900">{t.adminPortal.ledgerTableTitle}</h3>
                <p className="text-xs text-zinc-500">{t.adminPortal.ledgerTableSubtitle}</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">{paymentsList.length} {t.adminPortal.recordsSuffix}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-4">{t.adminPortal.colTxRef}</th>
                    <th className="p-4">{t.adminPortal.colPayerCustomer}</th>
                    <th className="p-4">{t.adminPortal.colOrderNum}</th>
                    <th className="p-4">{t.adminPortal.colAmountEtb}</th>
                    <th className="p-4">{t.adminPortal.colProvider}</th>
                    <th className="p-4">{t.adminPortal.colStatus}</th>
                    <th className="p-4">{t.adminPortal.colDateTime}</th>
                    <th className="p-4 text-right">{t.adminPortal.colActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {paymentsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-mono font-bold text-zinc-950">
                        {p.transactionRef}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900">{p.userName || t.adminPortal.customerFallback}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{p.userPhone}</div>
                        {p.organizationName && (
                          <div className="text-[10px] text-zinc-400">{p.organizationName}</div>
                        )}
                      </td>
                      <td className="p-4 font-mono font-medium text-emerald-900">
                        {p.orderNumber}
                      </td>
                      <td className="p-4 font-black text-zinc-950">
                        {p.amountEtb.toLocaleString()} {t.common.currency}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
                          {p.provider}
                        </span>
                      </td>
                      <td className="p-4">
                        {getPaymentStatusBadge(p.status)}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-right">
                        {p.status === 'PAID' && (
                          <button
                            onClick={() => handleUpdatePaymentStatus(p.orderId, 'RELEASED_TO_FARMER')}
                            className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-[10px] cursor-pointer"
                          >
                            {t.adminPortal.releaseEscrowBtn}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. PRODUCE & CROPS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'produce' && (
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">{t.adminPortal.produceCatalogTitle}</h3>
              <p className="text-xs text-zinc-500">{t.adminPortal.produceCatalogSubtitle}</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{productsList.length} {t.adminPortal.activeCropsSuffix}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productsList.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs flex flex-col justify-between"
              >
                <div className="p-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                    <span className="font-mono text-[10px] bg-zinc-100 px-2 py-0.5 rounded font-bold">
                      {prod.lotBatchNumber || `LOT-${prod.id}`}
                    </span>
                    <span className="text-emerald-700 font-bold">{prod.region}</span>
                  </div>
                  <h4 className="font-bold text-sm text-zinc-900">{prod.name}</h4>
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{prod.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-zinc-400 block">{t.adminPortal.unitFarmPrice}</span>
                      <strong className="text-emerald-950 font-black text-sm">
                        {prod.pricePerUnitEtb.toLocaleString()} {t.common.currency}
                      </strong>{' '}
                      <span className="text-[10px] text-zinc-500">/{prod.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block">{t.adminPortal.stockAvailable}</span>
                      <strong className="text-zinc-900 font-bold">
                        {prod.availableQuantity} {prod.unit}s
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 px-4 py-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>{t.adminPortal.farmerLabel}: <strong className="text-zinc-800">{prod.farmerName || t.adminPortal.verifiedSmallholder}</strong></span>
                  <span className="text-emerald-700 font-bold">{t.adminPortal.gradeLabel}: {prod.grade}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. USERS & RBAC DIRECTORY TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'users' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">{t.adminPortal.usersDirectoryTitle}</h3>
              <p className="text-xs text-zinc-500">{t.adminPortal.usersDirectorySubtitle}</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{allUsers.length} {t.adminPortal.activeRecordsSuffix}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">{t.adminPortal.colUser}</th>
                  <th className="p-4">{t.adminPortal.colRole}</th>
                  <th className="p-4">{t.adminPortal.colRegionBase}</th>
                  <th className="p-4">{t.adminPortal.colOrganization}</th>
                  <th className="p-4">{t.adminPortal.colContactPhone}</th>
                  <th className="p-4">{t.adminPortal.colVerification}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-zinc-50">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="h-8 w-8 rounded-full object-cover border border-zinc-200"
                        />
                        <div>
                          <div className="font-bold text-zinc-900">{u.fullName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-zinc-700 font-medium">{u.region}</td>
                    <td className="p-4 text-zinc-700">{u.organizationName || '—'}</td>
                    <td className="p-4 text-zinc-600 font-mono">{u.phone}</td>
                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> {t.adminPortal.statusVerified}
                        </span>
                      ) : (
                        <span className="text-zinc-400">{t.adminPortal.statusStandard}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ORDER DOSSIER MODAL */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-zinc-400 font-mono">{selectedOrder.orderNumber}</span>
                <h3 className="text-lg font-black text-zinc-900">{t.adminPortal.dossierTitle}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Buyer / Customer Info */}
              <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200">
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                  {t.adminPortal.customerDeliveryDetails}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">{t.adminPortal.customerNameLabel}</span>
                    <strong className="text-zinc-900 font-bold text-sm">
                      {selectedOrder.buyerName || selectedOrder.deliveryContactName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">{t.adminPortal.phoneNumberLabel}</span>
                    <strong className="text-zinc-900 font-mono">{selectedOrder.deliveryContactPhone}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">{t.adminPortal.deliveryLocationLabel}</span>
                    <span className="text-zinc-700">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">{t.adminPortal.faydaTinLabel}</span>
                    <span className="text-zinc-700 font-mono">{selectedOrder.tinNumber || selectedOrder.nationalIdNumber || '—'}</span>
                  </div>
                </div>
              </div>

              {/* AI Smart Telemetry & Routing Section */}
              <div className="bg-gradient-to-r from-zinc-900 to-slate-900 rounded-xl p-4 text-white border border-emerald-500/30">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Bot className="h-3.5 w-3.5" /> AI Dispatch & Telemetry Intelligence
                  </span>
                  {selectedOrder.smartScore && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {selectedOrder.smartScore.riskScore}% AI Verified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Recommended Logistics Corridor</span>
                    <span className="font-bold text-emerald-300 flex items-center gap-1 mt-0.5">
                      <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                      {selectedOrder.smartScore?.routeRecommendation || 'Addis-Adama Expressway Logistics Corridor'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Perishability & Cold-Chain</span>
                    <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                      {selectedOrder.smartScore?.perishabilityRisk === 'HIGH' ? (
                        <span className="text-cyan-300 flex items-center gap-1">
                          <Snowflake className="h-3 w-3" /> Refrigerated Fleet Required
                        </span>
                      ) : (
                        <span className="text-zinc-300">Standard Ambient Cargo</span>
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">Assigned Carrier / Driver</span>
                    <span className="font-bold text-zinc-200 mt-0.5 block font-mono">
                      {selectedOrder.delivery?.driverName
                        ? `${selectedOrder.delivery.driverName} (${selectedOrder.delivery.vehiclePlate || 'Fleet'})`
                        : 'Pending Auto-Assignment'}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase">KYC & Identity Confidence</span>
                    <span className="font-bold text-emerald-300 mt-0.5 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Kebele/Fayda ID Verified
                    </span>
                  </div>
                </div>

                {/* 1-Click trigger inside modal if not yet in transit */}
                {(selectedOrder.orderStatus === 'CONFIRMED' || selectedOrder.orderStatus === 'PREPARING' || selectedOrder.orderStatus === 'READY_FOR_PICKUP') && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleAutoDispatch(selectedOrder.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Zap className="h-3.5 w-3.5 text-amber-300 fill-amber-300" /> Auto-Dispatch via Expressway Now
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                  {t.adminPortal.orderedCropItems}
                </span>
                <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-zinc-900">{it.name}</div>
                        <div className="text-zinc-500 text-[11px]">
                          {it.quantity} {it.unit} @ {it.unitPriceEtb} {t.common.currency}/{it.unit} • {t.adminPortal.lotPrefix}: {it.lotBatchNumber}
                        </div>
                      </div>
                      <div className="font-black text-sm text-zinc-950">
                        {it.subtotalEtb.toLocaleString()} {t.common.currency}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-2">
                  {t.adminPortal.paymentEscrowInfo}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-emerald-700 block text-[11px]">{t.adminPortal.paymentStatusLabel}</span>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">{t.adminPortal.grandTotalLabel}</span>
                    <strong className="text-emerald-950 font-black text-base">
                      {selectedOrder.grandTotalEtb.toLocaleString()} {t.common.currency}
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">{t.adminPortal.providerGatewayLabel}</span>
                    <strong className="text-emerald-950 font-mono">{selectedOrder.payment?.provider || 'TELEBIRR'}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">{t.adminPortal.transactionRefLabel}</span>
                    <strong className="text-emerald-950 font-mono">{selectedOrder.payment?.transactionRef || 'TX-PENDING'}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setInvoiceModalOrder(selectedOrder);
                    setSelectedOrder(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-4 w-4" /> {t.adminPortal.printTaxReceiptBtn}
                </button>
                {selectedOrder.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'PAID')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> {t.adminPortal.verifyPaymentBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* INVOICE & TAX RECEIPT MODAL */}
      {/* ========================================================================= */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl animate-in zoom-in-95 duration-150 border border-zinc-300">
            {/* Invoice Top */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-6">
              <div>
                <span className="text-xs font-black tracking-wider text-emerald-800 uppercase">{t.adminPortal.invoiceBrand}</span>
                <h3 className="text-xl font-black text-zinc-950">{t.adminPortal.commercialInvoiceTitle}</h3>
                <span className="text-xs text-zinc-400 font-mono">{t.adminPortal.invoiceNumPrefix}{invoiceModalOrder.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">{t.adminPortal.dateIssuedLabel}</span>
                <span className="text-xs font-bold text-zinc-800">
                  {new Date(invoiceModalOrder.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* Billed To / Shipped To */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t.adminPortal.billedToCustomer}</span>
                <div className="font-bold text-zinc-900 text-sm">
                  {invoiceModalOrder.buyerName || invoiceModalOrder.deliveryContactName}
                </div>
                <div className="text-zinc-600">{invoiceModalOrder.deliveryAddress}</div>
                <div className="text-zinc-500 font-mono">{invoiceModalOrder.deliveryContactPhone}</div>
                {invoiceModalOrder.tinNumber && (
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">{t.adminPortal.tinLabel}: {invoiceModalOrder.tinNumber}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">{t.adminPortal.paymentEscrowSeal}</span>
                <div className="font-bold text-emerald-800 font-mono">
                  {invoiceModalOrder.payment?.provider || 'TELEBIRR / CBE BIRR'}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  {t.adminPortal.txRefLabel}: {invoiceModalOrder.payment?.transactionRef || 'TX-ETH-AGRI'}
                </div>
                <div className="mt-1">
                  {getPaymentStatusBadge(invoiceModalOrder.paymentStatus)}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="border border-zinc-200 rounded-xl overflow-hidden mb-6 text-xs">
              <table className="w-full text-left">
                <thead className="bg-zinc-100 text-zinc-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">{t.adminPortal.thProduceItem}</th>
                    <th className="p-3 text-center">{t.adminPortal.thQty}</th>
                    <th className="p-3 text-right">{t.adminPortal.thPrice}</th>
                    <th className="p-3 text-right">{t.adminPortal.thSubtotal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {invoiceModalOrder.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 font-bold text-zinc-900">{it.name}</td>
                      <td className="p-3 text-center text-zinc-600">{it.quantity} {it.unit}</td>
                      <td className="p-3 text-right text-zinc-600">{it.unitPriceEtb} {t.common.currency}</td>
                      <td className="p-3 text-right font-bold text-zinc-900">{it.subtotalEtb.toLocaleString()} {t.common.currency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math */}
            <div className="space-y-1.5 text-xs border-t border-zinc-200 pt-3 mb-6">
              <div className="flex justify-between text-zinc-600">
                <span>{t.adminPortal.subtotalLabel}</span>
                <span>{invoiceModalOrder.totalAmountEtb.toLocaleString()} {t.common.currency}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>{t.adminPortal.deliveryLogisticsLabel}</span>
                <span>{(invoiceModalOrder.deliveryFeeEtb || 0).toLocaleString()} {t.common.currency}</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>{t.adminPortal.platformEscrowFeeLabel}</span>
                <span>{(invoiceModalOrder.serviceFeeEtb || 0).toLocaleString()} {t.common.currency}</span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200">
                <span>{t.adminPortal.grandTotalEtbLabel}</span>
                <span className="text-emerald-800">{invoiceModalOrder.grandTotalEtb.toLocaleString()} {t.common.currency}</span>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> {t.adminPortal.printReceiptBtn}
              </button>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold cursor-pointer"
              >
                {t.adminPortal.closeBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
