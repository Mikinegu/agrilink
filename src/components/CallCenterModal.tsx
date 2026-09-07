import React, { useState } from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import {
  Phone,
  PhoneCall,
  Smartphone,
  Headphones,
  Clock,
  MapPin,
  Globe2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface CallCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUSSD?: () => void;
}

export const CallCenterModal: React.FC<CallCenterModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [callbackName, setCallbackName] = useState('');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackTopic, setCallbackTopic] = useState('Trade Support & Escrow');
  const [callbackRequested, setCallbackRequested] = useState(false);

  if (!isOpen) return null;

  const regionalDesks = [
    {
      region: 'National Headquarters & Escrow Desk',
      location: 'Addis Ababa (Bole Sub-City / Kazanchis)',
      phone: '0961123330',
      hours: '24/7 Multilingual Support',
      primary: true,
    },
    {
      region: 'Oromia & Rift Valley Trade Corridor',
      location: 'Adama Hub & Mojo Agro-Terminal',
      phone: '+251 22 111 8840',
      hours: 'Mon - Sat: 7:00 AM - 9:00 PM',
      primary: false,
    },
    {
      region: 'Sidama & Southern Cold-Chain Desk',
      location: 'Hawassa Industrial Agri-Park',
      phone: '+251 46 220 4410',
      hours: 'Mon - Sat: 7:30 AM - 8:30 PM',
      primary: false,
    },
    {
      region: 'Amhara & Northwest Cereal Corridor',
      location: 'Bahir Dar & Gondar Logistics Office',
      phone: '+251 58 226 9100',
      hours: 'Mon - Sat: 8:00 AM - 8:00 PM',
      primary: false,
    },
    {
      region: 'Tigray & Northern Ag-Exchange',
      location: 'Mekelle Central Hub',
      phone: '+251 34 440 8200',
      hours: 'Mon - Sat: 8:00 AM - 7:00 PM',
      primary: false,
    },
  ];

  const handleRequestCallback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;
    setCallbackRequested(true);
    setTimeout(() => {
      setCallbackRequested(false);
      setCallbackName('');
      setCallbackPhone('');
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden text-zinc-900 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-zinc-950 text-white p-5 sm:p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-emerald-500 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-md">
                <Headphones className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    National Call Center & Support Desk
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    24/7 TOLL-FREE
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  AgriLink Farmer Assistance, Escrow Support & Cold-Chain Dispatch
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer text-sm font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Quick Action Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Primary Phone Hotline */}
            <div className="bg-gradient-to-br from-emerald-950 to-zinc-900 border border-emerald-800/60 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    Direct Voice Hotline
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <p className="text-2xl font-black text-white mt-1 tracking-tight">
                  0961123330
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Direct line for order inquiries, payment escrow disputes, and driver dispatch.
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <a
                  href="tel:0961123330"
                  className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call 0961123330</span>
                </a>
              </div>
            </div>

            {/* Direct Digital Support & SMS Desk */}
            <div className="bg-gradient-to-br from-zinc-900 to-emerald-950 border border-emerald-800/50 rounded-2xl p-4 text-white flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                    SMS & Dispatch Desk
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300">
                    Instant Response
                  </span>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                  +251 96 112 3330
                </p>
                <p className="text-[11px] text-zinc-300 mt-0.5">
                  Send SMS inquiries, harvest lot tracking requests, and direct freight coordinate messages.
                </p>
              </div>

              <div className="mt-4">
                <a
                  href="sms:0961123330"
                  className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-400" />
                  <span>Send Direct SMS Message</span>
                </a>
              </div>
            </div>
          </div>

          {/* Multilingual Support Banner */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-emerald-700" />
              <span className="text-xs font-bold text-zinc-800">Supported Languages:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-zinc-600">
              <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md">አማርኛ (Amharic)</span>
              <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md">Afaan Oromoo</span>
              <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md">ትግርኛ (Tigrinya)</span>
              <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md">Somali</span>
              <span className="px-2 py-0.5 bg-white border border-zinc-200 rounded-md">English</span>
            </div>
          </div>

          {/* Regional Hub Desks */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 mb-2.5 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" />
              <span>Regional Corridor Desks</span>
            </h3>

            <div className="space-y-2">
              {regionalDesks.map((desk, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-colors ${
                    desk.primary
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-zinc-200 hover:border-zinc-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{desk.region}</span>
                      {desk.primary && (
                        <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                          CENTRAL
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-500 flex items-center gap-1 mt-0.5">
                      <span>{desk.location}</span>
                      <span>•</span>
                      <span className="text-zinc-400">{desk.hours}</span>
                    </p>
                  </div>

                  <a
                    href={`tel:${desk.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-100 text-zinc-900 hover:text-emerald-900 font-bold text-xs flex items-center gap-1 transition-colors border border-zinc-200"
                  >
                    <Phone className="h-3 w-3 text-emerald-700" />
                    <span>{desk.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Callback Request Form */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-zinc-900">Request an Instant Call Back</h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium">Average response: &lt; 5 mins</span>
            </div>

            {callbackRequested ? (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Call back requested! A field officer will call your phone shortly.</span>
              </div>
            ) : (
              <form onSubmit={handleRequestCallback} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Your Name (e.g. Abebe)"
                  value={callbackName}
                  onChange={(e) => setCallbackName(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-emerald-600 font-medium"
                />
                <input
                  type="text"
                  placeholder="Phone (09... / 07...)"
                  value={callbackPhone}
                  onChange={(e) => setCallbackPhone(e.target.value)}
                  required
                  className="px-3 py-2 rounded-xl bg-white border border-zinc-300 text-xs text-zinc-900 focus:outline-emerald-600 font-medium"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <span>Request Callback</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-zinc-100 border-t border-zinc-200 text-center text-[11px] text-zinc-600 flex items-center justify-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          <span>Official Ministry of Agriculture & Ethiopian Agricultural Transformation Institute Partner</span>
        </div>
      </div>
    </div>
  );
};
