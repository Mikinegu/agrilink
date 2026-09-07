import React from 'react';
import agrilinkLogo from '../assets/images/agrilink_logo_1787551924489.jpg';
import {
  X,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  MapPin,
  Globe,
  ExternalLink,
  CheckCircle2,
  Lock,
  Download,
  Copy,
  Sparkles,
  Building,
} from 'lucide-react';

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome?: () => void;
}

export const BrandModal: React.FC<BrandModalProps> = ({ isOpen, onClose, onNavigateHome }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText?.(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-zinc-950 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={agrilinkLogo}
                alt="AgriLink Ethiopia Official Emblem"
                className="h-20 w-20 rounded-2xl object-cover border-2 border-emerald-400/80 shadow-xl shadow-emerald-950/50 bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-emerald-950">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wider uppercase border border-emerald-400/30 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Official Brand Identity
                </span>
                <span className="text-xs text-zinc-300 font-mono">ID: ET-AGR-2026</span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-white mt-1">
                AGRI<span className="text-emerald-400">LINK</span> ETHIOPIA
              </h2>
              <p className="text-xs text-emerald-100/90 font-medium">
                National Digital Agro-Commerce Grid & Direct Cold-Chain Logistics
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Brand Mission Statement */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950 mb-1 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-emerald-700" /> Platform Mission & Integrity
            </h3>
            <p className="text-xs text-zinc-700 leading-relaxed">
              AgriLink Ethiopia bridges smallholder farm clusters, industrial food processors, agri-investors, 
              and urban wholesale markets via guaranteed Telebirr/CBE escrow settlement and GSM USSD (*6112#) offline connectivity.
            </p>
          </div>

          {/* High-Resolution Emblem Display */}
          <div className="border border-zinc-200 rounded-2xl p-5 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                <img
                  src={agrilinkLogo}
                  alt="AgriLink High-Res Logo"
                  className="h-24 w-24 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900">Official Brand Assets</h4>
                <p className="text-xs text-zinc-500 mt-0.5">High-Resolution Vector & Raster Master Emblem</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-200 text-zinc-700">PNG / JPG</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Verified Trademark</span>
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <a
                href={agrilinkLogo}
                download="AgriLink-Ethiopia-Logo.jpg"
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" /> Full Resolution
              </a>
              <button
                onClick={handleCopyLink}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-bold transition-colors cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5 text-zinc-600" /> {copied ? 'Copied Link!' : 'Share Platform'}
              </button>
            </div>
          </div>

          {/* Key Platform Accreditations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-3">
              Institutional Accreditations & Infrastructure
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">Ministry of Agriculture Verified</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Crop lot grading, traceability barcodes & certified nursery inputs.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3">
                <Phone className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">Ethio Telecom USSD *6112#</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Nationwide offline mobile access for feature phone rural farmers.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3">
                <Lock className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">Telebirr & CBE Escrow Protection</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Automated release upon QR destination cold-chain inspection.</p>
                </div>
              </div>
              <div className="p-3.5 rounded-xl border border-zinc-200 bg-white flex items-start gap-3">
                <Building className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-zinc-900">Awash Bank Agro-Credit Line</h5>
                  <p className="text-[11px] text-zinc-500 mt-0.5">Digital input voucher underwriting for fertilizer and improved seed lots.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Official Contact & Leadership Desk */}
          <div className="bg-zinc-900 text-zinc-200 p-4 rounded-2xl space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Operations Headquarters & Inquiries
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">0961123330</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-zinc-300">bamlaksisay270@gmail.com</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Addis Ababa, Bole Central Agro Logistics Hub & Wonji/Debre Zeit Corridors</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              if (onNavigateHome) onNavigateHome();
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
          >
            ← Back to AgriLink Home
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Close Emblem Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
