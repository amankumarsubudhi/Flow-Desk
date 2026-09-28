import React from 'react';
import { Priority } from '../../types';

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const getStyle = () => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500/15 border-red-500/40 text-red-400 font-semibold';
      case 'HIGH':
        return 'bg-orange-500/15 border-orange-500/40 text-orange-400';
      case 'MEDIUM':
        return 'bg-amber-500/15 border-amber-500/40 text-amber-400';
      case 'LOW':
        return 'bg-slate-500/15 border-slate-500/40 text-slate-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider ${getStyle()}`}
    >
      {priority}
    </span>
  );
};
