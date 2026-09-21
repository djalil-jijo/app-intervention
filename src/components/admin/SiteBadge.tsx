import React from 'react';
import { Building2, MapPin, Factory } from 'lucide-react';

interface SiteBadgeProps {
  site?: string;
  unitType?: string;
  unitName?: string;
  showName?: boolean;
}

export const SiteBadge: React.FC<SiteBadgeProps> = ({ site, unitType, unitName, showName = true }) => {
  const type = unitType || site || '';

  const configs: Record<string, { label: string; icon: React.ElementType; cls: string; dot: string }> = {
    FILIALE: {
      label: 'Filiale',
      icon:  Building2,
      cls:   'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
      dot:   'bg-indigo-400',
    },
    CIC: {
      label: 'CIC',
      icon:  MapPin,
      cls:   'text-sky-300 bg-sky-500/10 border-sky-500/30',
      dot:   'bg-sky-400',
    },
    UPC: {
      label: 'UPC',
      icon:  Factory,
      cls:   'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
      dot:   'bg-emerald-400',
    },
  };

  const cfg = configs[type];
  if (!cfg) return <span className="text-xs text-slate-400 font-mono">{type}</span>;

  const Icon = cfg.icon;
  return (
    <div className="flex flex-col gap-0.5">
      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-lg border font-bold w-fit ${cfg.cls}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {cfg.label}
      </span>
      {showName && unitName && (
        <span className="text-xs text-slate-200 font-semibold tracking-wide pl-0.5 leading-tight">
          {unitName}
        </span>
      )}
    </div>
  );
};
