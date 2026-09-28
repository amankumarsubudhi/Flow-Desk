import React from 'react';
import { useOperations } from '../../context/OperationsContext';
import { Bell, CheckCheck, X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useOperations();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'ALERT':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="w-full max-w-md bg-[var(--bg-card)] border-l border-[var(--border-subtle)] h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--accent-primary)]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--text-primary)]">Activity & Alerts</h3>
              <p className="text-xs text-[var(--text-muted)]">Real-time system events</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={markAllNotificationsRead}
              className="p-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-elevated)] flex items-center space-x-1"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span className="text-[11px]">Read All</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-elevated)]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
              <Bell className="w-10 h-10 stroke-1 mb-2 opacity-40" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs text-[var(--text-muted)]">You're completely up to date!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  n.isRead
                    ? 'bg-[var(--bg-main)]/60 border-[var(--border-subtle)] opacity-75'
                    : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] shadow-sm ring-1 ring-[var(--accent-primary)]/20'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5">{getIcon(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-[var(--border-subtle)]/50">
                      {n.requestId && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-main)] text-[var(--text-muted)]">
                          {n.requestId}
                        </span>
                      )}
                      <span className="text-[10px] text-[var(--text-muted)]">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
