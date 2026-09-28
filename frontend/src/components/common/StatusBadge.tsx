import React from 'react';
import { ServiceStatus } from '../../types';

interface StatusBadgeProps {
  status: ServiceStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (st: ServiceStatus) => {
    switch (st) {
      case 'NEW':
        return {
          label: 'New Request',
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          dot: 'bg-blue-400',
        };
      case 'ASSIGNED':
        return {
          label: 'Assigned',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
        };
      case 'ACCEPTED':
        return {
          label: 'Accepted',
          bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
          dot: 'bg-cyan-400',
        };
      case 'REJECTED_BY_TECHNICIAN':
        return {
          label: 'Declined by Tech',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400',
          dot: 'bg-indigo-400',
        };
      case 'EN_ROUTE':
        return {
          label: 'En Route',
          bg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
          dot: 'bg-yellow-400 animate-ping',
        };
      case 'ON_SITE':
        return {
          label: 'On Site',
          bg: 'bg-orange-500/10 border-orange-500/30 text-orange-400',
          dot: 'bg-orange-400',
        };
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          bg: 'bg-teal-500/10 border-teal-500/30 text-teal-400',
          dot: 'bg-teal-400 animate-pulse',
        };
      case 'COMPLETED':
        return {
          label: 'Work Completed',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
        };
      case 'CUSTOMER_CONFIRMED':
        return {
          label: 'Customer Confirmed',
          bg: 'bg-green-500/10 border-green-500/30 text-green-300',
          dot: 'bg-green-300',
        };
      case 'DISPUTED':
        return {
          label: 'Disputed',
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          dot: 'bg-red-400 animate-pulse',
        };
      case 'REOPENED':
        return {
          label: 'Reopened',
          bg: 'bg-purple-500/10 border-purple-500/30 text-purple-400',
          dot: 'bg-purple-400',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelled',
          bg: 'bg-neutral-500/10 border-neutral-500/30 text-neutral-400',
          dot: 'bg-neutral-400',
        };
      case 'CLOSED':
        return {
          label: 'Closed / Paid',
          bg: 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300',
          dot: 'bg-emerald-400',
        };
      case 'REFUNDED':
        return {
          label: 'Refunded',
          bg: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
          dot: 'bg-violet-400',
        };
      default:
        return {
          label: st,
          bg: 'bg-neutral-800 border-neutral-700 text-neutral-300',
          dot: 'bg-neutral-400',
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3 py-1.5 gap-2.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase ${config.bg} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};
