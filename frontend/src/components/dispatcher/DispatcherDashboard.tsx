import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { ServiceRequest, Priority, ServiceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { StateMachineProgress } from '../common/StateMachineProgress';
import {
  Search,
  Filter,
  UserCheck,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export const DispatcherDashboard: React.FC = () => {
  const {
    requests,
    technicians,
    categories,
    assignTechnician,
    updateRequestStatus,
  } = useOperations();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Assignment Modal State
  const [assigningRequest, setAssigningRequest] = useState<ServiceRequest | null>(null);
  const [selectedTechId, setSelectedTechId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('2026-09-29');
  const [appointmentTimeWindow, setAppointmentTimeWindow] = useState('10:00 AM - 12:00 PM');
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || req.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || req.status === selectedStatus;
    const matchesPriority = selectedPriority === 'ALL' || req.priority === selectedPriority;
    return matchesSearch && matchesCat && matchesStatus && matchesPriority;
  });

  const unassignedCount = requests.filter((r) =>
    ['NEW', 'REJECTED_BY_TECHNICIAN'].includes(r.status)
  ).length;
  const activeCount = requests.filter((r) =>
    ['ASSIGNED', 'ACCEPTED', 'SCHEDULED', 'EN_ROUTE', 'ON_SITE', 'IN_PROGRESS'].includes(r.status)
  ).length;
  const disputedCount = requests.filter((r) => r.status === 'DISPUTED').length;

  const handleOpenAssignModal = (req: ServiceRequest) => {
    setAssigningRequest(req);
    setSelectedTechId('');
    setAppointmentDate(req.preferredDate || '2026-09-29');
    setAppointmentTimeWindow(req.preferredTimeWindow || '10:00 AM - 12:00 PM');
    setAssignError(null);
    setAssignSuccess(null);
  };

    const handleExecuteAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningRequest || !selectedTechId) {
      setAssignError('Please select a technician.');
      return;
    }

    const result = await assignTechnician(
      assigningRequest.id,
      selectedTechId,
      appointmentDate,
      appointmentTimeWindow
    );

    if (result.success) {
      setAssignSuccess(result.message);
      setAssignError(null);
      setTimeout(() => {
        setAssigningRequest(null);
      }, 1000);
    } else {
      setAssignError(result.message);
      setAssignSuccess(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Operational Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Dispatcher Command Center
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Operational routing, technician skill matching, and schedule conflict resolution
          </p>
        </div>

        {/* Quick KPI Cards */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <div>
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Pending Queue</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{unassignedCount} Requests</div>
            </div>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center space-x-3">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div>
              <div className="text-[10px] text-[var(--text-muted)] font-medium">Active In-Field</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{activeCount} Jobs</div>
            </div>
          </div>
          {disputedCount > 0 && (
            <div className="px-3.5 py-2 rounded-xl bg-red-950/30 border border-red-500/40 flex items-center space-x-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <div>
                <div className="text-[10px] text-red-300 font-medium">Disputes</div>
                <div className="text-sm font-bold text-red-400">{disputedCount} Urgent</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search by ID, customer name, title, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New (Unassigned)</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="EN_ROUTE">En Route</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CUSTOMER_CONFIRMED">Customer Confirmed</option>
            <option value="DISPUTED">Disputed</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-secondary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Requests Data Table / Cards */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 stroke-1 opacity-50" />
            <p className="text-sm font-medium">No service requests match your search criteria.</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Try resetting the filters above.</p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)]/50 transition-all duration-200 shadow-sm space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {req.id}
                  </span>
                  <PriorityBadge priority={req.priority} />
                  <span className="text-xs font-medium text-[var(--text-muted)]">
                    {req.categoryName}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusBadge status={req.status} />
                  {['NEW', 'REJECTED_BY_TECHNICIAN'].includes(req.status) && (
                    <button
                      onClick={() => handleOpenAssignModal(req)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Assign Technician</span>
                    </button>
                  )}
                  {req.status === 'ACCEPTED' && (
                    <button
                      onClick={() => updateRequestStatus(req.id, 'SCHEDULED')}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Confirm Schedule</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    {req.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {req.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[var(--text-muted)] pt-1">
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>{req.address}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Preferred: {req.preferredDate} ({req.preferredTimeWindow})</span>
                    </span>
                  </div>
                </div>

                {/* Assignment & Customer Details */}
                <div className="p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[var(--text-muted)]">
                    <span>Customer:</span>
                    <span className="font-semibold text-[var(--text-primary)] truncate max-w-[140px]">
                      {req.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[var(--text-muted)]">
                    <span>Assigned Tech:</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {req.assignedTechnicianName ? (
                        <span className="text-[var(--accent-primary)]">
                          {req.assignedTechnicianName}
                        </span>
                      ) : (
                        <span className="text-[var(--text-muted)] italic">Unassigned</span>
                      )}
                    </span>
                  </div>
                  {req.appointmentDate && (
                    <div className="flex justify-between items-center text-[var(--text-muted)]">
                      <span>Appointment:</span>
                      <span className="text-[var(--text-secondary)] font-mono text-[11px]">
                        {req.appointmentDate} · {req.appointmentTimeWindow}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive State Machine Visualizer */}
              <div className="pt-2 border-t border-[var(--border-subtle)]/60">
                <StateMachineProgress currentStatus={req.status} showDetails={false} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Technician Assignment Modal with Conflict Check */}
      {assigningRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[var(--accent-primary)]" />
                  <span>Assign Technician to {assigningRequest.id}</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Category: {assigningRequest.categoryName}
                </p>
              </div>
              <button
                onClick={() => setAssigningRequest(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {assignError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-start space-x-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-200">Assignment Conflict / Error</div>
                  <div>{assignError}</div>
                </div>
              </div>
            )}

            {assignSuccess && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{assignSuccess}</span>
              </div>
            )}

            <form onSubmit={handleExecuteAssignment} className="space-y-4">
              {/* Technician Selection with Skill Badges */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)]">
                  Select Field Technician (Skill Matched & Availability)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {technicians.map((t) => {
                    const isSkillMatch = t.skills.includes(assigningRequest.categoryId);
                    const isSelected = selectedTechId === t.id;

                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTechId(t.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]'
                            : 'bg-[var(--bg-main)] border-[var(--border-subtle)] hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <UserAvatar name={t.name} size="sm" />
                          <div>
                            <div className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-2">
                              <span>{t.name}</span>
                              {isSkillMatch && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                  Skill Match
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              ★ {t.rating} · {t.completedJobsCount} jobs completed · {t.currentLocation}
                            </div>
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="technician"
                          checked={isSelected}
                          onChange={() => setSelectedTechId(t.id)}
                          className="accent-[var(--accent-primary)]"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Date & Time Window */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Scheduled Date
                  </label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                    Time Window
                  </label>
                  <select
                    value={appointmentTimeWindow}
                    onChange={(e) => setAppointmentTimeWindow(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  >
                    <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                    <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                    <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                    <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                    <option value="05:00 PM - 07:00 PM">05:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setAssigningRequest(null)}
                  className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold shadow-md transition-all"
                >
                  Confirm & Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
