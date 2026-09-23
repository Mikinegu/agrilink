import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  Filter,
  RefreshCw,
  Building2,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { QuoteRequest } from '../types/index.ts';

export const BuyRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { t, currentLanguage } = useTranslation();

  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state
  const [productName, setProductName] = useState('');
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [unit, setUnit] = useState('QUINTAL');
  const [requestedGrade, setRequestedGrade] = useState('GRADE_1');
  const [targetPriceEtb, setTargetPriceEtb] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quotes');
      if (res.ok) {
        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load quote requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchQuotes();
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !requestedQuantity) return;

    setSubmitting(true);
    setFeedbackMsg(null);

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
          deliveryDate: deliveryDate || null,
          deliveryLocation: deliveryLocation || (currentUser?.region ? `${currentUser.region}, Ethiopia` : 'Addis Ababa'),
        }),
      });

      if (res.ok) {
        setFeedbackMsg({
          type: 'success',
          text: currentLanguage === 'am'
            ? 'የግዢ ጥያቄዎ በተሳካ ሁኔታ ተልኳል!'
            : currentLanguage === 'om'
            ? 'Gaaffiin bittaa keessan milkaa\'inaan ergamerra!'
            : 'Buy request published successfully! Direct producer matches notified.',
        });
        setProductName('');
        setRequestedQuantity('');
        setTargetPriceEtb('');
        setDeliveryDate('');
        setDeliveryLocation('');
        setShowModal(false);
        fetchQuotes();
      } else {
        const err = await res.json();
        setFeedbackMsg({ type: 'error', text: err.error || 'Failed to submit buy request.' });
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Network connection failed. Please retry.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3" /> {currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : currentLanguage === 'om' ? 'Eeggachaa jira' : 'Pending Offers'}
          </span>
        );
      case 'OFFERED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3 h-3" /> {currentLanguage === 'am' ? 'ቅናሽ ቀርቧል' : currentLanguage === 'om' ? 'Dhihaateera' : 'Offer Received'}
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> {currentLanguage === 'am' ? 'ተቀባይነት አግኝቷል' : currentLanguage === 'om' ? 'Fudhatameera' : 'Accepted'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 text-white p-6 sm:p-8 shadow-xl border border-blue-900/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                {currentLanguage === 'am' ? 'የድርጅት ግዢ መድረክ' : currentLanguage === 'om' ? 'Bittaa Dhaabbataa' : 'Commercial Procurement Desk'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {currentLanguage === 'am' ? 'የግዢ ጥያቄዎች (RFQs)' : currentLanguage === 'om' ? 'Gaaffiilee Bittaa (RFQs)' : 'Buy Requests & RFQs'}
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              {currentLanguage === 'am'
                ? 'የሚፈልጉትን የግብርና ምርት መጠን እና ጥራት በመጥቀስ በቀጥታ ከአምራች ገበሬዎች ጋር ይገናኙ።'
                : currentLanguage === 'om'
                ? 'Gosa fi hamma midhaan barbaaddan ibsuun oomishtoota waliin kallattiin walqunnamaa.'
                : 'Post bulk harvest procurement requests. Direct producer cooperatives submit binding quotes with guaranteed escrow fulfillment.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border border-white/20 transition-all cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all hover:scale-102 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{currentLanguage === 'am' ? 'አዲስ የግዢ ጥያቄ' : currentLanguage === 'om' ? 'Gaaffii Bittaa Haaraa' : 'Post Buy Request'}</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-sm font-medium ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 hover:bg-black/5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'ጠቅላላ ጥያቄዎች' : 'Total Requests'}</span>
          <p className="text-2xl font-black text-zinc-900">{quotes.length}</p>
          <span className="text-xs text-blue-600 font-medium flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> {currentLanguage === 'am' ? 'የገበያ ጨረታዎች' : 'Sourced RFQs'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Awaiting Offers'}</span>
          <p className="text-2xl font-black text-amber-600">{quotes.filter((q) => q.status === 'PENDING').length}</p>
          <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {currentLanguage === 'am' ? 'ገበሬዎች እየገመገሙት ነው' : 'Producer review'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'ቅናሽ የቀረበባቸው' : 'Offers In-Hand'}</span>
          <p className="text-2xl font-black text-emerald-600">{quotes.filter((q) => q.status === 'OFFERED').length}</p>
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> {currentLanguage === 'am' ? 'ለመስማማት ዝግጁ' : 'Ready for contract'}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-xs space-y-1">
          <span className="text-xs font-semibold text-zinc-500">{currentLanguage === 'am' ? 'የተረጋገጠ አቅርቦት' : 'Escrow Protected'}</span>
          <p className="text-2xl font-black text-zinc-900">100%</p>
          <span className="text-xs text-teal-600 font-medium flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5" /> CBE / Telebirr Safe
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={currentLanguage === 'am' ? 'በምርት ስም ወይም መዳረሻ ይፈልጉ...' : 'Search by product or destination...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'OFFERED', 'ACCEPTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {st === 'ALL'
                ? currentLanguage === 'am'
                  ? 'ሁሉም'
                  : 'All'
                : st === 'PENDING'
                ? currentLanguage === 'am'
                  ? 'በመጠባበቅ ላይ'
                  : 'Pending'
                : st === 'OFFERED'
                ? currentLanguage === 'am'
                  ? 'ቅናሾች'
                  : 'Offered'
                : currentLanguage === 'am'
                ? 'ተቀባይነት ያገኙ'
                : 'Accepted'}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-zinc-900">
              {currentLanguage === 'am' ? 'የተመዘገቡ የግዢ ጥያቄዎች' : 'Active Commercial Sourcing Requests'}
            </h2>
          </div>
          <span className="text-xs font-semibold text-zinc-400">
            {filteredQuotes.length} {currentLanguage === 'am' ? 'ጥያቄዎች ተገኝተዋል' : 'records found'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-zinc-400 space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            <p className="text-sm font-medium">{currentLanguage === 'am' ? 'ጥያቄዎች በመጫን ላይ...' : 'Loading buy requests...'}</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold">
              {currentLanguage === 'am' ? 'ምንም አይነት የግዢ ጥያቄ አልተገኘም' : 'No buy requests match your query'}
            </p>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {currentLanguage === 'am'
                ? 'አዲስ የግዢ ጥያቄ በመለጠፍ ከአምራቾች ጋር ይገናኙ።'
                : 'Publish a new harvest procurement request to receive quotes directly from verified farmer cooperatives.'}
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" /> {currentLanguage === 'am' ? 'ጥያቄ ይለጥፉ' : 'Create First Request'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredQuotes.map((q) => (
              <div key={q.id} className="p-5 hover:bg-zinc-50/60 transition-colors space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-zinc-950">{q.productName}</h3>
                      <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700">
                        {q.requestedGrade || 'Standard'}
                      </span>
                      {getStatusBadge(q.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        {q.deliveryLocation || 'Addis Ababa Terminal'}
                      </span>
                      {q.deliveryDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          {currentLanguage === 'am' ? 'የሚፈለግበት ቀን:' : 'Required by:'} {new Date(q.deliveryDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                    <div className="text-right">
                      <p className="text-xs text-zinc-400 font-semibold">{currentLanguage === 'am' ? 'የተጠየቀ መጠን' : 'Volume'}</p>
                      <p className="text-base font-black text-zinc-950">
                        {q.requestedQuantity} <span className="text-xs font-bold text-zinc-500">{q.unit}</span>
                      </p>
                    </div>

                    {q.targetPriceEtb && (
                      <div className="text-right">
                        <p className="text-xs text-zinc-400 font-semibold">{currentLanguage === 'am' ? 'የታለመ ዋጋ' : 'Target Price'}</p>
                        <p className="text-base font-black text-emerald-600">
                          {Number(q.targetPriceEtb).toLocaleString()} <span className="text-xs font-bold text-zinc-500">ETB</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {q.offerNotes && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">{currentLanguage === 'am' ? 'የአምራች ምላሽ:' : 'Producer Bid Notes:'} </span>
                      {q.offerNotes}
                      {q.offerPriceEtb && (
                        <span className="font-bold text-emerald-700 ml-1">
                          ({Number(q.offerPriceEtb).toLocaleString()} ETB/{q.unit})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Post New Buy Request */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-950 text-base">
                    {currentLanguage === 'am' ? 'አዲስ የግብርና ምርት ግዢ ጥያቄ ይለጥፉ' : 'Create Commercial Buy Request'}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {currentLanguage === 'am' ? 'ቀጥታ ለአምራቾች እና ህብረት ስራ ማህበራት ይደርሳል' : 'Distributed to verified producer cooperatives'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-zinc-200/60 rounded-xl text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                  {currentLanguage === 'am' ? 'የምርት ስም *' : 'Commodity / Product Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Magna White Teff, Harar Coffee, Red Kidney Beans"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'የሚፈለገው መጠን *' : 'Required Quantity *'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 100"
                    value={requestedQuantity}
                    onChange={(e) => setRequestedQuantity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'መለኪያ' : 'Unit'}
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900 cursor-pointer"
                  >
                    <option value="QUINTAL">Quintal (100 kg)</option>
                    <option value="TON">Metric Ton (1,000 kg)</option>
                    <option value="KG">Kilogram (KG)</option>
                    <option value="CRATE">Crate / Box</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'የጥራት ደረጃ' : 'Quality Grade Requirement'}
                  </label>
                  <select
                    value={requestedGrade}
                    onChange={(e) => setRequestedGrade(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900 cursor-pointer"
                  >
                    <option value="PREMIUM_EXPORT">ECX Premium Export Grade 1</option>
                    <option value="GRADE_1">Grade 1 Commercial</option>
                    <option value="GRADE_2">Grade 2 Standard</option>
                    <option value="ORGANIC_CERTIFIED">Certified Organic</option>
                    <option value="PROCESSING_GRADE">Processing / Industrial Mill Grade</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'የታለመ ዋጋ (ETB/መለኪያ)' : 'Target Price (ETB/Unit)'}
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 11500"
                    value={targetPriceEtb}
                    onChange={(e) => setTargetPriceEtb(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'የማስረከቢያ ቀን' : 'Required Delivery Date'}
                  </label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-1">
                    {currentLanguage === 'am' ? 'መድረሻ ቦታ' : 'Destination Hub / Address'}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kality Central Grain Warehouse, Addis Ababa"
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-zinc-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  {currentLanguage === 'am' ? 'ይቅር' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? (currentLanguage === 'am' ? 'በመላክ ላይ...' : 'Publishing...') : (currentLanguage === 'am' ? 'ጥያቄውን ይላኩ' : 'Publish Sourcing Request')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
