import React, { useEffect } from 'react';
import { CheckCircle2, ShoppingBag, ArrowRight, X, AlertCircle, Sparkles } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.tsx';

export interface ToastMessage {
  id: string;
  type: 'cart' | 'success' | 'info' | 'error';
  title: string;
  description?: string;
  image?: string;
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
  titleKey?: string;
  descriptionKey?: string;
  actionLabelKey?: string;
}

interface ActionToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ActionToast: React.FC<ActionToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      role="region"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: () => void }> = ({ toast, onDismiss }) => {
  const { t, translate } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getBadgeLabel = () => {
    switch (toast.type) {
      case 'cart':
        return t.toast.cartUpdated;
      case 'success':
        return t.toast.actionConfirmed;
      case 'error':
        return t.toast.systemAlert;
      case 'info':
        return t.toast.systemNotification;
      default:
        return t.toast.systemAction;
    }
  };

  const getDisplayTitle = () => {
    if (toast.titleKey) return translate(toast.titleKey, toast.title);
    if (toast.title === 'Added to Procurement Cart') return t.toast.itemAddedTitle;
    if (toast.title === 'Item Removed') return t.toast.itemRemovedTitle;
    if (toast.title === 'Cart Cleared') return t.toast.cartClearedTitle;
    if (toast.title === 'Order Confirmed & Escrow Locked!') return t.toast.orderConfirmedTitle;
    return toast.title;
  };

  const getDisplayDescription = () => {
    if (toast.descriptionKey) return translate(toast.descriptionKey, toast.description);
    if (toast.description === 'Cart updated successfully.') return t.toast.itemRemovedDesc;
    if (toast.description === 'All items removed from procurement basket.') return t.toast.cartClearedDesc;
    return toast.description;
  };

  const getDisplayActionLabel = () => {
    if (toast.actionLabelKey) return translate(toast.actionLabelKey, toast.actionLabel);
    return toast.actionLabel;
  };

  return (
    <div className="pointer-events-auto bg-zinc-950/95 text-white rounded-2xl p-4 shadow-2xl border border-zinc-800 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 flex items-start gap-3 relative overflow-hidden group">
      {/* Accent glow bar */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          toast.type === 'cart'
            ? 'bg-emerald-500'
            : toast.type === 'success'
            ? 'bg-emerald-400'
            : toast.type === 'error'
            ? 'bg-rose-500'
            : 'bg-blue-500'
        }`}
      />

      {/* Thumbnail or Icon */}
      {toast.image ? (
        <img
          src={toast.image}
          alt=""
          className="h-11 w-11 rounded-xl object-cover border border-zinc-700 shrink-0 mt-0.5"
        />
      ) : (
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
            toast.type === 'cart'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-400 border border-rose-800'
              : 'bg-blue-950 text-blue-400 border border-blue-800'
          }`}
        >
          {toast.type === 'cart' && <ShoppingBag className="h-5 w-5" />}
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5" />}
          {toast.type === 'info' && <Sparkles className="h-5 w-5" />}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            {getBadgeLabel()}
          </span>
        </div>
        <h4 className="text-xs font-bold text-white leading-snug truncate mt-0.5">{getDisplayTitle()}</h4>
        {toast.description && (
          <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">{getDisplayDescription()}</p>
        )}

        {toast.actionLabel && toast.onAction && (
          <button
            onClick={() => {
              toast.onAction?.();
              onDismiss();
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-black cursor-pointer transition-all shadow-xs"
          >
            <span>{getDisplayActionLabel()}</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onDismiss}
        aria-label={t.common.close}
        title={t.common.close}
        className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-white transition-colors p-1 cursor-pointer"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* Animated bottom progress line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-800">
        <div
          className="h-full bg-emerald-500/80 animate-[shrink_4.5s_linear_forwards]"
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

