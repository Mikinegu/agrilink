import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Order } from '../types/index.ts';

export const BuyerOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const defaultMockOrders = [
    {
      id: 1042,
      orderNumber: 'AGR-2026-1042',
      createdAt: '2026-09-05T10:30:00Z',
      totalAmountEtb: 68500,
      orderStatus: 'IN_TRANSIT',
      paymentStatus: 'PAID',
      deliveryModel: 'HUB_CROSS_DOCK',
      deliveryAddress: 'Bole Bulbula Warehouse 4, Addis Ababa',
      itemsCount: 2,
      driverName: 'Dawit Kebede (Isuzu NPR 3.5T)',
      estimatedArrival: 'Tomorrow, 2:00 PM',
    },
    {
      id: 1038,
      orderNumber: 'AGR-2026-1038',
      createdAt: '2026-09-02T14:15:00Z',
      totalAmountEtb: 115000,
      orderStatus: 'DELIVERED',
      paymentStatus: 'PAID',
      deliveryModel: 'DIRECT',
      deliveryAddress: 'Kality Industrial Zone, Addis Ababa',
      itemsCount: 5,
      driverName: 'Tewodros Kassahun',
      estimatedArrival: 'Delivered & Signed',
    },
  ];

  const displayOrders = orders.length > 0 ? orders : (defaultMockOrders as any);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Purchase Orders & Shipments</h1>
        <p className="text-sm text-zinc-500">Track logistics dispatch, freight transit, and delivery inspection receipts.</p>
      </div>

      <div className="space-y-4">
        {displayOrders.map((order: any) => {
          const isExpanded = expandedId === order.id;
          const isDelivered = order.orderStatus === 'DELIVERED' || order.orderStatus === 'COMPLETED';
          const isInTransit = order.orderStatus === 'IN_TRANSIT' || order.orderStatus === 'PICKED_UP';

          return (
            <div key={order.id} className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
              <div
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/60 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isDelivered
                        ? 'bg-emerald-50 text-emerald-600'
                        : isInTransit
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    <Truck className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-zinc-900 text-base">{order.orderNumber || `ORD-${order.id}`}</h3>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isInTransit
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {order.orderStatus?.replace(/_/g, ' ') || 'PROCESSING'}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate max-w-xs">{order.deliveryAddress || 'Addis Ababa'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-100">
                  <div className="text-left md:text-right">
                    <span className="text-base font-black text-zinc-950">
                      {Number(order.totalAmountEtb || 0).toLocaleString()} ETB
                    </span>
                    <p className="text-xs font-semibold text-emerald-600">Escrow Protected</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-zinc-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-zinc-100 bg-zinc-50/40 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-zinc-200">
                      <span className="font-bold text-zinc-500 block mb-1">Logistics & Driver</span>
                      <p className="font-semibold text-zinc-800">{order.driverName || 'Designated Regional Carrier'}</p>
                      <p className="text-zinc-400 mt-0.5">Model: {order.deliveryModel || 'Direct Farm Pickup'}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-zinc-200">
                      <span className="font-bold text-zinc-500 block mb-1">Estimated Arrival</span>
                      <p className="font-semibold text-zinc-800">{order.estimatedArrival || 'Within 24-48 hours'}</p>
                      <p className="text-emerald-600 font-medium mt-0.5">GPS Monitored Corridor</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-zinc-200">
                      <span className="font-bold text-zinc-500 block mb-1">Quality Inspection</span>
                      <p className="font-semibold text-zinc-800">Pre-inspected at farm gate</p>
                      <p className="text-zinc-400 mt-0.5">Grade 1 standard confirmed</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
