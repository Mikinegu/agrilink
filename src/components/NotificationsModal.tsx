import React from 'react';
import { X, Bell, CheckCircle2, Package, Landmark, Truck } from 'lucide-react';
import { Notification } from '../types/index.ts';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-zinc-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 relative animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-emerald-700" />
            <h3 className="text-base font-black text-zinc-900">Platform Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No recent notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkAsRead(n.id)}
                className={`p-3 rounded-xl border text-xs transition-colors cursor-pointer ${
                  n.isRead
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-600'
                    : 'bg-emerald-50/70 border-emerald-200 text-zinc-900 font-semibold'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-zinc-900">{n.title}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 text-zinc-600 leading-relaxed">{n.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
