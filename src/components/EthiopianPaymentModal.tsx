import React, { useState } from 'react';
import { X, CheckCircle2, KeyRound, AlertCircle, Lock, ArrowRight, Loader2 } from 'lucide-react';

export interface PaymentProvider {
  id: string; name: string; shortName: string;
  type: 'mobile_money' | 'bank_transfer' | 'card_gateway';
  logo: string; color: string; textColor: string; borderColor: string;
  description: string; accountLabel: string; accountPlaceholder: string;
  pinLabel: string; ussdCode?: string;
}

const PROVIDERS: PaymentProvider[] = [
  { id:'TELEBIRR',    name:'Telebirr',                    shortName:'Telebirr', type:'mobile_money',   logo:'TB', color:'bg-[#0059A8]', textColor:'text-[#0059A8]', borderColor:'border-[#0059A8]', description:'Ethio Telecom Mobile Money – fastest settlement',         accountLabel:'Telebirr Phone Number',       accountPlaceholder:'e.g. 0961123330',    pinLabel:'6-digit Telebirr PIN',         ussdCode:'*127#' },
  { id:'CBE_BIRR',    name:'CBE Birr',                    shortName:'CBE Birr', type:'mobile_money',   logo:'CB', color:'bg-[#005A2B]', textColor:'text-[#005A2B]', borderColor:'border-[#005A2B]', description:'Commercial Bank of Ethiopia Mobile Wallet',               accountLabel:'CBE Birr Phone Number',       accountPlaceholder:'e.g. 0911234567',    pinLabel:'6-digit CBE Birr PIN',         ussdCode:'*847#' },
  { id:'AWASH_BANK',  name:'Awash Bank',                  shortName:'Awash',    type:'bank_transfer',  logo:'AW', color:'bg-[#C8102E]', textColor:'text-[#C8102E]', borderColor:'border-[#C8102E]', description:'Awash Bank Direct Account Transfer',                      accountLabel:'Awash Bank Account Number',   accountPlaceholder:'e.g. 01320XXXXXXXXX',pinLabel:'6-digit Internet Banking PIN'  },
  { id:'ZEMEN_BANK',  name:'Zemen Bank',                  shortName:'Zemen',    type:'bank_transfer',  logo:'ZB', color:'bg-[#1A237E]', textColor:'text-[#1A237E]', borderColor:'border-[#1A237E]', description:'Zemen Bank Online Transfer',                              accountLabel:'Zemen Bank Account Number',   accountPlaceholder:'e.g. 1000XXXXXXXXXX',pinLabel:'6-digit Mobile Banking PIN'   },
  { id:'DASHEN_BANK', name:'Dashen Bank',                 shortName:'Dashen',   type:'bank_transfer',  logo:'DS', color:'bg-[#FF6600]', textColor:'text-[#FF6600]', borderColor:'border-[#FF6600]', description:'Dashen Bank – Amole Wallet & Transfer',                   accountLabel:'Dashen / Amole Account',      accountPlaceholder:'e.g. 0902XXXXXXXX',  pinLabel:'6-digit Amole PIN',            ussdCode:'*805#' },
  { id:'AMHARA_BANK', name:'Amhara Bank',                 shortName:'Amhara',   type:'bank_transfer',  logo:'AM', color:'bg-[#006400]', textColor:'text-[#006400]', borderColor:'border-[#006400]', description:'Amhara Bank Direct Account Transfer',                     accountLabel:'Amhara Bank Account Number',  accountPlaceholder:'e.g. 1200XXXXXXXXXX',pinLabel:'6-digit Internet Banking PIN'  },
  { id:'BUNNA_BANK',  name:'Bunna Bank',                  shortName:'Bunna',    type:'bank_transfer',  logo:'BN', color:'bg-[#6B2D0F]', textColor:'text-[#6B2D0F]', borderColor:'border-[#6B2D0F]', description:'Bunna International Bank Transfer',                       accountLabel:'Bunna Bank Account Number',   accountPlaceholder:'e.g. 1050XXXXXXXXXX',pinLabel:'6-digit Mobile Banking PIN'   },
  { id:'CHAPA',       name:'Chapa (Card / Multi-Wallet)', shortName:'Chapa',    type:'card_gateway',   logo:'CP', color:'bg-[#6C3FC5]', textColor:'text-[#6C3FC5]', borderColor:'border-[#6C3FC5]', description:'Visa / Mastercard & all Ethiopian wallets via Chapa',     accountLabel:'Card Number or Wallet ID',    accountPlaceholder:'e.g. 4111 1111 1111 1111', pinLabel:'Card CVV / Wallet PIN'    },
];

