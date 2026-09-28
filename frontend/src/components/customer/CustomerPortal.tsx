import React, { useState } from 'react';
import { useOperations } from '../../context/OperationsContext';
import { useAuth } from '../../context/AuthContext';
import { Priority, ServiceRequest } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { StateMachineProgress } from '../common/StateMachineProgress';
import confetti from 'canvas-confetti';
import {
  PlusCircle,
  FileCheck2,
  AlertTriangle,
  CreditCard,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  X,
  ShieldCheck,
  Receipt,
  Sparkles,
  Phone,
  Paperclip,
} from 'lucide-react';

export const CustomerPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const {
    requests,
    categories,
    createServiceRequest,
    customerConfirmWork,
    processPayment,
  } = useOperations();

  // Create Request Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_hvac');
  const [priority, setPriority] = useState<Priority>('HIGH');
  const [address, setAddress] = useState('742 Evergreen Plaza, Suite 300');
  const [preferredDate, setPreferredDate] = useState('2026-09-29');
  const [preferredTimeWindow, setPreferredTimeWindow] = useState('10:00 AM - 12:00 PM');

  // Confirmation & Review Modal
  const [reviewingReq, setReviewingReq] = useState<ServiceRequest | null>(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('Excellent precision, technician was very professional.');
  const [isDisputing, setIsDisputing] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');

  // Payment Modal
  const [payingReq, setPayingReq] = useState<ServiceRequest | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI / Instant Transfer');
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Customer's requests
  const myRequests = requests.filter(
    (r) => !currentUser || r.customerId === currentUser.id || r.customerName === currentUser.name
  );

  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsCreating(true);
    try {
      const res = await createServiceRequest({
        title,
        description,
        categoryId: categoryId || categories[0]?.id || 'cat_hvac',
        priority,
        address,
        preferredDate,
        preferredTimeWindow,
      });

      if (res.success) {
        setIsCreateOpen(false);
        setTitle('');
        setDescription('');
      } else {
        setCreateError(res.message);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!reviewingReq) return;

    if (isDisputing) {
      if (!disputeReason.trim()) {
        alert('Please provide a reason for the dispute.');
        return;
      }
      await customerConfirmWork(reviewingReq.id, 'DISPUTE', { disputeReason });
      setReviewingReq(null);
      setIsDisputing(false);
    } else {
      await customerConfirmWork(reviewingReq.id, 'CONFIRM', {
        ratingScore,
        ratingComment,
      });
      const targetReq = reviewingReq;
      setReviewingReq(null);
      // Open Payment Modal immediately
      setPayingReq(targetReq);
    }
  };

  const handleExecutePayment = async () => {
    if (!payingReq) return;
    setIsPaymentProcessing(true);

    try {
      await processPayment(payingReq.id, paymentMethod);
      setIsPaymentProcessing(false);
      setPayingReq(null);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF7A00', '#A855F7', '#22C55E', '#FFFFFF'],
        });
      } catch (err) {
        // Confetti fallback
      }
    } catch {
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center space-x-2">
            <span>Customer Service Hub</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Welcome, <span className="text-[var(--text-primary)] font-semibold">{currentUser?.name || 'Valued Customer'}</span> · Real-time operational request tracking
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold flex items-center space-x-2 shadow-lg transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Service Request</span>
        </button>
      </div>

      {/* Requests List */}
      <div className="space-y-5">
        {myRequests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            <Sparkles className="w-10 h-10 mx-auto mb-2 text-[var(--accent-primary)] opacity-60" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Active Requests</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Need maintenance or repair? Click "New Service Request" above to request a technician.
            </p>
          </div>
        ) : (
          myRequests.map((req) => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--border-focus)]/40 transition-all duration-200 shadow-md space-y-4"
            >
              {/* Top Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]">
                    {req.id}
                  </span>
                  <PriorityBadge priority={req.priority} />
                  <span className="text-xs font-medium text-[var(--text-muted)]">{req.categoryName}</span>
                </div>
                <StatusBadge status={req.status} />
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {req.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {req.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] pt-1">
                    <span className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>{req.address}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      <span>Preferred Slot: {req.preferredDate} ({req.preferredTimeWindow})</span>
                    </span>
                  </div>
                </div>

                {/* Assigned Technician or Invoice Summary */}
                <div className="p-3.5 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2.5 text-xs">
                  <div className="text-[11px] font-mono text-[var(--text-muted)] uppercase">
                    Service Dispatch Info
                  </div>
                  {req.assignedTechnicianName ? (
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/40 flex items-center justify-center text-[var(--accent-primary)] font-bold">
                        {req.assignedTechnicianName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-[var(--text-primary)] text-xs">
                          {req.assignedTechnicianName}
                        </div>
                        <div className="text-[10px] text-emerald-400">Assigned Technician</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[var(--text-muted)] italic text-xs">
                      Awaiting dispatcher allocation...
                    </div>
                  )}

                  {/* Invoice Quick Summary if Available */}
                  {req.invoice && (
                    <div className="pt-2 border-t border-[var(--border-subtle)]/70 flex items-center justify-between">
                      <span className="text-[var(--text-muted)]">Invoice Total:</span>
                      <span className="font-extrabold text-[var(--accent-primary)] text-sm">
                        ₹{req.invoice.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* State Machine Stepper */}
              <div className="py-2 border-t border-[var(--border-subtle)]/50">
                <StateMachineProgress currentStatus={req.status} showDetails={true} />
              </div>

              {/* Action Buttons for Customer */}
              {req.status === 'COMPLETED' && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse-subtle">
                  <div className="flex items-center space-x-2.5">
                    <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">
                        Work Completed by Technician
                      </div>
                      <div className="text-[11px] text-emerald-400/80">
                        Please review the itemized report and confirm your satisfaction to finalize payment.
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setReviewingReq(req)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md transition-all whitespace-nowrap"
                  >
                    Review & Confirm Work
                  </button>
                </div>
              )}

              {req.status === 'CUSTOMER_CONFIRMED' && (
                <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-5 h-5 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-blue-300">
                        Work Confirmed — Payment Pending
                      </div>
                      <div className="text-[11px] text-blue-400/80">
                        Amount Due: ₹{req.invoice?.totalAmount.toLocaleString() || '2,242'} (Tax included)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setPayingReq(req)}
                    className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold shadow-md transition-all whitespace-nowrap"
                  >
                    Pay Invoice Now
                  </button>
                </div>
              )}

              {req.status === 'CLOSED' && (
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payment Settled & Job Archived</span>
                  </span>
                  <span className="font-mono text-[11px]">
                    Receipt #{req.invoice?.id || 'INV-8089'}
                  </span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 1. Create Request Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Submit Service Request
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Direct dispatch to certified field specialists
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Service Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Base Charge: ₹{c.baseCharge})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Problem Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. AC unit is not cooling and vibrating"
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Detailed Description & Symptoms
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe what is happening, error codes shown, or unusual noises..."
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Priority & Address */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Priority Level
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  >
                    <option value="LOW">Low (Routine)</option>
                    <option value="MEDIUM">Medium (Standard)</option>
                    <option value="HIGH">High (Urgent)</option>
                    <option value="URGENT">Urgent (Critical Outage)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Service Address
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                />
              </div>

              {/* Preferred Time Window */}
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                  Preferred Time Window
                </label>
                <select
                  value={preferredTimeWindow}
                  onChange={(e) => setPreferredTimeWindow(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                >
                  <option value="08:00 AM - 10:00 AM">08:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM</option>
                  <option value="01:00 PM - 03:00 PM">01:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 05:00 PM">03:00 PM - 05:00 PM</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold shadow-lg transition-all"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Customer Confirmation & Dispute Modal */}
      {reviewingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--text-primary)] flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Work Completion & Invoice Review</span>
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Job ID: {reviewingReq.id} · {reviewingReq.title}
                </p>
              </div>
              <button
                onClick={() => setReviewingReq(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Work Details Summary */}
            <div className="p-4 rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-medium">Root Cause Diagnosed: </span>
                <span className="text-[var(--text-primary)] font-semibold">
                  {reviewingReq.workReport?.problemIdentified || 'Component thermal overload replaced'}
                </span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-medium">Work Performed: </span>
                <span className="text-[var(--text-primary)]">
                  {reviewingReq.workReport?.workPerformed || 'Replaced parts and calibrated operational cycle'}
                </span>
              </div>
            </div>

            {/* Itemized Server-Calculated Bill */}
            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2 text-xs">
              <div className="text-[11px] font-mono text-[var(--accent-primary)] uppercase font-bold">
                Itemized Invoice Breakdown
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Base Service Charge:</span>
                <span>₹{reviewingReq.invoice?.serviceCharge || 500}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Parts Total:</span>
                <span>₹{reviewingReq.invoice?.partsTotal || 850}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>Labor Charges:</span>
                <span>₹{reviewingReq.invoice?.laborTotal || 600}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]">
                <span>Subtotal:</span>
                <span>₹{reviewingReq.invoice?.subtotal || 1950}</span>
              </div>
              <div className="flex justify-between text-[var(--text-secondary)]">
                <span>GST / Tax (18% Server-Computed):</span>
                <span>₹{reviewingReq.invoice?.taxAmount || 351}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[var(--accent-primary)] pt-1 border-t border-[var(--border-subtle)]">
                <span>Total Payable:</span>
                <span>₹{reviewingReq.invoice?.totalAmount || 2301}</span>
              </div>
            </div>

            {/* Toggle Dispute or Confirm */}
            {!isDisputing ? (
              <div className="space-y-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                    Rate Technician Service (1 - 5 Stars)
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingScore(star)}
                        className="p-1"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingScore
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-[var(--text-primary)] ml-2">
                      {ratingScore} / 5 Stars
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] block mb-1">
                    Feedback / Comments
                  </label>
                  <input
                    type="text"
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setIsDisputing(true)}
                    className="text-xs text-red-400 hover:text-red-300 font-medium flex items-center space-x-1"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Report an Issue (Dispute)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg transition-all"
                  >
                    Confirm & Proceed to Payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 bg-red-950/20 p-4 rounded-xl border border-red-500/30">
                <div className="flex items-center space-x-2 text-xs font-bold text-red-300">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Raise a Formal Service Dispute</span>
                </div>
                <p className="text-[11px] text-red-300/80 leading-relaxed">
                  Raising a dispute moves this request into the DISPUTED state and notifies operations management for review before payment.
                </p>

                <textarea
                  rows={3}
                  required
                  placeholder="Explain why you are disputing the work or charges..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full p-2.5 bg-[var(--bg-main)] border border-red-500/40 rounded-xl text-xs text-[var(--text-primary)] focus:outline-none"
                />

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDisputing(false)}
                    className="px-3 py-1.5 text-xs text-[var(--text-secondary)]"
                  >
                    Cancel Dispute
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAction}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-md"
                  >
                    Submit Formal Dispute
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Simulated Payment Modal */}
      {payingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-[var(--accent-primary)]" />
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  Simulated Payment Checkout
                </h3>
              </div>
              <button
                onClick={() => setPayingReq(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-center space-y-1">
              <span className="text-xs text-[var(--text-muted)]">Total Amount to Settle</span>
              <div className="text-3xl font-extrabold text-[var(--accent-primary)]">
                ₹{payingReq.invoice?.totalAmount.toLocaleString() || '2,242'}
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">
                18% GST Included · Request #{payingReq.id}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                Select Payment Mode (Simulated)
              </label>
              {['UPI / Instant Transfer', 'Corporate Credit Card (•••• 8821)', 'NetBanking (HDFC/ICICI)'].map((method) => (
                <div
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs font-semibold transition-all ${
                    paymentMethod === method
                      ? 'bg-[var(--bg-elevated)] border-[var(--accent-primary)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-main)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-neutral-600'
                  }`}
                >
                  <span>{method}</span>
                  <input
                    type="radio"
                    name="payMethod"
                    checked={paymentMethod === method}
                    onChange={() => setPaymentMethod(method)}
                    className="accent-[var(--accent-primary)]"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setPayingReq(null)}
                disabled={isPaymentProcessing}
                className="px-4 py-2 rounded-lg text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePayment}
                disabled={isPaymentProcessing}
                className="px-6 py-2.5 rounded-xl bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-black text-xs font-bold shadow-lg transition-all flex items-center space-x-2"
              >
                {isPaymentProcessing ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-black" />
                    <span>Processing Settlement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-black" />
                    <span>Authorize Payment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
