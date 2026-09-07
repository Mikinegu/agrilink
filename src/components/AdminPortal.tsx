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
} from 'lucide-react';
import { User, Order, Payment, Product } from '../types/index.ts';

interface AdminPortalProps {
  currentUser: User | null;
  onRefreshAll: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onRefreshAll,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'payments' | 'produce' | 'users' | 'analytics'>('orders');
  const [metrics, setMetrics] = useState<any>(null);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [paymentsList, setPaymentsList] = useState<Payment[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<Order | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [ovRes, ordRes, payRes, usrRes, prodRes] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/orders'),
        fetch('/api/admin/payments'),
        fetch('/api/auth/users'),
        fetch('/api/products'),
      ]);

      if (ovRes.ok) setMetrics(await ovRes.json());
      if (ordRes.ok) setOrdersList(await ordRes.json());
      if (payRes.ok) setPaymentsList(await payRes.json());
      if (usrRes.ok) setAllUsers(await usrRes.json());
      if (prodRes.ok) setProductsList(await prodRes.json());
    } catch (err) {
      console.error('Failed to load admin overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const showFeedback = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
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

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" /> PAID
          </span>
        );
      case 'ESCROW_HELD':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 border border-blue-300">
            <ShieldCheck className="h-3 w-3 text-blue-600" /> ESCROW HELD
          </span>
        );
      case 'RELEASED_TO_FARMER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-100 text-teal-800 border border-teal-300">
            <Wallet className="h-3 w-3 text-teal-600" /> SETTLED TO FARMER
          </span>
        );
      case 'PENDING':
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="h-3 w-3 text-amber-600" /> PENDING PAYMENT
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
            <CheckCircle2 className="h-3 w-3" /> Delivered
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200 animate-pulse">
            <Truck className="h-3 w-3" /> In Transit
          </span>
        );
      case 'CONFIRMED':
      case 'DRIVER_ASSIGNED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Package className="h-3 w-3" /> Dispatched
          </span>
        );
      case 'PREPARING':
      case 'READY_FOR_PICKUP':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="h-3 w-3" /> Hub Cross-Dock
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
              <ShieldAlert className="h-4 w-4 text-emerald-400" /> Business Owner & Operations Command Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              AgriLink Orders, Payments & Escrow Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl leading-relaxed">
              Complete real-time visibility into customer purchase orders, Telebirr/CBE Birr payment settlements, escrow guarantees, farmer produce dispatch, and delivery fulfillment across Ethiopia.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Database className="h-4 w-4" /> {seeding ? 'Seeding...' : 'Refresh DB Data'}
            </button>
            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-all"
              title="Refresh Live Data"
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
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Gross Orders Volume (GMV)</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-zinc-950 mt-1 block">
            {metrics ? (metrics.gmvEtb || 0).toLocaleString() : '1,240,000'} <span className="text-xs font-bold text-zinc-500">ETB</span>
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1.5">
            <TrendingUp className="h-3.5 w-3.5" /> 100% Escrow protected
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Collected Payments</span>
            <CreditCard className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-950 mt-1 block">
            {metrics ? (metrics.totalPaidAmountEtb || metrics.gmvEtb || 0).toLocaleString() : '1,120,000'} <span className="text-xs font-bold text-zinc-500">ETB</span>
          </span>
          <span className="text-[11px] text-blue-700 font-medium mt-1.5 block">
            Telebirr • CBE Birr • Awash Bank
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Total Orders Placed</span>
            <Package className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-zinc-900 mt-1 block">
            {ordersList.length || (metrics ? metrics.totalOrdersCount : 0)} Orders
          </span>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 mt-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" /> {ordersList.filter((o) => o.orderStatus === 'DELIVERED').length} Delivered
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs text-zinc-500 font-semibold">Platform Fee (2%)</span>
            <Award className="h-4 w-4 text-teal-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-teal-950 mt-1 block">
            {metrics ? (metrics.platformRevenueEtb || 0).toLocaleString() : '24,800'} <span className="text-xs font-bold text-zinc-500">ETB</span>
          </span>
          <span className="text-[11px] text-zinc-500 font-medium mt-1.5 block">
            Escrow fee & Quality audit
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
          <span>Orders & Customers</span>
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
          <span>Payments & Escrow Ledger</span>
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
          <span>Produce & Crops</span>
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
          <span>Stakeholders & Users</span>
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
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by buyer name, phone, order number, crop name, or transaction ref..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  Clear
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
                <option value="ALL">All Delivery Statuses</option>
                <option value="CONFIRMED">Dispatched</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
                <option value="PREPARING">Preparing / Cross-Dock</option>
              </select>

              {/* Payment Status Filter */}
              <select
                value={selectedPaymentFilter}
                onChange={(e) => setSelectedPaymentFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-zinc-700 cursor-pointer"
              >
                <option value="ALL">All Payment Statuses</option>
                <option value="PAID">Paid</option>
                <option value="ESCROW_HELD">Escrow Held</option>
                <option value="RELEASED_TO_FARMER">Settled to Farmer</option>
                <option value="PENDING">Pending Payment</option>
              </select>
            </div>
          </div>

          {/* Orders Count and Status Summary */}
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>
              Showing <strong className="text-zinc-900">{filteredOrders.length}</strong> of{' '}
              <strong className="text-zinc-900">{ordersList.length}</strong> customer orders
            </span>
            <span className="font-mono text-[11px] text-zinc-400">Live PostgreSQL Sync</span>
          </div>

          {/* Orders Cards Grid / Table */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center">
              <Package className="h-10 w-10 text-zinc-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-zinc-900">No matching orders found</h3>
              <p className="text-xs text-zinc-500 mt-1">Try clearing your search query or filters.</p>
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
                        <span className="text-[11px] text-zinc-400 font-mono">
                          • {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Who Ordered */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-600">
                        <div className="flex items-center gap-1 font-bold text-zinc-900">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>Buyer: {ord.buyerName || ord.deliveryContactName}</span>
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
                    </div>

                    {/* Order Financial Amount */}
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-zinc-500 block">Total Order Value</span>
                      <span className="text-xl font-black text-emerald-950">
                        {ord.grandTotalEtb.toLocaleString()} <span className="text-xs font-bold text-zinc-500">ETB</span>
                      </span>
                      {ord.payment?.provider && (
                        <span className="text-[11px] text-zinc-500 font-medium block">
                          via {ord.payment.provider.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Products Ordered Breakdown */}
                  <div className="py-3">
                    <span className="text-[11px] uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                      Crops & Produce in this Order ({ord.items?.length || 0} item{ord.items?.length !== 1 ? 's' : ''})
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
                              Quantity: <strong className="text-zinc-800">{it.quantity} {it.unit}</strong> @ {it.unitPriceEtb} ETB/{it.unit}
                            </div>
                            {it.lotBatchNumber && (
                              <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                                LOT: {it.lotBatchNumber}
                              </div>
                            )}
                          </div>
                          <span className="font-black text-xs text-zinc-900 whitespace-nowrap">
                            {it.subtotalEtb.toLocaleString()} ETB
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
                          <span>TxRef: <strong>{ord.payment.transactionRef}</strong></span>
                        </div>
                      )}
                      {ord.payerAccountNumber && (
                        <div className="flex items-center gap-1 text-[11px]">
                          <span>Payer Acct: <strong>{ord.payerAccountNumber}</strong></span>
                        </div>
                      )}
                      {ord.tinNumber && (
                        <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                          <span>TIN: <strong>{ord.tinNumber}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* Owner Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* One-click Verify / Pay */}
                      {ord.paymentStatus !== 'PAID' && ord.paymentStatus !== 'RELEASED_TO_FARMER' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(ord.id, 'PAID')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> Verify Paid
                        </button>
                      )}

                      {/* Release Escrow to Farmer */}
                      {ord.paymentStatus === 'PAID' && (
                        <button
                          onClick={() => handleUpdatePaymentStatus(ord.id, 'RELEASED_TO_FARMER')}
                          className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-600 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                          title="Release escrow payment to the smallholder farmer after delivery confirmation"
                        >
                          <Wallet className="h-3.5 w-3.5" /> Release Escrow to Farmer
                        </button>
                      )}

                      {/* Dispatch Status Controls */}
                      {ord.orderStatus !== 'DELIVERED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, ord.orderStatus === 'CONFIRMED' ? 'IN_TRANSIT' : 'DELIVERED')}
                          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          {ord.orderStatus === 'CONFIRMED' ? 'Mark In-Transit' : 'Mark Delivered'}
                        </button>
                      )}

                      {/* View Dossier Modal */}
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                      >
                        <Eye className="h-3.5 w-3.5 text-zinc-500" /> Dossier
                      </button>

                      {/* View / Print Official Receipt */}
                      <button
                        onClick={() => setInvoiceModalOrder(ord)}
                        className="px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold cursor-pointer flex items-center gap-1"
                        title="View Official Ethiopian Tax Invoice & Receipt"
                      >
                        <Printer className="h-3.5 w-3.5 text-zinc-500" /> Invoice
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
                  Real-time Settlement & Escrow Vault
                </span>
                <h3 className="text-xl font-black mt-1">National Agri-Payment Rails</h3>
                <p className="text-xs text-zinc-300 mt-1 max-w-2xl">
                  Automated escrow protection holds buyer payments until produce reaches the destination hub, safeguarding both buyers and smallholder farmers.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] text-zinc-300 uppercase block font-semibold">Total Escrow Volume</span>
                  <span className="text-lg font-black text-white">
                    {metrics ? (metrics.gmvEtb || 0).toLocaleString() : '1,240,000'} ETB
                  </span>
                </div>
                <div className="bg-white/10 px-4 py-2.5 rounded-xl">
                  <span className="text-[10px] text-zinc-300 uppercase block font-semibold">Transactions</span>
                  <span className="text-lg font-black text-emerald-300">{paymentsList.length} Settled</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-zinc-900">Payment & Escrow Transactions Ledger</h3>
                <p className="text-xs text-zinc-500">Every payment initiated across Telebirr, CBE Birr, Awash Bank, and Chapa</p>
              </div>
              <span className="text-xs font-mono text-zinc-500">{paymentsList.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="p-4">Transaction Ref</th>
                    <th className="p-4">Payer / Customer</th>
                    <th className="p-4">Order #</th>
                    <th className="p-4">Amount (ETB)</th>
                    <th className="p-4">Payment Provider</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date / Time</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {paymentsList.map((p: any) => (
                    <tr key={p.id} className="hover:bg-zinc-50">
                      <td className="p-4 font-mono font-bold text-zinc-950">
                        {p.transactionRef}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900">{p.userName || 'Customer'}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{p.userPhone}</div>
                        {p.organizationName && (
                          <div className="text-[10px] text-zinc-400">{p.organizationName}</div>
                        )}
                      </td>
                      <td className="p-4 font-mono font-medium text-emerald-900">
                        {p.orderNumber}
                      </td>
                      <td className="p-4 font-black text-zinc-950">
                        {p.amountEtb.toLocaleString()} ETB
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
                            Release Escrow
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
              <h3 className="text-sm font-bold text-zinc-900">Active Smallholder Produce Catalog</h3>
              <p className="text-xs text-zinc-500">Authentic Ethiopian crops listed directly by local farmers with lot batch traceability</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{productsList.length} Active Crops</span>
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
                      <span className="text-[11px] text-zinc-400 block">Unit Farm Price</span>
                      <strong className="text-emerald-950 font-black text-sm">
                        {prod.pricePerUnitEtb.toLocaleString()} ETB
                      </strong>{' '}
                      <span className="text-[10px] text-zinc-500">/{prod.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-zinc-400 block">Stock Available</span>
                      <strong className="text-zinc-900 font-bold">
                        {prod.availableQuantity} {prod.unit}s
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 px-4 py-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <span>Farmer: <strong className="text-zinc-800">{prod.farmerName || 'Verified Smallholder'}</strong></span>
                  <span className="text-emerald-700 font-bold">Grade: {prod.grade}</span>
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
              <h3 className="text-base font-bold text-zinc-900">Platform Users & RBAC Directory</h3>
              <p className="text-xs text-zinc-500">All registered stakeholder accounts in PostgreSQL with active role mappings</p>
            </div>
            <span className="text-xs font-mono text-zinc-500">{allUsers.length} Active Records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Region / Base</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Contact Phone</th>
                  <th className="p-4">Verification</th>
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
                          <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                        </span>
                      ) : (
                        <span className="text-zinc-400">Standard</span>
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
                <h3 className="text-lg font-black text-zinc-900">Customer Order Dossier</h3>
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
                  Customer & Delivery Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Customer Name</span>
                    <strong className="text-zinc-900 font-bold text-sm">
                      {selectedOrder.buyerName || selectedOrder.deliveryContactName}
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Phone Number</span>
                    <strong className="text-zinc-900 font-mono">{selectedOrder.deliveryContactPhone}</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Delivery Location</span>
                    <span className="text-zinc-700">{selectedOrder.deliveryAddress}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[11px]">Fayda / TIN Number</span>
                    <span className="text-zinc-700 font-mono">{selectedOrder.tinNumber || selectedOrder.nationalIdNumber || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                  Ordered Crop Items
                </span>
                <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl overflow-hidden">
                  {selectedOrder.items?.map((it) => (
                    <div key={it.id} className="p-3 bg-white flex items-center justify-between">
                      <div>
                        <div className="font-bold text-zinc-900">{it.name}</div>
                        <div className="text-zinc-500 text-[11px]">
                          {it.quantity} {it.unit} @ {it.unitPriceEtb} ETB/{it.unit} • Lot: {it.lotBatchNumber}
                        </div>
                      </div>
                      <div className="font-black text-sm text-zinc-950">
                        {it.subtotalEtb.toLocaleString()} ETB
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block mb-2">
                  Payment & Escrow Information
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Payment Status</span>
                    {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Grand Total</span>
                    <strong className="text-emerald-950 font-black text-base">
                      {selectedOrder.grandTotalEtb.toLocaleString()} ETB
                    </strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Provider / Gateway</span>
                    <strong className="text-emerald-950 font-mono">{selectedOrder.payment?.provider || 'TELEBIRR'}</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px]">Transaction Reference</span>
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
                  <Printer className="h-4 w-4" /> Print Tax Receipt
                </button>
                {selectedOrder.paymentStatus !== 'PAID' && (
                  <button
                    onClick={() => handleUpdatePaymentStatus(selectedOrder.id, 'PAID')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="h-4 w-4" /> Verify Payment
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
                <span className="text-xs font-black tracking-wider text-emerald-800 uppercase">AGRILINK ETHIOPIA</span>
                <h3 className="text-xl font-black text-zinc-950">Commercial Produce Invoice</h3>
                <span className="text-xs text-zinc-400 font-mono">Invoice #{invoiceModalOrder.orderNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-bold block uppercase">Date Issued</span>
                <span className="text-xs font-bold text-zinc-800">
                  {new Date(invoiceModalOrder.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>

            {/* Billed To / Shipped To */}
            <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-zinc-50 p-4 rounded-xl border border-zinc-200">
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Customer / Billed To:</span>
                <div className="font-bold text-zinc-900 text-sm">
                  {invoiceModalOrder.buyerName || invoiceModalOrder.deliveryContactName}
                </div>
                <div className="text-zinc-600">{invoiceModalOrder.deliveryAddress}</div>
                <div className="text-zinc-500 font-mono">{invoiceModalOrder.deliveryContactPhone}</div>
                {invoiceModalOrder.tinNumber && (
                  <div className="text-[10px] text-zinc-400 mt-1 font-mono">TIN: {invoiceModalOrder.tinNumber}</div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold block mb-1">Payment & Escrow Seal:</span>
                <div className="font-bold text-emerald-800 font-mono">
                  {invoiceModalOrder.payment?.provider || 'TELEBIRR / CBE BIRR'}
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  Ref: {invoiceModalOrder.payment?.transactionRef || 'TX-ETH-AGRI'}
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
                    <th className="p-3">Produce Item</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {invoiceModalOrder.items?.map((it) => (
                    <tr key={it.id}>
                      <td className="p-3 font-bold text-zinc-900">{it.name}</td>
                      <td className="p-3 text-center text-zinc-600">{it.quantity} {it.unit}</td>
                      <td className="p-3 text-right text-zinc-600">{it.unitPriceEtb} ETB</td>
                      <td className="p-3 text-right font-bold text-zinc-900">{it.subtotalEtb.toLocaleString()} ETB</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Math */}
            <div className="space-y-1.5 text-xs border-t border-zinc-200 pt-3 mb-6">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{invoiceModalOrder.totalAmountEtb.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Delivery & Cold-Chain Logistics</span>
                <span>{(invoiceModalOrder.deliveryFeeEtb || 0).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Platform Quality & Escrow Fee (2%)</span>
                <span>{(invoiceModalOrder.serviceFeeEtb || 0).toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-base font-black text-zinc-950 pt-2 border-t border-zinc-200">
                <span>Grand Total (ETB)</span>
                <span className="text-emerald-800">{invoiceModalOrder.grandTotalEtb.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Modal Bottom Controls */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              <button
                onClick={() => setInvoiceModalOrder(null)}
                className="px-4 py-2 rounded-xl border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
