import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OperationsProvider } from './context/OperationsContext';
import { Navbar } from './components/layout/Navbar';
import { AuthPage } from './components/auth/AuthPage';
import { DispatcherDashboard } from './components/dispatcher/DispatcherDashboard';
import { TechnicianHub } from './components/technician/TechnicianHub';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainContent: React.FC = () => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-[var(--text-muted)] animate-pulse">
          Authenticating secure session...
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 transition-colors duration-200">
      {currentUser.role === 'DISPATCHER' && <DispatcherDashboard />}
      {currentUser.role === 'TECHNICIAN' && <TechnicianHub />}
      {currentUser.role === 'CUSTOMER' && <CustomerPortal />}
      {currentUser.role === 'ADMIN' && <AdminDashboard />}
    </main>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OperationsProvider>
          <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors duration-200 flex flex-col font-sans selection:bg-[var(--accent-primary)] selection:text-black">
            <Navbar />
            <div className="flex-1">
              <MainContent />
            </div>
            {/* Footer */}
            <footer className="border-t border-[var(--border-subtle)] py-4 text-center text-xs text-[var(--text-muted)] mt-auto">
              <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="font-extrabold text-[var(--text-primary)]">FLOWDESK</span> © 2026 — Enterprise Service Operations Platform
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-emerald-400 font-mono">● System Operational (MySQL Persisted)</span>
                  <span>•</span>
                  <span>v1.0.0 Production Architecture</span>
                </div>
              </div>
            </footer>
          </div>
        </OperationsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
