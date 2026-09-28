import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useOperations } from '../../context/OperationsContext';
import { UserRole } from '../../types';
import {
  Bell,
  Palette,
  Shield,
  Radio,
  Wrench,
  User as UserIcon,
  ChevronDown,
  Layers,
  LogOut,
  RefreshCw,
} from 'lucide-react';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { UserAvatar } from '../common/UserAvatar';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme, themesList } = useTheme();
  const { unreadNotificationCount, refreshData, isLoading } = useOperations();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  if (!currentUser) {
    return (
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 lg:px-6 py-3 transition-colors duration-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center text-black font-bold shadow-[0_0_15px_var(--accent-glow)]">
              <Layers className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                  FLOW<span className="text-[var(--accent-primary)]">DESK</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Service Operations Management Platform
              </p>
            </div>
          </div>
        </div>
      </header>
    );
  }

  const roleConfigs: Record<
    UserRole,
    { label: string; icon: React.ReactNode; color: string; badge: string }
  > = {
    ADMIN: {
      label: 'Admin',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'text-purple-400',
      badge: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    },
    DISPATCHER: {
      label: 'Dispatcher',
      icon: <Radio className="w-3.5 h-3.5" />,
      color: 'text-orange-400',
      badge: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    },
    TECHNICIAN: {
      label: 'Technician',
      icon: <Wrench className="w-3.5 h-3.5" />,
      color: 'text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    CUSTOMER: {
      label: 'Customer',
      icon: <UserIcon className="w-3.5 h-3.5" />,
      color: 'text-blue-400',
      badge: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    },
  };

  const roleCfg = roleConfigs[currentUser.role] || roleConfigs.CUSTOMER;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 lg:px-6 py-2.5 transition-colors duration-200">
        <div className="flex items-center justify-between max-w-7xl mx-auto gap-4">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center text-black font-bold shadow-[0_0_15px_var(--accent-glow)]">
              <Layers className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-[var(--text-primary)]">
                  FLOW<span className="text-[var(--accent-primary)]">DESK</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
                Service Operations Management
              </p>
            </div>
          </div>

          {/* Active Workspace / Role Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)] font-medium">Workspace:</span>
            <div className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-lg border text-xs font-semibold ${roleCfg.badge}`}>
              <span>{roleCfg.icon}</span>
              <span>{roleCfg.label} Dashboard</span>
            </div>
          </div>

          {/* Right Controls: Refresh, Theme Switcher, Notifications, User & Logout */}
          <div className="flex items-center space-x-2.5">
            {/* Sync / Refresh Button */}
            <button
              onClick={() => refreshData()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
              title="Sync Realtime Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[var(--accent-primary)]' : ''}`} />
            </button>

            {/* Theme Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] transition-colors"
                title="Switch Visual Theme"
              >
                <div
                  className="w-3.5 h-3.5 rounded-full border border-black/30"
                  style={{
                    backgroundColor:
                      themesList.find((t) => t.id === theme)?.primaryColor || '#FF7A00',
                  }}
                />
                <span className="hidden lg:inline text-[11px] font-medium capitalize">
                  {themesList.find((t) => t.id === theme)?.name.replace('Black & ', '')}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isThemeMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl shadow-2xl py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase text-[var(--text-muted)]">
                    Select Theme
                  </div>
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                        theme === t.id
                          ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] font-semibold'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-neutral-700"
                          style={{ backgroundColor: t.primaryColor }}
                        />
                        <span>{t.name}</span>
                      </div>
                      {theme === t.id && (
                        <span className="text-[10px] text-[var(--accent-primary)] font-mono">
                          ACTIVE
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotifOpen(true)}
              className="relative p-2 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-primary)] text-black text-[10px] font-extrabold flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* User Profile & Logout */}
            <div className="flex items-center space-x-2.5 pl-2 border-l border-[var(--border-subtle)]">
              <UserAvatar name={currentUser.name} size="sm" />
              <div className="hidden xl:block text-left leading-tight">
                <div className="text-xs font-semibold text-[var(--text-primary)] truncate max-w-[120px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-[var(--accent-primary)] uppercase">
                  {currentUser.role}
                </div>
              </div>

              {/* Log Out Button */}
              <button
                onClick={logout}
                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};
