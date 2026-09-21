import React from 'react';
import { AlertTriangle, AlertCircle, ArrowDown, Zap } from 'lucide-react';

interface PriorityBadgeProps {
  priority: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black tracking-wide bg-rose-500/15 text-rose-300 border border-rose-500/40 shadow-glow-rose animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          CRITIQUE
        </span>
      );
    case 'URGENT':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold tracking-wide bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-sm">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          URGENTE
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <AlertCircle className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          MOYENNE
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium tracking-wide bg-slate-800/60 text-slate-400 border border-slate-700/60">
          <ArrowDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          BASSE
        </span>
      );
    default:
      return <span className="text-xs text-slate-400 font-mono">{priority}</span>;
  }
};