const TYPE_GROUPS = [
  { label: 'Mobile Money',      type: 'mobile_money'  as const },
  { label: 'Bank Transfer',     type: 'bank_transfer' as const },
  { label: 'Card & Multi-Wallet', type: 'card_gateway' as const },
];

interface Props {
  isOpen: boolean; onClose: () => void;
  amountEtb: number; orderDescription: string;
  contactName: string; contactPhone: string;
  onPaymentSuccess: (provider: string, accountNumber: string, txRef: string) => void;
}
type Step = 'select' | 'pin' | 'processing' | 'success';

export const EthiopianPaymentModal: React.FC<Props> = ({
  isOpen, onClose, amountEtb, orderDescription, contactName, contactPhone, onPaymentSuccess,
}) => {
  const [step, setStep]         = useState<Step>('select');
  const [selected, setSelected] = useState<PaymentProvider>(PROVIDERS[0]);
  const [account, setAccount]   = useState('');
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [txRef, setTxRef]       = useState('');

  if (!isOpen) return null;

  const pick = (p: PaymentProvider) => { setSelected(p); setAccount(''); setPin(''); setError(''); };

  const toPin = () => {
    if (!account.trim() || account.replace(/\D/g,'').length < 9) { setError('Please enter a valid ' + selected.accountLabel + '.'); return; }
    setStep('pin');
  };

  const confirm = async () => {
    if (!pin.trim() || pin.length < 6) { setError('Please enter your full PIN.'); return; }
    setStep('processing');
    await new Promise(r => setTimeout(r, 1800));
    const ref = 'TX-' + selected.id + '-' + Date.now() + '-' + Math.floor(Math.random()*9999);
    setTxRef(ref); setStep('success');
    onPaymentSuccess(selected.id, account, ref);
  };

  const close = () => { setStep('select'); setAccount(''); setPin(''); setError(''); onClose(); };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-zinc-950/70 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[96vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 shrink-0">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">AgriLink Secure Checkout</p>
            <h2 className="text-base font-black text-zinc-900">
              {step === 'select' && 'Choose Payment Method'}
              {step === 'pin' && 'Authorize via ' + selected.shortName}
              {step === 'processing' && 'Processing Payment...'}
              {step === 'success' && 'Payment Confirmed!'}
            </h2>
          </div>
          <button onClick={close} className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Amount banner */}
        <div className="px-5 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-zinc-500">{orderDescription}</span>
          <span className="text-lg font-black text-zinc-900">{amountEtb.toLocaleString()} ETB</span>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">

          {/* SELECT */}
          {step === 'select' && (
            <div className="space-y-5">
              {TYPE_GROUPS.map(group => {
                const list = PROVIDERS.filter(p => p.type === group.type);
                return (
                  <div key={group.type}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">{group.label}</p>
                    <div className="space-y-2">
                      {list.map(p => {
                        const on = selected.id === p.id;
                        return (
                          <button key={p.id} type="button" onClick={() => pick(p)}
                            className={'w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left cursor-pointer ' + (on ? p.borderColor + ' bg-zinc-50 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50')}>
                            <span className={'text-xs font-black w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 ' + p.color}>{p.logo}</span>
                            <div className="flex-1 min-w-0">
                              <p className={'text-sm font-bold ' + (on ? p.textColor : 'text-zinc-900')}>{p.name}</p>
                              <p className="text-[11px] text-zinc-500 truncate">{p.description}</p>
                              {p.ussdCode && <span className="text-[10px] font-mono text-zinc-400">USSD: {p.ussdCode}</span>}
                            </div>
                            <div className={'h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ' + (on ? p.borderColor + ' ' + p.color : 'border-zinc-300')}>
                              {on && <div className="h-2 w-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              <div className="pt-1">
                <label className="text-xs font-bold text-zinc-700 block mb-1.5">{selected.accountLabel} <span className="text-rose-500">*</span></label>
                <input type="text" value={account} onChange={e => { setAccount(e.target.value); setError(''); }}
                  placeholder={selected.accountPlaceholder}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-300 text-sm font-medium text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600" />
              </div>
              {error && <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            </div>
          )}

          {/* PIN */}
          {step === 'pin' && (
            <div className="space-y-5">
              <div className={'rounded-2xl p-5 text-white space-y-3 ' + selected.color}>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center">{selected.logo}</span>
                  <div>
                    <p className="text-xs font-bold opacity-75">{selected.type === 'mobile_money' ? 'Mobile Money' : selected.type === 'bank_transfer' ? 'Bank Transfer' : 'Card / Gateway'}</p>
                    <p className="text-base font-black">{selected.name}</p>
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="opacity-70">Account:</span><span className="font-bold">{account}</span></div>
                  <div className="flex justify-between"><span className="opacity-70">Name:</span><span className="font-bold">{contactName}</span></div>
                  <div className="flex justify-between border-t border-white/20 pt-2"><span className="opacity-70">Amount:</span><span className="text-lg font-black">{amountEtb.toLocaleString()} ETB</span></div>
                </div>
                {selected.ussdCode && <p className="text-[11px] opacity-70 text-center">USSD push sent to {account} via {selected.ussdCode}</p>}
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-zinc-400" /> {selected.pinLabel} <span className="text-rose-500">*</span>
                </label>
                <input type="password" maxLength={6} value={pin} onChange={e => { setPin(e.target.value); setError(''); }}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.8em] text-xl font-black px-4 py-3 rounded-xl border border-zinc-300 bg-zinc-50 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 placeholder:text-zinc-300" />
                <p className="text-[11px] text-zinc-400 text-center mt-1.5 flex items-center justify-center gap-1"><Lock className="h-3 w-3" /> PIN encrypted, never stored</p>
              </div>
              {error && <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
            </div>
          )}

          {/* PROCESSING */}
          {step === 'processing' && (
            <div className="flex flex-col items-center justify-center py-16 gap-5">
              <Loader2 className={'h-16 w-16 animate-spin ' + selected.textColor} strokeWidth={1.5} />
              <div className="text-center">
                <p className="text-sm font-black text-zinc-900">Authorizing via {selected.name}...</p>
                <p className="text-xs text-zinc-500">Securing {amountEtb.toLocaleString()} ETB in AgriLink Escrow</p>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {step === 'success' && (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-3">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-zinc-900">Payment Successful!</h3>
                  <p className="text-xs text-zinc-500 mt-1">{selected.name} &middot; {amountEtb.toLocaleString()} ETB</p>
                </div>
              </div>
              <div className="bg-zinc-900 text-white rounded-2xl p-4 space-y-2 border border-zinc-700">
                <div className="flex items-center justify-between text-xs border-b border-zinc-800 pb-2">
                  <span className="text-emerald-400 font-bold">SMS Confirmation — {selected.name}</span>
                  <span className="text-zinc-500">Just now</span>
                </div>
                <p className="text-xs text-zinc-200 font-mono leading-relaxed">
                  Dear <strong>{contactName}</strong>, your payment of{' '}
                  <strong className="text-emerald-400">{amountEtb.toLocaleString()} ETB</strong> to AgriLink
                  Escrow is confirmed. Ref: <span className="text-emerald-300 font-bold">{txRef}</span>.
                </p>
              </div>
              <div className="bg-zinc-50 rounded-xl border border-zinc-200 p-3 text-xs space-y-1.5">
                <div className="flex justify-between text-zinc-600"><span>Transaction Ref:</span><span className="font-mono font-bold text-zinc-900">{txRef}</span></div>
                <div className="flex justify-between text-zinc-600"><span>Payment via:</span><span className="font-bold text-zinc-900">{selected.name}</span></div>
                <div className="flex justify-between text-zinc-600"><span>Account:</span><span className="font-bold text-zinc-900">{account}</span></div>
                <div className="flex justify-between text-zinc-600 border-t border-zinc-200 pt-1.5 mt-1">
                  <span>Amount Paid:</span>
                  <span className="font-black text-emerald-700 text-sm">{amountEtb.toLocaleString()} ETB</span>
                </div>
              </div>
            </div>
          )}

        </div>{/* end body */}

        {/* Footer */}
        <div className="px-5 pb-6 pt-3 border-t border-zinc-100 shrink-0 space-y-2">
          {step === 'select' && (
            <button onClick={toPin} className={'w-full py-3.5 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg hover:opacity-90 ' + selected.color}>
              Continue with {selected.shortName} <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {step === 'pin' && (
            <div className="flex gap-3">
              <button onClick={() => { setStep('select'); setPin(''); setError(''); }} className="w-1/3 py-3 rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-sm cursor-pointer">Back</button>
              <button onClick={confirm} className={'w-2/3 py-3 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 ' + selected.color}>
                Pay {amountEtb.toLocaleString()} ETB <CheckCircle2 className="h-4 w-4" />
              </button>
            </div>
          )}
          {step === 'success' && (
            <button onClick={close} className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm cursor-pointer shadow-lg">Done — View My Order</button>
          )}
          {step !== 'processing' && step !== 'success' && (
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
              <Lock className="h-3 w-3" />
              <span>256-bit encrypted &middot; Funds held in AgriLink Escrow Trust</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EthiopianPaymentModal;