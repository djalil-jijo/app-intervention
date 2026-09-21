import React from 'react';
import { TicketStatus } from '@prisma/client';
import { Clock, Wrench, CheckCircle2, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: TicketStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          En attente
        </span>
      );
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30 shadow-glow-sky">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-spin"></span>
          <Wrench className="w-3.5 h-3.5 text-sky-400" />
          En cours
        </span>
      );
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-glow-emerald">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Résolu
        </span>
      );
    case 'CLOSED':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800/80 text-slate-400 border border-slate-700/60">
          <Archive className="w-3.5 h-3.5 text-slate-400" />
          Clôturé
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-navy-800 text-slate-300 border border-navy-700">
          {status}
        </span>
      );
  }
};
