import React from 'react';
import { ServiceStatus } from '../../types';
import { CheckCircle2, Clock, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';

interface StateMachineProgressProps {
  currentStatus: ServiceStatus;
  showDetails?: boolean;
}

const PRIMARY_FLOW: { key: ServiceStatus; label: string; desc: string }[] = [
  { key: 'NEW', label: 'New', desc: 'Request submitted' },
  { key: 'ASSIGNED', label: 'Assigned', desc: 'Tech allocated' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Tech confirmed' },
  { key: 'SCHEDULED', label: 'Scheduled', desc: 'Slot booked' },
  { key: 'EN_ROUTE', label: 'En Route', desc: 'Travel in progress' },
  { key: 'ON_SITE', label: 'On Site', desc: 'Arrived at location' },
  { key: 'IN_PROGRESS', label: 'In Progress', desc: 'Work under execution' },
  { key: 'COMPLETED', label: 'Completed', desc: 'Work report filed' },
  { key: 'CUSTOMER_CONFIRMED', label: 'Confirmed', desc: 'Client verified' },
  { key: 'CLOSED', label: 'Closed', desc: 'Paid & archived' },
];

export const StateMachineProgress: React.FC<StateMachineProgressProps> = ({
  currentStatus,
  showDetails = true,
}) => {
  const isException = ['REJECTED_BY_TECHNICIAN', 'DISPUTED', 'REOPENED', 'CANCELLED', 'REFUNDED'].includes(
    currentStatus
  );

  const currentIndex = PRIMARY_FLOW.findIndex((step) => step.key === currentStatus);

  if (isException) {
    return (
      <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
            {currentStatus === 'CANCELLED' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-red-200">
              Workflow Status: {currentStatus.replace(/_/g, ' ')}
            </div>
            <div className="text-xs text-red-400/80">
              {currentStatus === 'REJECTED_BY_TECHNICIAN' && 'Technician declined; awaiting dispatcher reassignment.'}
              {currentStatus === 'DISPUTED' && 'Customer flagged an issue with the service report.'}
              {currentStatus === 'REOPENED' && 'Request reopened for operational resolution.'}
              {currentStatus === 'CANCELLED' && 'Service request has been cancelled.'}
              {currentStatus === 'REFUNDED' && 'Invoice has been refunded.'}
            </div>
          </div>
        </div>
        <div className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-red-500/20 text-red-300 border border-red-500/30">
          Exception State
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center min-w-[760px] justify-between relative">
          {PRIMARY_FLOW.map((step, idx) => {
            const isPassed = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            const isPending = currentIndex < idx;

            return (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center relative z-10 group">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 border ${
                      isPassed
                        ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)] text-black font-bold'
                        : isCurrent
                        ? 'bg-[var(--bg-main)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_12px_var(--accent-glow)] ring-2 ring-[var(--accent-primary)]/40 scale-110'
                        : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />
                    ) : isCurrent ? (
                      <Clock className="w-3.5 h-3.5 animate-spin text-[var(--accent-primary)]" />
                    ) : (
                      idx + 1
                    )}
                  </div>

                  <span
                    className={`text-[11px] mt-2 font-medium whitespace-nowrap transition-colors ${
                      isCurrent
                        ? 'text-[var(--accent-primary)] font-bold'
                        : isPassed
                        ? 'text-[var(--text-primary)]'
                        : 'text-[var(--text-muted)]'
                    }`}
                  >
                    {step.label}
                  </span>

                  {showDetails && (
                    <span className="text-[9px] text-[var(--text-muted)] hidden md:block text-center max-w-[70px] truncate">
                      {step.desc}
                    </span>
                  )}
                </div>

                {idx < PRIMARY_FLOW.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-1 transition-all duration-500 ${
                      currentIndex > idx
                        ? 'bg-[var(--accent-primary)]'
                        : 'bg-[var(--border-subtle)]'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
