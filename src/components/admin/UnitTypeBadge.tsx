import React from 'react';
import { Building2, MapPin, Factory } from 'lucide-react';

interface UnitTypeBadgeProps {
  unitType: string;
  unitName?: string;
  showName?: boolean;
}

const CONFIG: Record<string, { label: string; icon: React.ElementType; colors: string }> = {
  FILIALE: {
    label:  'Filiale',
    icon:   Building2,
    colors: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30',
  },
  CIC: {
    label:  'CIC',
    icon:   MapPin,
    colors: 'text-sky-300 bg-sky-500/10 border-sky-500/30',
  },
  UPC: {
    label:  'UPC',
    icon:   Factory,
    colors: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30',
  },
};

export const UnitTypeBadge: React.FC<UnitTypeBadgeProps> = ({
  unitType,
  unitName,
  showName = false,
}) => {
  const cfg = CONFIG[unitType];
  if (!cfg) return <span className="text-xs text-slate-400 font-mono">{unitType}</span>;

  const Icon = cfg.icon;

  return (
    <div className="flex flex-col gap-1">
      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-lg border font-bold w-fit ${cfg.colors}`}>
        <Icon className="w-3.5 h-3.5 shrink-0" />
        {cfg.label}
      </span>
      {showName && unitName && (
        <span className="text-xs text-slate-200 font-semibold leading-tight pl-0.5">
          {unitName}
        </span>
      )}
    </div>
  );
};

export const SiteBadge = UnitTypeBadge;
