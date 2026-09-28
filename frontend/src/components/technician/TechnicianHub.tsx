import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { PartItem, ServiceRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { StateMachineProgress } from '../common/StateMachineProgress';
import {
  Wrench,
  Navigation,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  FileText,
  Upload,
  Camera,
  AlertCircle,
  Calendar,
  IndianRupee,
  Check,
} from 'lucide-react';

export const TechnicianHub: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    requests,
    technicianRespondAssignment,
    updateRequestStatus,
    submitWorkReport,
  } = useOperations();

  // Rejection modal
  const [rejectingReqId, setRejectingReqId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Work Report Modal
  const [activeReportReq, setActiveReportReq] = useState<ServiceRequest | null>(null);
  const [problemIdentified, setProblemIdentified] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [laborCost, setLaborCost] = useState<number>(500);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [parts, setParts] = useState<PartItem[]>([
    { id: 'p_1', name: 'Standard Replacement Component', quantity: 1, unitCost: 350 },
  ]);

  // Filter requests assigned to this technician
  const myJobs = requests.filter(
    (r) =>
      !currentUser ||
      r.assignedTechnicianName === currentUser.name ||
      r.assignedTechnicianId === currentUser.id ||
      (currentUser.role === 'TECHNICIAN' && r.assignedTechnicianName?.toLowerCase().includes(currentUser.name.toLowerCase()))
  );

  const handleAddPart = () => {
    setParts([
      ...parts,
      { id: `p_${Date.now()}`, name: '', quantity: 1, unitCost: 0 },
    ]);
  };

  const handleRemovePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const handleUpdatePart = (id: string, field: keyof PartItem, value: any) => {
    setParts(
      parts.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleOpenReportModal = (req: ServiceRequest) => {
    setActiveReportReq(req);
    setProblemIdentified('Coil ice build-up caused by degraded thermal expansion valve.');
    setWorkPerformed('Replaced TXV valve, vacuum-tested line at 500 microns, and recharged refrigerant.');
    setLaborCost(600);
    setAdditionalCharges(0);
    setNotes('All temperature sensors verified within normal operating parameters.');
    setParts([
      { id: 'p_1', name: 'Thermal Expansion Valve 1.5T', quantity: 1, unitCost: 650 },
      { id: 'p_2', name: 'R410A Refrigerant Cyl (1kg)', quantity: 1, unitCost: 400 },
    ]);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportReq) return;

    await submitWorkReport(activeReportReq.id, {
      problemIdentified,
      workPerformed,
      partsUsed: parts.filter((p) => p.name.trim() !== ''),
      laborCost: Number(laborCost) || 0,
      additionalCharges: Number(additionalCharges) || 0,
      notes,
      beforeImages: [
        'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      ],
      afterImages: [
        'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=600&auto=format&fit=crop&q=80',
      ],
    });

    setActiveReportReq(null);
  };

  // Calculations preview
  const serviceCharge = 500;
  const partsTotal = parts.reduce((acc, p) => acc + (p.quantity || 1) * (p.unitCost || 0), 0);
  const subtotal = serviceCharge + partsTotal + Number(laborCost || 0) + Number(additionalCharges || 0);
  const taxAmount = Math.round(subtotal * 0.18);
  const totalBill = subtotal + taxAmount;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-[var(--accent-primary)]" />
            <span>Field Technician Hub</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Logged in as: <span className="text-[var(--text-primary)] font-semibold">{currentUser?.name || 'Technician'}</span> (Senior Field Specialist)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-xs">
            <span className="text-[var(--text-muted)]">Active Assigned Jobs: </span>
            <span className="font-bold text-[var(--text-primary)]">{myJobs.length}</span>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-5">
        {myJobs.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            <Check className="w-12 h-12 mx-auto mb-2 opacity-40 text-emerald-400" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Active Assignments</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              You are currently caught up! New dispatch assignments will appear here live.
            </p>
          </div>
        ) : (
          myJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)]/40 transition-all duration-200 shadow-md space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {job.id}
                  </span>
                  <PriorityBadge priority={job.priority} />
                  <span className="text-xs text-[var(--text-muted)]">{job.categoryName}</span>
                </div>
                <StatusBadge status={job.status} />
              </div>

              {/* Job Info */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-[var(--text-primary)]">
                  {job.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {job.description}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                  <span className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span className="text-[var(--text-primary)] font-medium">{job.address}</span>
                  </span>
                  <span className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                    <span>Appointment: {job.appointmentDate || job.preferredDate} ({job.appointmentTimeWindow || job.preferredTimeWindow})</span>
                  </span>
                </div>
              </div>

              {/* Workflow Stepper */}
              <div className="py-2 border-t border-b border-[var(--border-subtle)]/50">
                <StateMachineProgress currentStatus={job.status} showDetails={true} />
              </div>

              {/* Guided Step Actions (Discrete audited buttons) */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="text-xs text-[var(--text-muted)] font-mono">
                  Current Workflow Stage: <span className="text-[var(--accent-primary)] font-bold">{job.status}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* ASSIGNED -> ACCEPT or REJECT */}
                  {job.status === 'ASSIGNED' && (
                    <>
                      <button
                        onClick={() => setRejectingReqId(job.id)}
                        className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-1.5 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Decline Job</span>
                      </button>
                      <button
                        onClick={() => technicianRespondAssignment(job.id, 'ACCEPT')}
                        className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept Assignment</span>
                      </button>
                    </>
                  )}

                  {/* ACCEPTED / SCHEDULED -> EN_ROUTE */}
                  {['ACCEPTED', 'SCHEDULED'].includes(job.status) && (
                    <button
                      onClick={() => updateRequestStatus(job.id, 'EN_ROUTE')}
                      className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Travel (Mark En Route)</span>
                    </button>
                  )}

                  {/* EN_ROUTE -> ON_SITE */}
                  {job.status === 'EN_ROUTE' && (
                    <button
                      onClick={() => updateRequestStatus(job.id, 'ON_SITE')}
                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Arrived On Site</span>
                    </button>
                  )}

                  {/* ON_SITE -> IN_PROGRESS */}
                  {job.status === 'ON_SITE' && (
                    <button
                      onClick={() => updateRequestStatus(job.id, 'IN_PROGRESS')}
                      className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Begin Diagnostics / Work</span>
                    </button>
                  )}

                  {/* IN_PROGRESS -> SUBMIT WORK REPORT */}
                  {job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleOpenReportModal(job)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold flex items-center space-x-1.5 shadow-lg transition-all"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Complete Work & File Report</span>
                    </button>
                  )}

                  {/* COMPLETED or beyond */}
                  {['COMPLETED', 'CUSTOMER_CONFIRMED', 'CLOSED'].includes(job.status) && (
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Work Report Submitted (₹{job.workReport?.totalAmount?.toLocaleString() || '2,242'})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      {rejectingReqId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <span>Decline Job Assignment</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Declining this assignment will immediately return it to the Dispatcher queue for reassignment.
            </p>

            <div>
              <label className="text-xs font-medium text-[var(--text-muted)] block mb-1">
                Reason for declining (required for audit log)
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Scheduled equipment calibration, emergency overtime conflict..."
                className="w-full p-3 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-red-400"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setRejectingReqId(null)}
                className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  technicianRespondAssignment(rejectingReqId, 'REJECT', rejectReason);
                  setRejectingReqId(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Work Report Submission Modal */}
      {activeReportReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)] flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-[var(--accent-primary)]" />
                  <span>File Work & Completion Report</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Job ID: {activeReportReq.id} · {activeReportReq.title}
                </p>
              </div>
              <button
                onClick={() => setActiveReportReq(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReport} className="space-y-4">
              {/* Problem Identified */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Problem Identified / Root Cause
                </label>
                <input
                  type="text"
                  required
                  value={problemIdentified}
                  onChange={(e) => setProblemIdentified(e.target.value)}
                  placeholder="e.g., Burned capacitor and low suction line pressure"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Work Performed */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Work Performed
                </label>
                <textarea
                  rows={2}
                  required
                  value={workPerformed}
                  onChange={(e) => setWorkPerformed(e.target.value)}
                  placeholder="Describe parts replaced, tests conducted, safety checks..."
                  className="w-full px-3.5 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Itemized Parts Used */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-primary)] flex items-center space-x-1.5">
                    <span>Parts & Materials Itemization</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPart}
                    className="text-[11px] text-[var(--accent-primary)] hover:underline flex items-center space-x-1 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {parts.map((p) => (
                    <div key={p.id} className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Part description"
                        value={p.name}
                        onChange={(e) => handleUpdatePart(p.id, 'name', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={p.quantity}
                        onChange={(e) => handleUpdatePart(p.id, 'quantity', Number(e.target.value))}
                        className="w-16 px-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] text-center focus:outline-none"
                      />
                      <div className="relative w-24">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)]">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Cost"
                          value={p.unitCost}
                          onChange={(e) => handleUpdatePart(p.id, 'unitCost', Number(e.target.value))}
                          className="w-full pl-5 pr-2 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs text-[var(--text-primary)] focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(p.id)}
                        className="p-1 text-[var(--text-muted)] hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Labor & Additional Charges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={laborCost}
                    onChange={(e) => setLaborCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Additional Charges (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={additionalCharges}
                    onChange={(e) => setAdditionalCharges(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  />
                </div>
              </div>

              {/* Diagnostic Notes */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Technician Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Server-calculated Invoice Breakdown Preview (PRD Section 5.6) */}
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-1.5 text-xs">
                <div className="text-[11px] font-mono text-[var(--accent-primary)] uppercase tracking-wider mb-1">
                  Server-Calculated Invoice Preview
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Base Service Charge:</span>
                  <span>₹{serviceCharge.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Itemized Parts Total:</span>
                  <span>₹{partsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Labor Charges:</span>
                  <span>₹{laborCost.toLocaleString()}</span>
                </div>
                {additionalCharges > 0 && (
                  <div className="flex justify-between text-[var(--text-secondary)]">
                    <span>Additional Charges:</span>
                    <span>₹{additionalCharges.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[var(--text-primary)] pt-1 border-t border-[var(--border-subtle)] font-semibold">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Tax (18% GST / Service Tax):</span>
                  <span>₹{taxAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-[var(--accent-primary)] pt-1 border-t border-[var(--border-subtle)]">
                  <span>Total Final Amount:</span>
                  <span>₹{totalBill.toLocaleString()}</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setActiveReportReq(null)}
                  className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg transition-all"
                >
                  Submit & Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
