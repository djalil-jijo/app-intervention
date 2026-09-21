'use client';

import React from 'react';
import { Search, Filter, RefreshCw, X } from 'lucide-react';

interface TicketFiltersProps {
  search:       string;
  setSearch:    (val: string) => void;
  unitType:     string;
  setUnitType:  (val: string) => void;
  status:       string;
  setStatus:    (val: string) => void;
  priority:     string;
  setPriority:  (val: string) => void;
  onRefresh:    () => void;
  isRefreshing?: boolean;
}

export const TicketFilters: React.FC<TicketFiltersProps> = ({
  search,
  setSearch,
  unitType,
  setUnitType,
  status,
  setStatus,
  priority,
  setPriority,
  onRefresh,
  isRefreshing = false,
}) => {
  const selectCls =
    'px-3.5 py-2.5 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-200 text-xs font-semibold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 cursor-pointer transition-all hover:border-navy-650';

  const hasActiveFilters = search || unitType !== 'ALL' || status !== 'ALL' || priority !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setUnitType('ALL');
    setStatus('ALL');
    setPriority('ALL');
  };

  return (
    <div className="bg-navy-900/90 border border-navy-750 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between backdrop-blur-xl">
      {/* Search Bar */}
      <div className="relative w-full lg:w-96 shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher ticket, nom, entité, matériel..."
          className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-100 placeholder-slate-500 text-xs font-medium focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filter Selects */}
      <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider mr-1">
          <Filter className="w-3.5 h-3.5 text-sky-400" />
          Filtres :
        </div>

        {/* Unit Type Filter */}
        <select value={unitType} onChange={(e) => setUnitType(e.target.value)} className={selectCls}>
          <option value="ALL">Toutes les entités</option>
          <option value="FILIALE">Filiale (Dir. Régionale)</option>
          <option value="CIC">CIC (Dir. de Wilaya)</option>
          <option value="UPC">UPC (Unité de Production)</option>
        </select>

        {/* Priority Filter */}
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectCls}>
          <option value="ALL">Toutes priorités</option>
          <option value="CRITICAL">Haute / Critique</option>
          <option value="URGENT">Urgente</option>
          <option value="MEDIUM">Moyenne</option>
          <option value="LOW">Basse</option>
        </select>

        {/* Status Filter */}
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
          <option value="ALL">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="IN_PROGRESS">En cours</option>
          <option value="RESOLVED">Résolu</option>
          <option value="CLOSED">Clôturé</option>
        </select>

        {/* Clear Filters Button if active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        )}

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 hover:bg-navy-850 transition-all disabled:opacity-50"
          title="Actualiser les données"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>
    </div>
  );
};
