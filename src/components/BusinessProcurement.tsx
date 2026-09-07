import React, { useState, useEffect } from 'react';
import {
  Building2,
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { User, QuoteRequest } from '../types/index.ts';

interface BusinessProcurementProps {
  currentUser: User | null;
  onSelectProductForQuote?: () => void;
}

export const BusinessProcurement: React.FC<BusinessProcurementProps> = ({
  currentUser,
}) => {
  const [quotesList, setQuotesList] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewQuoteModal, setShowNewQuoteModal] = useState(false);

  // Form State
  const [productName, setProductName] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [unit, setUnit] = useState('TON');
  const [requestedGrade, setRequestedGrade] = useState('GRADE_1_EXPORT');
  const [targetPriceEtb, setTargetPriceEtb] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotesList(data);
      }
    } catch (err) {
      console.error('Failed to load quote requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName,
          requestedQuantity: Number(requestedQuantity),
          unit,
          requestedGrade,
          targetPriceEtb: targetPriceEtb ? Number(targetPriceEtb) : null,
          deliveryDate,
          deliveryLocation,
        }),
      });

      if (res.ok) {
        setShowNewQuoteModal(false);
        fetchQuotes();
      }
    } catch (err) {
      console.error('Error submitting quote request:', err);
    }
  };

  const handleRespondQuote = async (quoteId: number, status: 'OFFERED' | 'ACCEPTED' | 'REJECTED') => {
    try {
      const res = await fetch(`/api/quotes/${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          offerPriceEtb: 54000,
          offerNotes: 'Direct cold-chain truck delivery confirmed from Wonji agricultural cluster.',
        }),
      });
      if (res.ok) {
        fetchQuotes();
      }
    } catch (err) {
      console.error('Error updating quote:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="h-4 w-4" /> B2B Institutional Procurement Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-black">
              Bulk Agricultural Sourcing & Contracts
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Contract directly with commercial farming estates for hotels, supermarket chains, food processing factories, and global export batches.
            </p>
          </div>

          <button
            onClick={() => setShowNewQuoteModal(true)}
            className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Bulk Sourcing RFQ
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900">Direct Contract Assurance</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Eliminate middlemen markups and secure fixed-price, seasonal harvest agreements directly with verified cooperatives.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <TrendingUp className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900">Custom Grading & Specs</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Define precise brix tolerances, sizing, ripeness stages, and packaging crates required for your industrial kitchen or export line.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-2">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <h4 className="font-bold text-sm text-zinc-900">Scheduled Cold-Chain Fleet</h4>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Automatic staging at regional hubs with temperature telemetry and guaranteed delivery windows in Addis Ababa.
          </p>
        </div>
      </div>

      {/* Quote Requests Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">Institutional RFQ Quotes & Bids</h3>
            <p className="text-xs text-zinc-500">Live requests for quotation active between commercial buyers and farmers</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-500">Loading procurement quotes...</div>
        ) : quotesList.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">No active quote requests found.</div>
        ) : (
          <div className="space-y-4">
            {quotesList.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-zinc-900">{q.productName}</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900">
                        {q.requestedGrade.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Requested by <strong className="text-zinc-800">{q.buyerOrganization || q.buyerName}</strong>
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      q.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : q.status === 'OFFERED'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {q.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white p-3.5 rounded-lg border border-zinc-200">
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Quantity</span>
                    <span className="font-bold text-zinc-900">{q.requestedQuantity} {q.unit}s</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Target Price</span>
                    <span className="font-bold text-zinc-900">{q.targetPriceEtb?.toLocaleString() || 'Market'} ETB</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Delivery Date</span>
                    <span className="font-bold text-zinc-900">{q.deliveryDate}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] uppercase font-bold">Dropoff Destination</span>
                    <span className="font-bold text-zinc-900 truncate block">{q.deliveryLocation}</span>
                  </div>
                </div>

                {q.offerNotes && (
                  <div className="text-xs bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/80 text-emerald-900">
                    <strong>Farmer Counter-Offer:</strong> {q.offerPriceEtb?.toLocaleString()} ETB • {q.offerNotes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {q.status === 'PENDING' && (
                    <button
                      onClick={() => handleRespondQuote(q.id, 'OFFERED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Submit Farmer Bid
                    </button>
                  )}
                  {q.status === 'OFFERED' && (
                    <button
                      onClick={() => handleRespondQuote(q.id, 'ACCEPTED')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Accept Counter-Bid & Contract
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Create Bulk RFQ */}
      {showNewQuoteModal && (
        <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200">
            <h3 className="text-lg font-black text-zinc-900 mb-1">Create Institutional Bulk RFQ</h3>
            <p className="text-xs text-zinc-500 mb-4">Broadcast procurement terms directly to certified grower clusters</p>

            <form onSubmit={handleCreateQuote} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Produce / Crop Spec</label>
                <input
                  type="text"
                  required
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Requested Qty</label>
                  <input
                    type="number"
                    required
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="TON">TON</option>
                    <option value="QUINTAL">QUINTAL</option>
                    <option value="CRATE">CRATE</option>
                    <option value="KG">KG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Quality Grade</label>
                  <select
                    value={requestedGrade}
                    onChange={(e) => setRequestedGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="GRADE_1_EXPORT">Export Grade 1</option>
                    <option value="GRADE_1_LOCAL">Local Grade 1</option>
                    <option value="GRADE_2_COMMERCIAL">Grade 2 Commercial</option>
                    <option value="PROCESSING_GRADE">Processing Grade</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">Target Price (ETB Total)</label>
                  <input
                    type="number"
                    value={targetPriceEtb}
                    onChange={(e) => setTargetPriceEtb(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">Delivery Destination</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewQuoteModal(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-zinc-100 font-bold text-xs text-zinc-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-blue-900 font-bold text-xs text-white cursor-pointer"
                >
                  Broadcast RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
