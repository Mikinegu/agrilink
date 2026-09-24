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
  History,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Copy,
  Wifi,
  Play,
  Sliders,
  LifeBuoy,
  Settings as SettingsIcon,
} from 'lucide-react';
import { User, Order, Payment, Product, SupportTicket, PlatformSettings } from '../types/index.ts';
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
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'payments' | 'telebirr-ai' | 'produce' | 'users' | 'disputes' | 'settings'>('orders');
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [supportTicketsList, setSupportTicketsList] = useState<SupportTicket[]>([]);
  const [platformSettingsState, setPlatformSettingsState] = useState<PlatformSettings | null>(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState('ALL');
  const [selectedTicketForResolve, setSelectedTicketForResolve] = useState<SupportTicket | null>(null);
  const [resolutionNoteInput, setResolutionNoteInput] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Telebirr Phone Account Link & AI Payment Guardian State
  const [telebirrConfig, setTelebirrConfig] = useState<any>({
    phoneNumber: '0961123330',
    accountName: 'AgriLink Technologies PLC (Escrow Vault)',
    merchantCode: '884920',
    isLinked: true,
    aiMode: 'AI_AUTOPILOT',
    autoApproveGenuineTelebirr: true,
    notifyAdminOnPhone: true,
    smsSyncToken: 'TB-SYNC-88912',
    stats: { totalAutoApproved: 18, totalFlagged: 1, totalEtbSecured: 312500 },
  });
  const [editingPhone, setEditingPhone] = useState('0961123330');
  const [editingAccountName, setEditingAccountName] = useState('AgriLink Technologies PLC');
  const [editingMerchantCode, setEditingMerchantCode] = useState('884920');
  const [savingTelebirrConfig, setSavingTelebirrConfig] = useState(false);
  const [simulatingTelebirr, setSimulatingTelebirr] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [smsTestInput, setSmsTestInput] = useState('');
  const [testingSms, setTestingSms] = useState(false);
  const [smsTestResult, setSmsTestResult] = useState<any>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

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
      const [ovRes, ordRes, payRes, usrRes, prodRes, aiRes, aiCtrlRes, tckRes, setRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/payments'),
        fetch('/api/auth/users'),
        fetch('/api/products'),
        fetch('/api/admin/ai-insights'),
        fetch('/api/admin/ai-controller/status'),
        fetch('/api/support-tickets'),
        fetch('/api/admin/settings'),
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
      if (aiCtrlRes && aiCtrlRes.ok) {
        const ctrlData = await aiCtrlRes.json();
        setAiControllerStatus(ctrlData);
        if (ctrlData.telebirrConfig) {
          setTelebirrConfig(ctrlData.telebirrConfig);
        }
      }
      if (tckRes && tckRes.ok) {
        setSupportTicketsList(await tckRes.json());
      }
      if (setRes && setRes.ok) {
        const setsData = await setRes.json();
        setPlatformSettingsState(setsData);
      }
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId: number) => {
    try {
      const res = await fetch(`/api/support-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RESOLVED',
          resolutionNotes: resolutionNoteInput.trim() || 'Resolved and closed by Platform Administrator.',
        }),
      });
      if (res.ok) {
        showFeedback('Ticket marked as RESOLVED and customer notified.');
        setSelectedTicketForResolve(null);
        setResolutionNoteInput('');
        await fetchAdminData(true);
      }
    } catch (err) {
      console.error('Resolve ticket error:', err);
    }
  };

  const handleSavePlatformSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!platformSettingsState) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(platformSettingsState),
      });
      if (res.ok) {
        const updated = await res.json();
        setPlatformSettingsState(updated);
        showFeedback('Platform system settings and policies updated successfully.');
        await fetchAdminData(true);
      }
    } catch (err) {
      console.error('Save platform settings error:', err);
    } finally {
      setSavingSettings(false);
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

  // --- Telebirr Phone Account Link & AI Payment Guardian Handlers ---
  const handleSaveTelebirrConfig = async (overrideValues?: any) => {
    setSavingTelebirrConfig(true);
    try {
      const payload = {
        phoneNumber: editingPhone,
        accountName: editingAccountName,
        merchantCode: editingMerchantCode,
        isLinked: true,
        aiMode: telebirrConfig.aiMode || 'AI_AUTOPILOT',
        autoApproveGenuineTelebirr: telebirrConfig.autoApproveGenuineTelebirr ?? true,
        notifyAdminOnPhone: telebirrConfig.notifyAdminOnPhone ?? true,
        ...overrideValues,
      };

      const res = await fetch('/api/admin/telebirr-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setTelebirrConfig(data.config);
        showFeedback(`📱 Telebirr Phone (${data.config.phoneNumber}) linked & synced with AI Guardian!`);
        await fetchAdminData(true);
      } else {
        alert(data.error || 'Failed to save Telebirr configuration');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving Telebirr configuration');
    } finally {
      setSavingTelebirrConfig(false);
    }
  };

  const handleVerifyPhoneConnection = async () => {
    setSavingTelebirrConfig(true);
    try {
      const res = await fetch('/api/admin/telebirr-link/verify', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setTelebirrConfig(data.config);
        showFeedback(`🟢 Phone Handshake Confirmed: Telebirr Account (+${data.config.phoneNumber}) active!`);
        await fetchAdminData(true);
      }
    } catch (err: any) {
      alert(err.message || 'Verification handshake failed');
    } finally {
      setSavingTelebirrConfig(false);
    }
  };

  const handleChangeAiMode = async (newMode: 'AI_AUTOPILOT' | 'SMART_AWAY' | 'MANUAL_ONLY') => {
    await handleSaveTelebirrConfig({ aiMode: newMode });
  };

  const handleSimulatePayment = async () => {
    setSimulatingTelebirr(true);
    setSimulationResult(null);
    try {
      const res = await fetch('/api/admin/telebirr-link/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 4500,
          buyerName: 'Abebe Demisse (Bole Supermarket)',
          buyerPhone: '+251 91 144 5566',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationResult(data);
        playOrderChime();
        showFeedback(`⚡ AI Guardian Intercepted & Confirmed ${data.payment.amountEtb?.toLocaleString()} ETB via Telebirr!`);
        await fetchAdminData(true);
        onRefreshAll();
      } else {
        alert(data.error || 'Simulation failed');
      }
    } catch (err: any) {
      alert(err.message || 'Simulation error');
    } finally {
      setSimulatingTelebirr(false);
    }
  };

  const handleTestSmsParser = async () => {
    if (!smsTestInput.trim()) return;
    setTestingSms(true);
    setSmsTestResult(null);
    try {
      const res = await fetch('/api/admin/telebirr-link/incoming-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smsText: smsTestInput }),
      });
      const data = await res.json();
      setSmsTestResult(data);
      if (data.success) {
        playOrderChime();
        showFeedback(data.message || 'Telebirr SMS parsed & processed!');
        await fetchAdminData(true);
      }
    } catch (err: any) {
      alert(err.message || 'SMS test error');
    } finally {
      setTestingSms(false);
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
            {/* Quick Telebirr Status Indicator */}
            <button
              onClick={() => setActiveSubTab('telebirr-ai')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-400/40 text-blue-200 text-xs font-bold hover:bg-blue-900/90 transition-all cursor-pointer shadow-inner"
              title="Click to manage linked Telebirr Phone and AI Payment Guardian"
            >
              <Smartphone className="h-4 w-4 text-amber-300" />
              <span>Telebirr: {telebirrConfig?.phoneNumber || '0961 123 330'}</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
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
          onClick={() => setActiveSubTab('telebirr-ai')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'telebirr-ai'
              ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md shadow-indigo-900/40 ring-1 ring-blue-400/40'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <Smartphone className="h-4 w-4 text-amber-400" />
          <span>Telebirr &amp; AI Guardian</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold flex items-center gap-1 border border-amber-400/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            AI Live
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

        <button
          onClick={() => setActiveSubTab('disputes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'disputes'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <LifeBuoy className="h-4 w-4 text-rose-500" />
          <span>Disputes &amp; Support</span>
          <span className="px-1.5 py-0.2 rounded-md bg-rose-500/20 text-rose-700 text-[10px] font-bold">
            {supportTicketsList.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeSubTab === 'settings'
              ? 'bg-zinc-950 text-white shadow-sm'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
          }`}
        >
          <SettingsIcon className="h-4 w-4" />
          <span>Platform Settings</span>
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

          {/* Admin Presence & Autonomous AI Escrow Controller Bar */}
          <div className={`p-5 rounded-2xl border transition-all duration-300 ${
            aiControllerStatus?.isAiInControl
              ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-zinc-900 border-indigo-500/50 shadow-lg shadow-indigo-950/30'
              : 'bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 border-emerald-500/40 shadow-lg shadow-emerald-950/20'
          } text-white`}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-xl ${
                  aiControllerStatus?.isAiInControl
                    ? 'bg-indigo-500/20 border border-indigo-400/40 text-indigo-300'
                    : 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-300'
                }`}>
                  {aiControllerStatus?.isAiInControl ? (
                    <Bot className="h-6 w-6 animate-pulse" />
                  ) : (
                    <UserCheck className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase border ${
                      aiControllerStatus?.isAiInControl
                        ? 'bg-indigo-500/30 border-indigo-400 text-indigo-200'
                        : 'bg-emerald-500/30 border-emerald-400 text-emerald-200'
                    }`}>
                      {aiControllerStatus?.isAiInControl ? (
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
                          AI Auto-Pilot Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Human Control
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-mono text-zinc-400">
                      {aiControllerStatus?.isAiInControl ? 'Admin Away' : 'Admin Present'}
                    </span>
                  </div>
                  <h4 className="text-base font-black mt-1">
                    {aiControllerStatus?.isAiInControl
                      ? t.adminPortal.aiAutoPilotActive
                      : t.adminPortal.humanAdminActive}
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5 max-w-xl">
                    {aiControllerStatus?.isAiInControl
                      ? t.adminPortal.aiAutoPilotDesc
                      : t.adminPortal.humanAdminDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* AI Stats Badges */}
                <div className="flex gap-2 text-xs">
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-zinc-300 block uppercase font-bold">AI Passed</span>
                    <span className="text-sm font-black text-indigo-300">
                      {aiControllerStatus?.aiStats?.passedCount || 0}
                    </span>
                  </div>
                  <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="text-[10px] text-zinc-300 block uppercase font-bold">Suspicious</span>
                    <span className="text-sm font-black text-rose-300">
                      {aiControllerStatus?.aiStats?.flaggedCount || 0}
                    </span>
                  </div>
                </div>

                {/* Mode Switch Toggle Button */}
                <button
                  onClick={() => handleTogglePresence(aiControllerStatus?.isAiInControl ? 'HUMAN_CONTROL' : 'AI_AUTOPILOT')}
                  disabled={presenceUpdating}
                  className={`px-4 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-2 shadow-md ${
                    aiControllerStatus?.isAiInControl
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 shadow-emerald-500/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                  } disabled:opacity-50`}
                >
                  {aiControllerStatus?.isAiInControl ? (
                    <>
                      <UserCheck className="h-4 w-4" />
                      {t.adminPortal.resumeHumanControlBtn}
                    </>
                  ) : (
                    <>
                      <Bot className="h-4 w-4" />
                      {t.adminPortal.stepAwayHandoverBtn}
                    </>
                  )}
                </button>

                {/* Audit Trail Drawer Toggle */}
                <button
                  onClick={() => setShowAiAuditDrawer(!showAiAuditDrawer)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-bold text-white cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <History className="h-4 w-4" />
                  <span>Audit Trail</span>
                  {showAiAuditDrawer ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
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
                        {getPaymentStatusBadge(p.status, p.paymentDetails || p)}
                      </td>
                      <td className="p-4 text-zinc-500 font-mono text-[11px]">
                        {new Date(p.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 text-right">
                        {(p.status === 'PENDING' || p.status === 'PROCESSING' || p.status === 'PENDING_APPROVAL' || p.status === 'FLAGGED_SUSPICIOUS') && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handlePassPayment(p.id)}
                              disabled={actionInProgressId === p.id}
                              className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer flex items-center gap-1 shadow-2xs transition-colors disabled:opacity-50"
                              title="Manually verify and accept this payment"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>{t.adminPortal.passPaymentBtn}</span>
                            </button>
                            <button
                              onClick={() => {
                                setRejectModalPayment(p);
                                setRejectReason('');
                              }}
                              disabled={actionInProgressId === p.id}
                              className="px-2 py-1 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-[11px] cursor-pointer flex items-center gap-1 transition-colors disabled:opacity-50"
                              title="Reject payment reference"
                            >
                              <X className="h-3 w-3" />
                              <span>{t.adminPortal.rejectPaymentBtn}</span>
                            </button>
                          </div>
                        )}

                        {p.status === 'PAID' && (
                          <div className="flex items-center justify-end gap-2">
                            {p.paymentDetails?.passedBy === 'AI_ASSISTANT' && (
                              <span
                                onClick={() => setSelectedAuditLog(p)}
                                className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 cursor-pointer hover:bg-indigo-100 flex items-center gap-1"
                                title="Click to view AI reasoning"
                              >
                                <Bot className="h-3 w-3 text-indigo-600" />
                                {t.adminPortal.passedByAiBadge}
                              </span>
                            )}
                            {p.paymentDetails?.passedBy === 'HUMAN_ADMIN' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <UserCheck className="h-3 w-3 text-emerald-600" />
                                {t.adminPortal.passedByAdminBadge}
                              </span>
                            )}
                            <button
                              onClick={() => handleUpdatePaymentStatus(p.orderId, 'RELEASED_TO_FARMER')}
                              className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-teal-900 font-bold text-[10px] cursor-pointer"
                            >
                              {t.adminPortal.releaseEscrowBtn}
                            </button>
                          </div>
                        )}

                        {p.status === 'REJECTED' && (
                          <span
                            className="text-[11px] font-bold text-rose-600 cursor-pointer hover:underline"
                            title={p.paymentDetails?.rejectionReason}
                          >
                            {p.paymentDetails?.rejectionReason ? `❌ ${p.paymentDetails.rejectionReason.slice(0, 24)}...` : '❌ Rejected'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Escrow Assistant Autonomous Activity Stream & Audit Trail */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div
              className="p-4 border-b border-zinc-200 flex items-center justify-between cursor-pointer hover:bg-zinc-50 transition-colors"
              onClick={() => setShowAiAuditDrawer(!showAiAuditDrawer)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                    <span>{t.adminPortal.aiAuditLogTitle}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-800">
                      {aiControllerStatus?.recentLogs?.length || 0} entries
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500">{t.adminPortal.aiAuditLogSubtitle}</p>
                </div>
              </div>
              <button className="text-zinc-400 hover:text-zinc-600 p-1">
                {showAiAuditDrawer ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showAiAuditDrawer && (
              <div className="p-4">
                {aiControllerStatus?.recentLogs && aiControllerStatus.recentLogs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="p-3">Time</th>
                          <th className="p-3">Actor</th>
                          <th className="p-3">Decision</th>
                          <th className="p-3">Order / TxRef</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Fraud Risk</th>
                          <th className="p-3">Audit Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {aiControllerStatus.recentLogs.map((log: any) => (
                          <tr
                            key={log.id}
                            className="hover:bg-zinc-50 cursor-pointer"
                            onClick={() => setSelectedAuditLog(log)}
                          >
                            <td className="p-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                log.actor?.includes('AI')
                                  ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              }`}>
                                {log.actor?.includes('AI') ? <Bot className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                                {log.actor}
                              </span>
                            </td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                                log.decision === 'AI_PASSED' || log.decision === 'ADMIN_PASSED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : log.decision === 'FLAGGED_SUSPICIOUS'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {log.decision}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <span className="font-bold text-zinc-900">{log.orderNumber || `ORD-${log.orderId}`}</span>
                              <span className="text-zinc-400 block text-[10px]">{log.transactionRef}</span>
                            </td>
                            <td className="p-3 font-bold text-zinc-900 whitespace-nowrap">
                              {(log.amountEtb || 0).toLocaleString()} {t.common.currency}
                            </td>
                            <td className="p-3 font-mono text-[11px]">
                              <span className={`font-bold ${
                                (log.fraudRiskScore || 0) > 0.4 ? 'text-rose-600' : 'text-emerald-600'
                              }`}>
                                {((log.fraudRiskScore || 0) * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="p-3 text-zinc-600 max-w-md truncate" title={log.reason}>
                              {log.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center text-zinc-500 text-xs">
                    <Bot className="h-8 w-8 text-zinc-300 mx-auto mb-2" />
                    <p className="font-bold text-zinc-700">{t.adminPortal.aiAuditLogEmpty}</p>
                    <p className="text-zinc-400 mt-0.5 text-[11px]">
                      When the admin steps away, all incoming transaction references are audited here with full reasoning.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.5. TELEBIRR PHONE LINK & AI PAYMENT GUARDIAN TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'telebirr-ai' && (
        <div className="space-y-6 animate-in fade-in-50 duration-200">
          {/* Hero Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-zinc-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-blue-500/30">
            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                  <span className="p-1 rounded-md bg-amber-400/20 border border-amber-400/40">
                    <Smartphone className="h-3.5 w-3.5" />
                  </span>
                  <span>Ethio Telecom Telebirr SuperApp Rail • Autonomous AI Guardian</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
                  <span>Telebirr Phone Link &amp; AI Payment Guardian</span>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Linked: +251 {telebirrConfig?.phoneNumber || '0961 123 330'}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 mt-2 max-w-3xl leading-relaxed">
                  Never miss or delay a customer payment again. When buyers make purchases via Telebirr while you are busy, away, or not viewing the screen, your autonomous AI Payment Guardian intercepts the transaction reference, cross-verifies the amount with your linked Telebirr account, confirms the order, locks funds in escrow, and notifies your phone instantly.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulatingTelebirr}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  title="Simulate what happens when a customer purchases produce via Telebirr while you are away"
                >
                  <Zap className={`h-4 w-4 fill-zinc-950 ${simulatingTelebirr ? 'animate-bounce' : ''}`} />
                  <span>{simulatingTelebirr ? 'AI Intercepting Payment...' : '⚡ Test Buyer Telebirr Payment'}</span>
                </button>
                <button
                  onClick={handleVerifyPhoneConnection}
                  disabled={savingTelebirrConfig}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${savingTelebirrConfig ? 'animate-spin' : ''}`} />
                  <span>Verify Phone Handshake</span>
                </button>
              </div>
            </div>

            {/* Glowing Accent */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          </div>

          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Linked Telebirr Phone</span>
                <Smartphone className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-lg sm:text-xl font-black text-zinc-950 mt-1 block font-mono">
                {telebirrConfig?.phoneNumber || '0961 123 330'}
              </span>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Handshake Verified &amp; Active
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">AI Auto-Approved</span>
                <Bot className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-lg sm:text-xl font-black text-indigo-950 mt-1 block">
                {telebirrConfig?.stats?.totalAutoApproved || 18} <span className="text-xs font-bold text-zinc-500">Orders</span>
              </span>
              <span className="text-[11px] text-indigo-700 font-bold flex items-center gap-1 mt-1">
                <Zap className="h-3.5 w-3.5" /> 0s Delay While Admin Away
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Escrow Volume Secured</span>
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </div>
              <span className="text-lg sm:text-xl font-black text-zinc-900 mt-1 block">
                {(telebirrConfig?.stats?.totalEtbSecured || 312500).toLocaleString()} <span className="text-xs font-bold text-zinc-500">ETB</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1">
                <Lock className="h-3.5 w-3.5" /> NBE Escrow Compliant
              </span>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">AI Fraud Quarantine</span>
                <ShieldAlert className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-lg sm:text-xl font-black text-zinc-900 mt-1 block">
                {telebirrConfig?.stats?.totalFlagged || 1} <span className="text-xs font-bold text-zinc-500">Held</span>
              </span>
              <span className="text-[11px] text-amber-700 font-bold flex items-center gap-1 mt-1">
                <AlertCircle className="h-3.5 w-3.5" /> Mismatches Flagged
              </span>
            </div>
          </div>

          {/* Two-Column Configuration Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column 1: Link My Telebirr Phone Account */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-950">1. Link Admin Telebirr Account</h3>
                    <p className="text-xs text-zinc-500">Configure the phone number and merchant credentials to receive buyer settlements</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active Link
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Admin Telebirr Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-xs font-bold text-zinc-500">
                      🇪🇹 +251
                    </div>
                    <input
                      type="text"
                      value={editingPhone}
                      onChange={(e) => setEditingPhone(e.target.value)}
                      placeholder="0961123330 or 911223344"
                      className="w-full pl-20 pr-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono font-bold text-zinc-900"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">This phone receives buyer Telebirr direct transfers and automated escrow releases.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Telebirr Registered Account / Business Name
                  </label>
                  <input
                    type="text"
                    value={editingAccountName}
                    onChange={(e) => setEditingAccountName(e.target.value)}
                    placeholder="e.g. AgriLink Technologies PLC or Your Name"
                    className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Telebirr Merchant Code / Shortcode <span className="text-zinc-400 font-normal">(Optional Till #)</span>
                  </label>
                  <input
                    type="text"
                    value={editingMerchantCode}
                    onChange={(e) => setEditingMerchantCode(e.target.value)}
                    placeholder="e.g. 884920"
                    className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-mono text-zinc-900"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => handleSaveTelebirrConfig()}
                    disabled={savingTelebirrConfig}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    <span>{savingTelebirrConfig ? 'Saving...' : 'Save & Sync Phone Settings'}</span>
                  </button>

                  <button
                    onClick={handleVerifyPhoneConnection}
                    className="py-2.5 px-4 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Test Ping
                  </button>
                </div>

                {/* Webhook & SMS Sync Box */}
                <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 mt-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-zinc-700 uppercase tracking-wide flex items-center gap-1.5">
                      <QrCode className="h-3.5 w-3.5 text-zinc-500" />
                      Phone SMS Forwarding Webhook
                    </span>
                    <span className="text-[10px] font-mono text-zinc-500">Token: {telebirrConfig?.smsSyncToken || 'TB-SYNC-88912'}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    You can automatically forward Ethio Telecom SMS notifications from your Android / iOS phone directly to this webapp endpoint. The AI automatically extracts the transaction code, amount, and payer details in real time.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/admin/telebirr-link/incoming-sms?token=${telebirrConfig?.smsSyncToken || 'TB-SYNC-88912'}`}
                      className="flex-1 text-[11px] font-mono bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-zinc-600 select-all"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/admin/telebirr-link/incoming-sms?token=${telebirrConfig?.smsSyncToken || 'TB-SYNC-88912'}`);
                        setCopiedWebhook(true);
                        setTimeout(() => setCopiedWebhook(false), 3000);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 text-zinc-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>{copiedWebhook ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: AI Payment Guardian Control Panel */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-950">2. AI Payment Guardian Mode</h3>
                    <p className="text-xs text-zinc-500">Determine how autonomously the AI handles Telebirr buyer payments</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
                  {telebirrConfig?.aiMode || 'AI_AUTOPILOT'}
                </span>
              </div>

              {/* 3 Mode Cards */}
              <div className="space-y-3">
                {/* Mode 1: Full Autopilot */}
                <div
                  onClick={() => handleChangeAiMode('AI_AUTOPILOT')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    telebirrConfig?.aiMode === 'AI_AUTOPILOT'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        telebirrConfig?.aiMode === 'AI_AUTOPILOT' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        <Bot className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-zinc-950 flex items-center gap-2">
                          <span>🤖 Autonomous AI Autopilot</span>
                          <span className="px-2 py-0.2 rounded-full text-[9px] font-black bg-emerald-600 text-white">Recommended</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          AI immediately validates &amp; auto-passes matching buyer payments without waiting. Ideal if you are away from the computer.
                        </div>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      telebirrConfig?.aiMode === 'AI_AUTOPILOT' ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300'
                    }`}>
                      {telebirrConfig?.aiMode === 'AI_AUTOPILOT' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Mode 2: Smart Away */}
                <div
                  onClick={() => handleChangeAiMode('SMART_AWAY')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    telebirrConfig?.aiMode === 'SMART_AWAY'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        telebirrConfig?.aiMode === 'SMART_AWAY' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-zinc-950">🛡️ Smart Away Protocol</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          When you are active on the portal, you retain manual control. If you step away or close the browser for &gt; 30s, AI takes over.
                        </div>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      telebirrConfig?.aiMode === 'SMART_AWAY' ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300'
                    }`}>
                      {telebirrConfig?.aiMode === 'SMART_AWAY' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>

                {/* Mode 3: Manual Only */}
                <div
                  onClick={() => handleChangeAiMode('MANUAL_ONLY')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    telebirrConfig?.aiMode === 'MANUAL_ONLY'
                      ? 'border-indigo-600 bg-indigo-50/60 shadow-sm'
                      : 'border-zinc-200 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${
                        telebirrConfig?.aiMode === 'MANUAL_ONLY' ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-zinc-950">👤 Manual Desk Only</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          AI generates fraud scores and receipt guidance, but never auto-passes orders without your explicit manual click.
                        </div>
                      </div>
                    </div>
                    <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      telebirrConfig?.aiMode === 'MANUAL_ONLY' ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300'
                    }`}>
                      {telebirrConfig?.aiMode === 'MANUAL_ONLY' && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Automation Toggles */}
              <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-200 space-y-3">
                <span className="text-[11px] font-black text-zinc-700 uppercase tracking-wide block">
                  Guardian Anti-Fraud &amp; Notification Rules
                </span>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telebirrConfig?.autoApproveGenuineTelebirr ?? true}
                    onChange={(e) => handleSaveTelebirrConfig({ autoApproveGenuineTelebirr: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 block">Auto-confirm genuine matching Telebirr receipts</span>
                    <span className="text-[11px] text-zinc-500 block">Matches order total against Telebirr confirmation pattern &amp; locks into Escrow.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telebirrConfig?.notifyAdminOnPhone ?? true}
                    onChange={(e) => handleSaveTelebirrConfig({ notifyAdminOnPhone: e.target.checked })}
                    className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-zinc-800 block">Instant alerts to linked phone (+251 {telebirrConfig?.phoneNumber || '0961 123 330'})</span>
                    <span className="text-[11px] text-zinc-500 block">Receive instant notification whenever the AI Assistant passes or flags a payment.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Interactive Live Telebirr Simulator & SMS Tester */}
          <div className="bg-gradient-to-br from-zinc-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-indigo-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/40">
                  <Zap className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-wide text-white">
                    Live Telebirr Payment Interceptor &amp; SMS Simulator
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    See exactly how the AI Assistant catches and approves incoming buyer payments while you are not looking
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 self-start sm:self-auto">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Interceptor Active
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Simulator Action 1: 1-Click Simulated Buyer Payment */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                    Simulate Buyer Purchase
                  </span>
                  <span className="text-[10px] text-zinc-400">4,500 ETB Test Order</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  Trigger an automated customer purchase with realistic Telebirr transaction data. The AI Assistant will intercept the payment, match it with your linked phone (<span className="text-amber-300 font-mono font-bold">+251 {telebirrConfig?.phoneNumber || '0961 123 330'}</span>), confirm the order, lock escrow, and sound the chime.
                </p>

                <button
                  onClick={handleSimulatePayment}
                  disabled={simulatingTelebirr}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <Play className={`h-4 w-4 fill-zinc-950 ${simulatingTelebirr ? 'animate-spin' : ''}`} />
                  <span>{simulatingTelebirr ? 'AI Intercepting & Processing...' : 'Simulate Buyer Purchase (Admin Away Test)'}</span>
                </button>

                {/* Simulation Result Pipeline */}
                {simulationResult && (
                  <div className="bg-emerald-950/80 border border-emerald-500/40 rounded-xl p-4 text-xs space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-emerald-300 flex items-center gap-1.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        AI Verified &amp; Confirmed!
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">{simulationResult.txRef}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 text-[11px] border-y border-emerald-800/40">
                      <div>
                        <span className="text-zinc-400 block text-[9px] uppercase">Amount</span>
                        <span className="font-black text-white">{simulationResult.payment?.amountEtb?.toLocaleString()} ETB</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[9px] uppercase">Destination</span>
                        <span className="font-mono font-bold text-amber-300">{simulationResult.config?.phoneNumber}</span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block text-[9px] uppercase">Escrow State</span>
                        <span className="font-bold text-emerald-300">LOCKED</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-emerald-100/90 leading-relaxed font-mono">
                      {simulationResult.aiLog?.reason}
                    </p>
                  </div>
                )}
              </div>

              {/* Simulator Action 2: Raw Telebirr SMS Parser */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-300 uppercase tracking-wider">
                    Paste Real Telebirr SMS
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSmsTestInput('Dear customer, you have received ETB 4,500.00 from 251911223344 (Abebe Kebede). Transaction number: CC481029482 on 2026-09-23 11:45:00. Your current balance is ETB 128,450.00.')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 cursor-pointer font-bold"
                    >
                      English Sample
                    </button>
                    <button
                      onClick={() => setSmsTestInput('ክቡር ደንበኛ፣ ከ 251911223344 4,500.00 ብር ገቢ ተደርጎልዎታል:: የግብይት ቁጥር ADQ882941091 ቀን 2026-09-23 11:45:00:: አጠቃላይ ቀሪ ሂሳብዎ 128,450.00 ብር ነው።')}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 text-zinc-300 cursor-pointer font-bold"
                    >
                      Amharic Sample
                    </button>
                  </div>
                </div>

                <textarea
                  rows={3}
                  value={smsTestInput}
                  onChange={(e) => setSmsTestInput(e.target.value)}
                  placeholder="Paste raw Telebirr SMS text received on your phone here..."
                  className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <button
                  onClick={handleTestSmsParser}
                  disabled={testingSms || !smsTestInput.trim()}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  <Bot className="h-4 w-4" />
                  <span>{testingSms ? 'AI Parsing SMS...' : 'Parse SMS & Auto-Match Pending Order'}</span>
                </button>

                {smsTestResult && (
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                    smsTestResult.success ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
                  }`}>
                    <div className="font-bold">{smsTestResult.message}</div>
                    {smsTestResult.parsed && (
                      <div className="text-[11px] font-mono opacity-90">
                        Ref: {smsTestResult.parsed.transactionRef || 'N/A'} • Amount: {smsTestResult.parsed.amountEtb?.toLocaleString()} ETB • Confidence: {smsTestResult.parsed.confidence}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time AI Guardian Decision Feed */}
          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="p-4 sm:p-5 border-b border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-950">AI Payment Guardian Audit Ledger</h3>
                  <p className="text-xs text-zinc-500">Autonomous decisions logged while admin was away or in autopilot mode</p>
                </div>
              </div>
              <span className="text-xs font-mono text-zinc-500">
                {aiControllerStatus?.recentLogs?.length || 0} Telebirr Events Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3.5">Time</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Decision</th>
                    <th className="p-3.5">Order / TxRef</th>
                    <th className="p-3.5">Amount (ETB)</th>
                    <th className="p-3.5">Fraud Risk</th>
                    <th className="p-3.5">AI Reasoning &amp; Phone Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {aiControllerStatus?.recentLogs && aiControllerStatus.recentLogs.length > 0 ? (
                    aiControllerStatus.recentLogs.map((log: any) => (
                      <tr
                        key={log.id}
                        className="hover:bg-zinc-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedAuditLog(log)}
                      >
                        <td className="p-3.5 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-950 border border-indigo-200">
                            <Bot className="h-3 w-3 text-indigo-600" />
                            {log.actor || 'AI Guardian'}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                            log.decision === 'AI_PASSED' || log.decision === 'ADMIN_PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {log.decision}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className="font-bold text-zinc-900 block">{log.orderNumber || `ORD-${log.orderId}`}</span>
                          <span className="text-zinc-500 text-[10px]">{log.transactionRef}</span>
                        </td>
                        <td className="p-3.5 font-black text-zinc-950 whitespace-nowrap">
                          {(log.amountEtb || 0).toLocaleString()} {t.common.currency}
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          <span className={`font-bold ${
                            (log.fraudRiskScore || 0) > 0.4 ? 'text-rose-600' : 'text-emerald-600'
                          }`}>
                            {((log.fraudRiskScore || 0) * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="p-3.5 text-zinc-600 max-w-lg truncate" title={log.reason}>
                          {log.reason}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-400 text-xs">
                        No AI audit events recorded yet. Click "Test Buyer Telebirr Payment" above to trigger a live simulation!
                      </td>
                    </tr>
                  )}
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
      {/* 5. DISPUTES & SUPPORT TICKETS TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'disputes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-zinc-200">
            <div>
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <LifeBuoy className="h-6 w-6 text-rose-600" />
                Customer &amp; Farmer Dispute Resolution
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Manage and arbitrate order disputes, payment inquiries, and logistics issues backed by NBE Escrow policies.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-500">Filter Status:</span>
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800"
              >
                <option value="ALL">All Statuses ({supportTicketsList.length})</option>
                <option value="OPEN">Open ({supportTicketsList.filter((t) => t.status === 'OPEN').length})</option>
                <option value="IN_PROGRESS">In Progress ({supportTicketsList.filter((t) => t.status === 'IN_PROGRESS').length})</option>
                <option value="RESOLVED">Resolved ({supportTicketsList.filter((t) => t.status === 'RESOLVED').length})</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Ticket Number</th>
                    <th className="p-4">User</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Subject &amp; Details</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Resolution</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {supportTicketsList
                    .filter((t) => ticketStatusFilter === 'ALL' || t.status === ticketStatusFilter)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-zinc-50">
                        <td className="p-4 font-mono font-bold text-zinc-900">{t.ticketNumber}</td>
                        <td className="p-4">
                          <div className="font-bold text-zinc-900">{t.userName || `User #${t.userId}`}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{t.userRole || 'USER'}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {t.category.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs">
                          <div className="font-bold text-zinc-900">{t.subject}</div>
                          <div className="text-[11px] text-zinc-500 line-clamp-2 mt-0.5">{t.description}</div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.priority === 'URGENT'
                                ? 'bg-red-100 text-red-800'
                                : t.priority === 'HIGH'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-zinc-100 text-zinc-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.status === 'RESOLVED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="p-4 max-w-xs text-zinc-600 text-[11px]">
                          {t.resolutionNotes || <span className="text-zinc-400 italic">Pending arbitration</span>}
                        </td>
                        <td className="p-4 text-right">
                          {t.status !== 'RESOLVED' ? (
                            <button
                              onClick={() => {
                                setSelectedTicketForResolve(t);
                                setResolutionNoteInput(t.resolutionNotes || '');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-700 font-bold flex items-center justify-end gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Done
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  {supportTicketsList.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-zinc-400">
                        No support tickets found in database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ticket Resolve Modal */}
          {selectedTicketForResolve && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                  <h3 className="text-lg font-black text-zinc-900">
                    Resolve Dispute #{selectedTicketForResolve.ticketNumber}
                  </h3>
                  <button
                    onClick={() => setSelectedTicketForResolve(null)}
                    className="p-1 rounded-full hover:bg-zinc-100 text-zinc-500"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-4 text-xs">
                  <div>
                    <span className="font-bold text-zinc-700 block mb-1">Subject:</span>
                    <p className="text-zinc-900 font-medium">{selectedTicketForResolve.subject}</p>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-700 block mb-1">User Description:</span>
                    <p className="text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                      {selectedTicketForResolve.description}
                    </p>
                  </div>
                  <div>
                    <label className="font-bold text-zinc-700 block mb-1">
                      Official Resolution Decision / Admin Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionNoteInput}
                      onChange={(e) => setResolutionNoteInput(e.target.value)}
                      placeholder="Explain the settlement or resolution provided to the user..."
                      className="w-full p-3 rounded-xl border border-zinc-300 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedTicketForResolve(null)}
                      className="px-4 py-2 rounded-xl text-zinc-700 hover:bg-zinc-100 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleResolveTicket(selectedTicketForResolve.id)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black"
                    >
                      Confirm Resolution
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. PLATFORM SETTINGS & SYSTEM POLICIES TAB */}
      {/* ========================================================================= */}
      {activeSubTab === 'settings' && platformSettingsState && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-zinc-200">
            <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
              <SettingsIcon className="h-6 w-6 text-zinc-800" />
              Platform System Settings &amp; Economic Policies
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Configure marketplace escrow holding parameters, commission rates, and linked Telebirr merchant infrastructure.
            </p>
          </div>

          <form onSubmit={handleSavePlatformSettings} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Economic Parameters */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2">
                <DollarSign className="h-4 w-4 text-emerald-600" />
                Marketplace Economics &amp; Escrow
              </h3>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Platform Commission Fee (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={platformSettingsState.platformFeePercent}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      platformFeePercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Deducted automatically from GMV when funds are released to farmers.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Escrow Hold Duration (Hours)
                </label>
                <input
                  type="number"
                  value={platformSettingsState.escrowHoldHours}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      escrowHoldHours: parseInt(e.target.value) || 24,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                />
                <span className="text-[10px] text-zinc-400 mt-0.5 block">
                  Window for buyer inspection before autonomous settlement release.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Minimum Order Amount (ETB)
                </label>
                <input
                  type="number"
                  value={platformSettingsState.minOrderAmountEtb}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      minOrderAmountEtb: parseFloat(e.target.value) || 500,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Currency</label>
                <input
                  type="text"
                  value={platformSettingsState.currency}
                  readOnly
                  className="w-full p-2.5 rounded-xl border border-zinc-200 bg-zinc-100 text-xs font-bold text-zinc-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Telebirr & AI Integration Settings */}
            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xs space-y-4">
              <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 border-b border-zinc-200 pb-2">
                <Smartphone className="h-4 w-4 text-blue-600" />
                Telebirr Link &amp; Autonomous AI Guardian
              </h3>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Admin Linked Telebirr Phone
                </label>
                <input
                  type="text"
                  value={platformSettingsState.telebirrPhone || ''}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      telebirrPhone: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold font-mono text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Telebirr Merchant Code / Shortcode
                </label>
                <input
                  type="text"
                  value={platformSettingsState.telebirrMerchantCode || ''}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      telebirrMerchantCode: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold font-mono text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Registered Account / Business Name
                </label>
                <input
                  type="text"
                  value={platformSettingsState.telebirrAccountName || ''}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      telebirrAccountName: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Autonomous AI Payment Guardian Mode
                </label>
                <select
                  value={platformSettingsState.aiPaymentMode || 'AI_AUTOPILOT'}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      aiPaymentMode: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900 bg-white"
                >
                  <option value="AI_AUTOPILOT">AI Autopilot (24/7 autonomous verification &amp; order confirmation)</option>
                  <option value="SMART_AWAY">Smart Away (AI controls payments only when admin is absent)</option>
                  <option value="MANUAL_ONLY">Manual Desk (Require manual human admin click on every payment)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  Support Helpdesk Phone
                </label>
                <input
                  type="text"
                  value={platformSettingsState.supportPhone}
                  onChange={(e) =>
                    setPlatformSettingsState({
                      ...platformSettingsState,
                      supportPhone: e.target.value,
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-zinc-300 text-xs font-bold text-zinc-900"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {savingSettings ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                <span>{savingSettings ? 'Saving Settings...' : 'Save & Deploy Platform Policies'}</span>
              </button>
            </div>
          </form>
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

      {/* ========================================================================= */}
      {/* REJECT PAYMENT MODAL */}
      {/* ========================================================================= */}
      {rejectModalPayment && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-black text-sm">{t.adminPortal.rejectModalTitle}</h3>
              </div>
              <button
                onClick={() => { setRejectModalPayment(null); setRejectReason(''); }}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 mb-4">{t.adminPortal.rejectModalSubtitle}</p>

            <div className="bg-zinc-50 rounded-xl p-3 border border-zinc-200 text-xs mb-4 space-y-1">
              <div className="flex justify-between">
                <span className="text-zinc-500">Order:</span>
                <span className="font-bold text-zinc-800">#{rejectModalPayment.orderNumber || rejectModalPayment.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount:</span>
                <span className="font-black text-emerald-800">{rejectModalPayment.amountEtb?.toLocaleString()} {t.common.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tx Reference:</span>
                <span className="font-mono font-bold text-zinc-900">{rejectModalPayment.transactionRef}</span>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs font-bold text-zinc-700 block mb-2">{t.adminPortal.rejectReasonPrompt}</label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {[
                  t.adminPortal.rejectPresetInvalidRef,
                  t.adminPortal.rejectPresetAmountMismatch,
                  t.adminPortal.rejectPresetDuplicate,
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter detailed reason for rejection..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-zinc-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectModalPayment(null); setRejectReason(''); }}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold cursor-pointer"
              >
                {t.adminPortal.closeBtn || 'Cancel'}
              </button>
              <button
                onClick={handleRejectPayment}
                disabled={actionInProgressId === rejectModalPayment.id}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer shadow-md disabled:opacity-50"
              >
                {t.adminPortal.confirmRejectBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI AUDIT LOG INSPECTOR MODAL */}
      {/* ========================================================================= */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-indigo-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3 mb-4">
              <div className="flex items-center gap-2 text-indigo-700">
                <Bot className="h-5 w-5" />
                <h3 className="font-black text-sm">AI Escrow Audit Verification</h3>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-indigo-900 font-bold">Decision:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-200 text-indigo-900">
                    {selectedAuditLog.decision || selectedAuditLog.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Actor:</span>
                  <span className="font-bold text-zinc-900">{selectedAuditLog.actor || 'AI Escrow Assistant'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Timestamp:</span>
                  <span className="font-mono text-zinc-800">{new Date(selectedAuditLog.timestamp || selectedAuditLog.createdAt || Date.now()).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction Ref:</span>
                  <span className="font-mono font-bold text-zinc-900">{selectedAuditLog.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Order Reference:</span>
                  <span className="font-mono text-zinc-800">{selectedAuditLog.orderNumber || `ORD-${selectedAuditLog.orderId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Amount:</span>
                  <span className="font-black text-emerald-800">{(selectedAuditLog.amountEtb || 0).toLocaleString()} {t.common.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fraud Risk Score:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    {((selectedAuditLog.fraudRiskScore || 0) * 100).toFixed(0)}% (Passed Safety Threshold)
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-zinc-700 block mb-1">Reasoning & AI Verification Rule:</label>
                <div className="p-3 bg-zinc-100 rounded-xl text-zinc-800 text-[11px] leading-relaxed border border-zinc-200">
                  {selectedAuditLog.reason || selectedAuditLog.aiReason || selectedAuditLog.paymentDetails?.adminNotes || 'Autonomously evaluated against CBE Birr / Telebirr confirmation rules.'}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer"
              >
                {t.adminPortal.closeBtn || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
