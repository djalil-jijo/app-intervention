'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  getTicketByNumberAction,
  getMyEmployeeTicketsAction,
  getTechnicianAssignedTicketsAction,
  updateTicketStatusAction
} from '@/app/actions/tickets';
import { getCurrentUserAction } from '@/app/actions/auth';
import { SessionUser } from '@/lib/auth';
import {
  Search, Ticket, Clock, CheckCircle2, Wrench, XCircle,
  User, MapPin, Building2, Factory, AlertTriangle, Loader2,
  FileText, Download, MessageSquare, Calendar, Cpu, Hash,
  ArrowRight, ShieldCheck, Zap, ChevronDown, ChevronUp,
  RefreshCw, Filter, PenTool, Award, PlusCircle, LogIn,
  Eye, Check, ExternalLink
} from 'lucide-react';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: any; step: number }> = {
  PENDING:     { label: 'قيد الانتظار', color: 'text-amber-300',  bg: 'bg-amber-500/15',  border: 'border-amber-500/40',  icon: Clock,         step: 1 },
  IN_PROGRESS: { label: 'قيد المعالجة', color: 'text-sky-300',    bg: 'bg-sky-500/15',    border: 'border-sky-500/40',    icon: Wrench,        step: 2 },
  RESOLVED:    { label: 'تم الحل',      color: 'text-emerald-300', bg: 'bg-emerald-500/15',border: 'border-emerald-500/40',icon: CheckCircle2,  step: 3 },
  CLOSED:      { label: 'مغلقة',        color: 'text-slate-300',   bg: 'bg-slate-500/15',  border: 'border-slate-500/40',  icon: XCircle,       step: 4 },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; badgeCls: string }> = {
  LOW:      { label: 'منخفضة',    color: 'text-slate-300',  badgeCls: 'bg-slate-500/10 text-slate-300 border-slate-700' },
  MEDIUM:   { label: 'متوسطة',    color: 'text-sky-300',    badgeCls: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  URGENT:   { label: 'عاجلة',     color: 'text-amber-300',  badgeCls: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  CRITICAL: { label: 'حرجة جداً', color: 'text-rose-300',   badgeCls: 'bg-rose-500/20 text-rose-300 border-rose-500/50' },
};

const UNIT_ICON: Record<string, any> = { FILIALE: Building2, CIC: MapPin, UPC: Factory };

function StatusTimeline({ currentStep }: { currentStep: number }) {
  const steps = [
    { label: 'مقدّمة',       desc: 'تم تسجيل الطلب',      icon: FileText },
    { label: 'قيد المعالجة', desc: 'التقني يتدخّل',        icon: Wrench },
    { label: 'تم الحل',      desc: 'المشكلة محلولة',       icon: CheckCircle2 },
    { label: 'مغلقة',        desc: 'الملف مكتمل',          icon: ShieldCheck },
  ];

  return (
    <div className="relative flex items-start justify-between gap-1 py-4">
      {/* connector line */}
      <div className="absolute top-9 left-0 right-0 h-0.5 bg-navy-800" />
      <div
        className="absolute top-9 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700"
        style={{ width: `${Math.max(0, ((currentStep - 1) / 3) * 100)}%` }}
      />
      {steps.map((step, i) => {
        const isActive  = i + 1 === currentStep;
        const isDone    = i + 1 < currentStep;
        const Icon = step.icon;
        return (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2 flex-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                isDone
                  ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-900/50'
                  : isActive
                  ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-900/50 animate-pulse'
                  : 'bg-navy-900 border-navy-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isDone ? 'text-white' : isActive ? 'text-sky-400' : 'text-slate-600'}`} />
            </div>
            <div className="text-center">
              <p className={`text-[11px] font-black ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-slate-500'}`}>{step.label}</p>
              <p className="text-[10px] text-slate-500 hidden sm:block">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function TrackPage() {
  const [currentUser,     setCurrentUser]     = useState<SessionUser | null>(null);
  const [activeTab,       setActiveTab]       = useState<'my_tickets' | 'search'>('my_tickets');
  const [myTickets,       setMyTickets]       = useState<any[]>([]);
  const [statusFilter,    setStatusFilter]    = useState<string>('ALL');
  const [loadingList,     setLoadingList]     = useState(false);

  // Single ticket search state
  const [query,           setQuery]           = useState('');
  const [loadingSearch,   setLoadingSearch]   = useState(false);
  const [ticket,          setTicket]          = useState<any | null>(null);
  const [error,           setError]           = useState<string | null>(null);
  const [showComments,    setShowComments]    = useState(false);

  // Check auth and load tickets
  const fetchMyTickets = useCallback(async (u: SessionUser | null) => {
    if (!u) return;
    setLoadingList(true);
    try {
      if (u.role === 'TECHNICIAN') {
        const res = await getTechnicianAssignedTicketsAction();
        if (res.success && res.data) setMyTickets(res.data);
      } else {
        const res = await getMyEmployeeTicketsAction();
        if (res.success && res.data) setMyTickets(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const u = await getCurrentUserAction();
      setCurrentUser(u);
      if (u) {
        setActiveTab('my_tickets');
        fetchMyTickets(u);
      } else {
        setActiveTab('search');
      }
    }
    init();
  }, [fetchMyTickets]);

  const handleSearch = async (e?: React.FormEvent, customNumber?: string) => {
    e?.preventDefault();
    const searchTarget = customNumber || query;
    if (!searchTarget.trim()) return;

    setLoadingSearch(true);
    setError(null);
    setTicket(null);

    const res = await getTicketByNumberAction(searchTarget.trim().toUpperCase());
    if (res.success && res.data) {
      setTicket(res.data);
      // scroll to ticket view
      if (customNumber) {
        window.scrollTo({ top: 300, behavior: 'smooth' });
      }
    } else {
      setError(res.error || 'خطأ غير متوقع في البحث.');
    }
    setLoadingSearch(false);
  };

  const filteredTickets = myTickets.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const counts = {
    all: myTickets.length,
    pending: myTickets.filter((t) => t.status === 'PENDING').length,
    inProgress: myTickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: myTickets.filter((t) => t.status === 'RESOLVED').length,
    closed: myTickets.filter((t) => t.status === 'CLOSED').length,
  };

  const statusCfg = ticket ? (STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.PENDING) : null;
  const priorityCfg = ticket ? (PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.MEDIUM) : null;
  const UnitIcon = ticket ? (UNIT_ICON[ticket.unitType] ?? Building2) : Building2;

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-900/90 border border-sky-500/30 text-sky-300 text-xs font-bold shadow-glow-sky">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
          </span>
          <Search className="w-3.5 h-3.5" />
          <span>منظومة التتبع الفوري للتدخلات</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          تتبّع حالة{' '}
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
            {currentUser?.role === 'TECHNICIAN' ? 'التدخلات المكلف بها' : 'طلبات التدخل الرسمية'}
          </span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          {currentUser
            ? `أهلاً بك ${currentUser.name}. استعرض جميع طلباتك وتطور حالتها لحظة بلحظة مع إمكانية تحميل النسخة الموقعة والمختومة.`
            : 'أدخل رقم التذكرة للاطلاع الفوري على حالة التدخل، أو سجّل دخولك لعرض قائمة طلباتك كاملة بنقرة واحدة.'}
        </p>
      </div>

      {/* Navigation Tabs (My Tickets vs Search by number) */}
      <div className="flex p-1.5 bg-navy-900/90 border border-navy-800 rounded-2xl max-w-md mx-auto">
        {currentUser && (
          <button
            type="button"
            onClick={() => setActiveTab('my_tickets')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'my_tickets'
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>
              {currentUser.role === 'TECHNICIAN' ? 'مهامي المعينة' : 'قائمة طلباتي'} ({counts.all})
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'search'
              ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>بحث برقم التذكرة</span>
        </button>
      </div>

      {/* TAB 1: MY TICKETS DASHBOARD */}
      {activeTab === 'my_tickets' && currentUser && (
        <div className="space-y-5">
          {/* Status Filter Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-navy-900/80 border border-navy-800 rounded-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-navy-950 text-slate-400 hover:text-white border border-navy-750'
                }`}
              >
                الكل ({counts.all})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('PENDING')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                    : 'bg-navy-950 text-amber-300/80 hover:text-amber-200 border border-navy-750'
                }`}
              >
                قيد الانتظار ({counts.pending})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'IN_PROGRESS'
                    ? 'bg-sky-500 text-white shadow-md'
                    : 'bg-navy-950 text-sky-300/80 hover:text-sky-200 border border-navy-750'
                }`}
              >
                قيد المعالجة ({counts.inProgress})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('RESOLVED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'RESOLVED'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'bg-navy-950 text-emerald-300/80 hover:text-emerald-200 border border-navy-750'
                }`}
              >
                تم الحل ({counts.resolved})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('CLOSED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  statusFilter === 'CLOSED'
                    ? 'bg-slate-600 text-white shadow-md'
                    : 'bg-navy-950 text-slate-400 hover:text-slate-200 border border-navy-750'
                }`}
              >
                مغلقة ({counts.closed})
              </button>
            </div>

            <button
              type="button"
              onClick={() => fetchMyTickets(currentUser)}
              className="p-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition-colors"
              title="تحديث القائمة"
            >
              <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Tickets List */}
          {loadingList ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
              <p className="text-xs text-slate-400">جاري تحميل تذاكرك...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-12 text-center bg-navy-900/60 border border-navy-800 rounded-3xl space-y-4">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <p className="text-base font-bold text-white">لا توجد طلبات مطابقة حالياً</p>
                <p className="text-xs text-slate-400 mt-1">
                  {currentUser.role === 'EMPLOYEE'
                    ? 'يمكنك تقديم طلب تدخل جديد وسيرفق به إمضاؤك وختمك تلقائياً.'
                    : 'لم يتم إسناد أي تذاكر في هذا التصنيف بعد.'}
                </p>
              </div>
              {currentUser.role === 'EMPLOYEE' && (
                <Link
                  href="/request"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white text-xs font-extrabold shadow-lg transition-transform hover:scale-105"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>تقديم طلب تدخل جديد الآن</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredTickets.map((t) => {
                const s = STATUS_CONFIG[t.status] || STATUS_CONFIG.PENDING;
                const p = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.MEDIUM;
                const isSelected = ticket?.id === t.id;

                return (
                  <div
                    key={t.id}
                    className={`
                      p-5 rounded-3xl border transition-all duration-200 bg-navy-900/90
                      ${isSelected ? 'border-sky-400 ring-2 ring-sky-400/20 shadow-glow-sky' : 'border-navy-800 hover:border-navy-700 shadow-xl'}
                    `}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Info */}
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-sm font-black text-sky-400">
                            {t.ticketNumber}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${s.bg} ${s.color} ${s.border}`}>
                            {s.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${p.badgeCls}`}>
                            {p.label}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-white">{t.equipment}</h4>
                        <p className="text-xs text-slate-400 line-clamp-1">{t.description}</p>
                        
                        <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1 font-mono">
                          <span>📅 {new Date(t.createdAt).toLocaleDateString('ar-DZ')}</span>
                          {t.technician && (
                            <span className="text-sky-300 font-sans flex items-center gap-1">
                              <Wrench className="w-3 h-3" />
                              التقني: {t.technician.name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleSearch(undefined, t.ticketNumber)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all hover:scale-105"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض التفاصيل والتتبع</span>
                        </button>

                        <a
                          href={`/api/tickets/${t.id}/pdf?type=ticket`}
                          download
                          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition-colors"
                          title="تحميل الاستمارة الموقعة والمختومة PDF"
                        >
                          <Download className="w-4 h-4 text-emerald-400" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL SEARCH BY NUMBER */}
      {activeTab === 'search' && (
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                id="ticket-search-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="أدخل رقم التذكرة... مثال: DEM-2026-0001"
                className="w-full pr-10 pl-4 py-3.5 rounded-2xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 text-sm font-mono focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 outline-none transition-all tracking-wider"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch || !query.trim()}
              id="ticket-search-btn"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-sky-950/50 hover:from-sky-400 hover:to-indigo-500 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loadingSearch
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Search className="w-4 h-4" />
              }
              {loadingSearch ? 'جاري البحث...' : 'متابعة الطلب'}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-300">{error}</p>
                <p className="text-xs text-rose-400/70 mt-0.5">تأكد من رقم التذكرة وحاول مرة أخرى.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SELECTED TICKET EXPANDED DETAILS */}
      {ticket && statusCfg && priorityCfg && (
        <div className="bg-navy-900 border border-navy-750 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in backdrop-blur-xl">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-navy-800 pb-5">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-black text-white">{ticket.ticketNumber}</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                  <statusCfg.icon className="w-3.5 h-3.5" />
                  {statusCfg.label}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${priorityCfg.badgeCls}`}>
                  {priorityCfg.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                تاريخ الطلب: {new Date(ticket.createdAt).toLocaleString('fr-FR')}
              </p>
            </div>

            {/* Quick Actions (PDF) */}
            <div className="flex items-center gap-2">
              <a
                href={`/api/tickets/${ticket.id}/pdf?type=ticket`}
                download
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105"
              >
                <Download className="w-4 h-4" />
                <span>تحميل PDF الموقع والمختوم</span>
              </a>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-navy-950/60 rounded-2xl p-4 border border-navy-800">
            <p className="text-xs font-black uppercase text-slate-400 mb-2">مراحل التدخل الفني:</p>
            <StatusTimeline currentStep={statusCfg.step} />
          </div>

          {/* Ticket Information Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-navy-950/80 border border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400">
                <User className="w-4 h-4" />
                <span>صاحب الطلب والهيكل:</span>
              </div>
              <p className="text-sm font-bold text-white">{ticket.fullName}</p>
              <p className="text-xs text-slate-400">{ticket.service} · {ticket.unitName}</p>
              {ticket.functionTitle && <p className="text-xs text-slate-500">{ticket.functionTitle}</p>}
            </div>

            <div className="p-4 rounded-2xl bg-navy-950/80 border border-navy-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-sky-400">
                <Cpu className="w-4 h-4" />
                <span>العتاد المعني بالمشكلة:</span>
              </div>
              <p className="text-sm font-bold text-white">{ticket.equipment}</p>
              <p className="text-xs text-slate-400">{ticket.category}</p>
              {ticket.serialNumber && <p className="text-xs text-slate-500 font-mono">SN: {ticket.serialNumber}</p>}
            </div>
          </div>

          {/* Description */}
          <div className="p-4 rounded-2xl bg-navy-950/80 border border-navy-800 space-y-1.5">
            <span className="text-xs font-extrabold text-slate-300">وصف المشكلة المصرح بها:</span>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Digital Signatures and Stamps attached to this ticket */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              التوقيعات والأختام الرقمية المرفقة رسمياً بالتذكرة:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Employee Signature & Stamp */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-3">
                <div className="flex items-center justify-between border-b border-navy-850 pb-2">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5" />
                    توقيع وختم صاحب الطلب
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">معتمد إلكترونياً</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Signature */}
                  <div className="h-20 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-300 shadow-inner">
                    {ticket.employeeSignature || ticket.employee?.signature ? (
                      <img
                        src={ticket.employeeSignature || ticket.employee?.signature}
                        alt="Employee Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center">إمضاء يدوي عند الاستلام</span>
                    )}
                  </div>

                  {/* Stamp */}
                  <div className="h-20 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-300 shadow-inner">
                    {ticket.employeeStamp || ticket.employee?.stamp ? (
                      <img
                        src={ticket.employeeStamp || ticket.employee?.stamp}
                        alt="Employee Stamp"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center">ختم المصلحة</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Technician Signature & Stamp */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-3">
                <div className="flex items-center justify-between border-b border-navy-850 pb-2">
                  <span className="text-xs font-bold text-teal-400 flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5" />
                    توقيع وختم مصلحة الدعم IT
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {ticket.technician ? ticket.technician.name : 'قيد التعيين'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Signature */}
                  <div className="h-20 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-300 shadow-inner">
                    {ticket.technicianSignature || ticket.technician?.signature ? (
                      <img
                        src={ticket.technicianSignature || ticket.technician?.signature}
                        alt="Technician Signature"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center">توقيع التقني</span>
                    )}
                  </div>

                  {/* Stamp */}
                  <div className="h-20 bg-white rounded-xl p-1.5 flex items-center justify-center border border-slate-300 shadow-inner">
                    {ticket.technicianStamp || ticket.technician?.stamp ? (
                      <img
                        src={ticket.technicianStamp || ticket.technician?.stamp}
                        alt="Technician Stamp"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 text-center">ختم مصلحة الإعلام الآلي</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intervention Report details if resolved */}
          {ticket.report && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  محضر التدخل المنجز ({ticket.report.reportNumber})
                </span>
                <a
                  href={`/api/tickets/${ticket.id}/pdf?type=report`}
                  download
                  className="text-xs font-bold text-emerald-300 hover:text-white underline flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  تحميل تقرير التدخل الرسمي
                </a>
              </div>
              <p className="text-xs text-slate-300"><strong>التشخيص:</strong> {ticket.report.diagnosis}</p>
              <p className="text-xs text-slate-300"><strong>الإجراءات المتخذة:</strong> {ticket.report.actionsTaken}</p>
              {ticket.report.partsReplaced && (
                <p className="text-xs text-slate-300"><strong>قطع الغيار المستبدلة:</strong> {ticket.report.partsReplaced}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
