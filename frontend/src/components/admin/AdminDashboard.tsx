import React, { useState, useEffect } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import {
  apiGetStaffUsers,
  apiCreateStaffUser,
  apiUpdateStaffUser,
  apiToggleStaffUserActive,
  StaffUser,
} from '../../services/api';
import {
  Shield,
  Layers,
  Users,
  TrendingUp,
  History,
  CheckCircle2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  IndianRupee,
  Activity,
  ArrowUpRight,
  UserPlus,
  Edit3,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    requests,
    categories,
    technicians,
    auditLogs,
    addCategory,
    toggleCategoryStatus,
  } = useOperations();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'CATEGORIES' | 'AUDIT_LOGS' | 'TECHNICIANS' | 'STAFF'>('OVERVIEW');

  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatBase, setNewCatBase] = useState(500);
  const [isAddCatOpen, setIsAddCatOpen] = useState(false);

  // Audit search
  const [auditSearch, setAuditSearch] = useState('');

  // Staff management state
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

  // Staff form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffRole, setStaffRole] = useState<'TECHNICIAN' | 'DISPATCHER'>('TECHNICIAN');
  const [staffFormError, setStaffFormError] = useState<string | null>(null);
  const [staffFormLoading, setStaffFormLoading] = useState(false);

  // Load staff users when the STAFF tab is active
  useEffect(() => {
    if (activeTab === 'STAFF') {
      loadStaffUsers();
    }
  }, [activeTab]);

  const loadStaffUsers = async () => {
    setIsStaffLoading(true);
    setStaffError(null);
    try {
      const users = await apiGetStaffUsers();
      setStaffUsers(users);
    } catch (err: any) {
      setStaffError(err.message || 'Failed to load staff users');
    } finally {
      setIsStaffLoading(false);
    }
  };

  const resetStaffForm = () => {
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    setStaffPhone('');
    setStaffRole('TECHNICIAN');
    setStaffFormError(null);
    setStaffFormLoading(false);
  };

  const openCreateStaff = () => {
    resetStaffForm();
    setEditingStaff(null);
    setIsAddStaffOpen(true);
  };

  const openEditStaff = (user: StaffUser) => {
    setEditingStaff(user);
    setStaffName(user.name);
    setStaffEmail(user.email);
    setStaffPassword('');
    setStaffPhone(user.phone || '');
    setStaffRole(user.role as 'TECHNICIAN' | 'DISPATCHER');
    setStaffFormError(null);
    setIsAddStaffOpen(true);
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffFormError(null);
    setStaffFormLoading(true);

    try {
      if (editingStaff) {
        const updateData: any = {
          name: staffName.trim(),
          email: staffEmail.trim(),
          role: staffRole,
          phone: staffPhone.trim(),
        };
        if (staffPassword.trim()) {
          updateData.password = staffPassword;
        }
        await apiUpdateStaffUser(editingStaff.id, updateData);
      } else {
        if (!staffPassword.trim()) {
          setStaffFormError('Password is required for new accounts');
          setStaffFormLoading(false);
          return;
        }
        await apiCreateStaffUser({
          name: staffName.trim(),
          email: staffEmail.trim(),
          password: staffPassword,
          role: staffRole,
          phone: staffPhone.trim(),
        });
      }
      setIsAddStaffOpen(false);
      resetStaffForm();
      await loadStaffUsers();
    } catch (err: any) {
      setStaffFormError(err.message || 'Operation failed');
    } finally {
      setStaffFormLoading(false);
    }
  };

  const handleToggleStaffActive = async (userId: string) => {
    try {
      await apiToggleStaffUserActive(userId);
      await loadStaffUsers();
    } catch (err: any) {
      setStaffError(err.message || 'Failed to toggle user status');
    }
  };

  // Metrics calculation
  const totalRevenue = requests.reduce((acc, r) => {
    if (r.invoice && ['PAID', 'PENDING'].includes(r.invoice.status)) {
      return acc + (r.invoice.totalAmount || 0);
    }
    return acc;
  }, 0);

  const completedCount = requests.filter((r) => ['COMPLETED', 'CUSTOMER_CONFIRMED', 'CLOSED'].includes(r.status)).length;
  const activeCount = requests.filter((r) => ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(r.status)).length;

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    await addCategory({
      name: newCatName,
      description: newCatDesc,
      icon: 'Wrench',
      isActive: true,
      baseCharge: Number(newCatBase) || 500,
    });
    setNewCatName('');
    setNewCatDesc('');
    setIsAddCatOpen(false);
  };

  const filteredLogs = auditLogs.filter(
    (l) =>
      l.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.actorName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.entityId.toLowerCase().includes(auditSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <Shield className="w-6 h-6 text-[var(--accent-primary)]" />
            <span>Platform Governance & Administration</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            System overview, category configuration, workforce analytics, and immutable audit logs
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-[var(--bg-card)] p-1 rounded-xl border border-[var(--border-subtle)]">
          {[
            { id: 'OVERVIEW', label: 'Overview', icon: <TrendingUp className="w-3.5 h-3.5" /> },
            { id: 'CATEGORIES', label: 'Categories', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'STAFF', label: 'Staff Mgmt', icon: <UserPlus className="w-3.5 h-3.5" /> },
            { id: 'TECHNICIANS', label: 'Workforce', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'AUDIT_LOGS', label: 'Audit Trail', icon: <History className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-primary)] text-black font-bold shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                <span>Total Operational Revenue</span>
                <IndianRupee className="w-4 h-4 text-[var(--accent-primary)]" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                ₹{totalRevenue.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
                <ArrowUpRight className="w-3 h-3" />
                <span>+14.8% from last month</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                <span>Active Field Jobs</span>
                <Activity className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">{activeCount}</div>
              <div className="text-[11px] text-[var(--text-muted)]">Across 4 zones</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                <span>Completed & Closed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">{completedCount}</div>
              <div className="text-[11px] text-emerald-400">99.4% SLA Compliance</div>
            </div>

            <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-2">
              <div className="flex items-center justify-between text-[var(--text-muted)] text-xs">
                <span>Field Specialists</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-extrabold text-[var(--text-primary)]">
                {technicians.length}
              </div>
              <div className="text-[11px] text-cyan-400">Avg Rating 4.85 / 5.0</div>
            </div>
          </div>

          {/* Recent System Activity Preview */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
                <History className="w-4 h-4 text-[var(--accent-primary)]" />
                <span>Recent System Audit Stream</span>
              </h3>
              <button
                onClick={() => setActiveTab('AUDIT_LOGS')}
                className="text-xs text-[var(--accent-primary)] hover:underline font-semibold"
              >
                View Full Audit Trail →
              </button>
            </div>

            <div className="space-y-2.5">
              {auditLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--accent-primary)] border border-[var(--border-subtle)]">
                      {log.action}
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">{log.actorName}</span>
                    <span className="text-[var(--text-secondary)] hidden md:inline">
                      {log.details}
                    </span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Service Categories Management
            </h2>
            <button
              onClick={() => setIsAddCatOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">{c.name}</h3>
                  <button
                    onClick={() => toggleCategoryStatus(c.id)}
                    className="p-1 text-xs"
                    title="Toggle active status"
                  >
                    {c.isActive ? (
                      <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                        <ToggleRight className="w-5 h-5" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-neutral-500 font-mono text-[11px] flex items-center space-x-1">
                        <ToggleLeft className="w-5 h-5" />
                        <span>Disabled</span>
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {c.description}
                </p>
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)]">Base Service Charge:</span>
                  <span className="font-bold text-[var(--accent-primary)]">₹{c.baseCharge}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Category Modal */}
          {isAddCatOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
              <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4">
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Create Service Category
                </h3>
                <form onSubmit={handleAddCategorySubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Category Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="e.g. Solar & Renewable Power"
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      placeholder="Category scope and supported repairs..."
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Base Service Charge (₹)
                    </label>
                    <input
                      type="number"
                      min="100"
                      required
                      value={newCatBase}
                      onChange={(e) => setNewCatBase(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setIsAddCatOpen(false)}
                      className="px-4 py-2 text-xs text-[var(--text-secondary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold"
                    >
                      Save Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: STAFF MANAGEMENT */}
      {activeTab === 'STAFF' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Staff User Management
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Create and manage Technician & Dispatcher accounts
              </p>
            </div>
            <button
              onClick={openCreateStaff}
              className="px-3.5 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-1.5 shadow-md"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Account</span>
            </button>
          </div>

          {staffError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{staffError}</span>
            </div>
          )}

          {isStaffLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : staffUsers.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">No Staff Accounts Yet</p>
              <p className="text-xs text-[var(--text-secondary)]">
                Create your first Technician or Dispatcher account to get started.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Email</th>
                      <th className="p-3.5">Phone</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {staffUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center space-x-3">
                            <UserAvatar name={user.name} size="sm" />
                            <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-[var(--text-secondary)] font-mono text-[11px]">{user.email}</td>
                        <td className="p-3.5 text-[var(--text-secondary)]">{user.phone || '—'}</td>
                        <td className="p-3.5">
                          <span className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border ${
                            user.role === 'TECHNICIAN'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => handleToggleStaffActive(user.id)}
                            className="p-1"
                            title="Toggle active status"
                          >
                            {user.active ? (
                              <span className="text-emerald-400 font-mono text-[11px] flex items-center space-x-1">
                                <ToggleRight className="w-5 h-5" />
                                <span>Active</span>
                              </span>
                            ) : (
                              <span className="text-neutral-500 font-mono text-[11px] flex items-center space-x-1">
                                <ToggleLeft className="w-5 h-5" />
                                <span>Inactive</span>
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => openEditStaff(user)}
                            className="p-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            title="Edit user"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Add / Edit Staff Modal */}
          {isAddStaffOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
              <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    {editingStaff ? 'Edit Staff Account' : 'Create Staff Account'}
                  </h3>
                  <button
                    onClick={() => { setIsAddStaffOpen(false); resetStaffForm(); }}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {staffFormError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{staffFormError}</span>
                  </div>
                )}

                <form onSubmit={handleStaffSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      placeholder="e.g. John Smith"
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      placeholder="e.g. john.smith@flowdesk.io"
                      className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                        Password {editingStaff && <span className="text-[var(--text-muted)]">(leave blank to keep)</span>}
                      </label>
                      <input
                        type="password"
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder={editingStaff ? '••••••••' : 'Set password'}
                        required={!editingStaff}
                        className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        value={staffPhone}
                        onChange={(e) => setStaffPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['TECHNICIAN', 'DISPATCHER'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setStaffRole(r)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            staffRole === r
                              ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] font-bold shadow-sm'
                              : 'border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          <div className="text-xs font-semibold">{r}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => { setIsAddStaffOpen(false); resetStaffForm(); }}
                      className="px-4 py-2 text-xs text-[var(--text-secondary)]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={staffFormLoading}
                      className="px-5 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-1.5 disabled:opacity-50"
                    >
                      {staffFormLoading ? (
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>{editingStaff ? 'Save Changes' : 'Create Account'}</span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: WORKFORCE */}
      {activeTab === 'TECHNICIANS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicians.map((t) => (
            <div
              key={t.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3"
            >
              <div className="flex items-center space-x-3.5">
                <UserAvatar name={t.name} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{t.name}</h3>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                        t.isAvailable
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {t.isAvailable ? 'Available' : 'On Job'}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">{t.email} · {t.phone}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] pt-2 border-t border-[var(--border-subtle)]">
                <div>
                  <span className="text-[var(--text-muted)]">Completed Jobs: </span>
                  <span className="font-bold text-[var(--text-primary)]">{t.completedJobsCount}</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Rating: </span>
                  <span className="font-bold text-amber-400">★ {t.rating}</span>
                </div>
              </div>

              <div className="text-xs text-[var(--text-muted)]">
                <span>Location: </span>
                <span className="text-[var(--text-primary)]">{t.currentLocation}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: AUDIT LOGS */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, or request ID..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--bg-elevated)] border-b border-[var(--border-subtle)] text-[var(--text-muted)] uppercase font-mono text-[10px]">
                  <tr>
                    <th className="p-3.5">Timestamp</th>
                    <th className="p-3.5">Actor</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Target Entity</th>
                    <th className="p-3.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-[var(--bg-main)]/50 transition-colors">
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3.5 font-semibold text-[var(--text-primary)]">
                        {log.actorName}
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                          {log.actorRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--accent-primary)] font-bold">
                        {log.action}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-[var(--text-secondary)]">
                        {log.entityType} ({log.entityId})
                      </td>
                      <td className="p-3.5 text-[var(--text-secondary)] max-w-xs truncate">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
