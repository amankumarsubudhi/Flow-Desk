import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import {
  Layers,
  Shield,
  Radio,
  Wrench,
  User as UserIcon,
  Lock,
  Mail,
  UserCheck,
  Phone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, register, error, clearError, isLoading } = useAuth();
  const { theme } = useTheme();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('sarah.jenkins@flowdesk.io');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');


  const [formError, setFormError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setFormError('Please enter both email and password.');
      return;
    }

    const res = await login(loginEmail.trim(), loginPassword);
    if (!res.success) {
      setFormError(res.message || 'Invalid credentials');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!regName.trim()) {
      setFormError('Name is required.');
      return;
    }
    if (!regEmail.trim()) {
      setFormError('Valid email is required.');
      return;
    }
    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await register({
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      role: 'CUSTOMER',
      phone: regPhone.trim(),
    });

    if (!res.success) {
      setFormError(res.message || 'Registration failed');
    }
  };

  const handleQuickFill = (role: UserRole) => {
    setMode('LOGIN');
    setFormError(null);
    clearError();
    if (role === 'ADMIN') {
      setLoginEmail('sarah.jenkins@flowdesk.io');
      setLoginPassword('password123');
    } else if (role === 'DISPATCHER') {
      setLoginEmail('alex.rivera@flowdesk.io');
      setLoginPassword('password123');
    } else if (role === 'TECHNICIAN') {
      setLoginEmail('david.miller@flowdesk.io');
      setLoginPassword('password123');
    } else if (role === 'CUSTOMER') {
      setLoginEmail('emily.watson@horizonestates.com');
      setLoginPassword('password123');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left column: Branding & Quick Test Credentials */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 text-[var(--accent-primary)] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Enterprise Service Operations</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Welcome to <span className="text-[var(--accent-primary)]">FlowDesk</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Unified platform managing the full lifecycle of field service requests—from dispatching and live technician execution to instant invoicing.
            </p>
          </div>

          {/* Quick Demo Personas */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">
              <span>Quick Login (Demo Personas)</span>
              <span className="text-emerald-400">● Live DB</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('ADMIN')}
                className="p-2.5 rounded-xl border border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Admin</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                  Sarah Jenkins
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('DISPATCHER')}
                className="p-2.5 rounded-xl border border-orange-500/20 bg-orange-500/5 hover:bg-orange-500/10 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Radio className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Dispatcher</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                  Alex Rivera
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('TECHNICIAN')}
                className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Technician</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                  David Miller
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('CUSTOMER')}
                className="p-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 text-left transition-all group"
              >
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Customer</span>
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1 truncate">
                  Emily Watson
                </div>
              </button>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] text-center italic">
              All demo accounts use password: <span className="font-mono text-[var(--accent-primary)] font-semibold">password123</span>
            </div>
          </div>
        </div>

        {/* Right column: Form Card */}
        <div className="lg:col-span-7">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Toggle tabs */}
            <div className="flex items-center p-1 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-subtle)] mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  setFormError(null);
                  clearError();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'LOGIN'
                    ? 'bg-[var(--accent-primary)] text-black shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('REGISTER');
                  setFormError(null);
                  clearError();
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  mode === 'REGISTER'
                    ? 'bg-[var(--accent-primary)] text-black shadow-md'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error banner */}
            {(formError || error) && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError || error}</span>
              </div>
            )}

            {mode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. alex.rivera@flowdesk.io"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black font-extrabold text-sm shadow-[0_0_20px_var(--accent-glow)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Authenticate & Enter Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCheck className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Jordan Hayes"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="e.g. jordan.hayes@example.com"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="password"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Phone Number (Optional)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                      <input
                        type="tel"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] text-sm text-[var(--text-primary)] outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Account type info */}
                <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Your account will be created as a <strong>Customer</strong>. Staff accounts are managed by administrators.</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black font-extrabold text-sm shadow-[0_0_20px_var(--accent-glow)] transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Create Account & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
