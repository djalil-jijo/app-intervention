'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  getTicketsAction,
  updateTicketStatusAction,
  assignTechnicianToTicketAction,
} from '@/app/actions/tickets';
import { getTechniciansAction } from '@/app/actions/technicians';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PriorityBadge } from '@/components/admin/PriorityBadge';
import { SiteBadge } from '@/components/admin/SiteBadge';
import { ReportFormModal } from '@/components/admin/ReportFormModal';
import { TicketCommentsPanel } from '@/components/admin/TicketCommentsPanel';
import {
  Ticket, Search, RefreshCw, FileText, CheckCircle2, Clock,
  Plus, Check, MessageSquare, ChevronLeft, ChevronRight,
  Eye, AlertTriangle, Filter, SlidersHorizontal,
} from 'lucide-react';

const PAGE_SIZE = 20;

export default function AdminTicketsPage() {
  const [tickets,       setTickets]       = useState<any[]>([]);
  const [technicians,   setTechnicians]   = useState<any[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [statusFilter,  setStatusFilter]  = useState('ALL');
  const [priorityFilter,setPriorityFilter]= useState('ALL');
  const [unitTypeFilter,setUnitTypeFilter]= useState('ALL');
  const [techFilter,    setTechFilter]    = useState('ALL');
  const [currentPage,   setCurrentPage]   = useState(1);

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [commentsTicket, setCommentsTicket] = useState<any | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, techRes] = await Promise.all([
        getTicketsAction({ search, status: statusFilter, priority: priorityFilter, unitType: unitTypeFilter, technicianId: techFilter }),
        getTechniciansAction(),
      ]);
      if (tRes.success && tRes.data) { setTickets(tRes.data); setCurrentPage(1); }
      if (techRes.success && techRes.data) setTechnicians(techRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, unitTypeFilter, techFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAssign = async (ticketId: string, techId: string) => {
    setAssigningTicketId(ticketId);
    await assignTechnicianToTicketAction(ticketId, techId === 'NONE' ? null : techId);
    setAssigningTicketId(null);
    fetchAll();
  };

  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    await updateTicketStatusAction(ticketId, newStatus);
    fetchAll();
  };

  // Counts for filter pills
  const counts = useMemo(() => ({
    pending:    tickets.filter((t) => t.status === 'PENDING').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    critical:   tickets.filter((t) => t.priority === 'CRITICAL').length,
    unassigned: tickets.filter((t) => !t.technicianId && t.status === 'PENDING').length,
  }), [tickets]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
  const pageTickets = tickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const resetFilters = () => {
    setSearch(''); setStatusFilter('ALL'); setPriorityFilter('ALL'); setUnitTypeFilter('ALL'); setTechFilter('ALL');
  };
  const hasFilters = search || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || unitTypeFilter !== 'ALL' || techFilter !== 'ALL';

  return (
    <div className="space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة تذاكر التدخلات</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                Intervention Tickets · {tickets.length} تذكرة
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/request"
            target="_blank"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-all"
          >
            <Plus className="w-4 h-4" />
            طلب جديد
          </Link>
          <button
            onClick={fetchAll}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Pills */}
      <div className="flex flex-wrap gap-2">
        {counts.critical > 0 && (
          <button
            onClick={() => setPriorityFilter('CRITICAL')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold hover:bg-rose-500/25 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {counts.critical} حرجة
          </button>
        )}
        {counts.pending > 0 && (
          <button
            onClick={() => setStatusFilter('PENDING')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            {counts.pending} قيد الانتظار
          </button>
        )}
        {counts.inProgress > 0 && (
          <button
            onClick={() => setStatusFilter('IN_PROGRESS')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 text-xs font-bold hover:bg-sky-500/25 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {counts.inProgress} قيد المعالجة
          </button>
        )}
        {counts.unassigned > 0 && (
          <button
            onClick={() => { setStatusFilter('PENDING'); setTechFilter('ALL'); }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-500/25 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {counts.unassigned} بدون تقني
          </button>
        )}
        {hasFilters && (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-400 hover:text-white text-xs font-bold transition-all"
          >
            ✕ إلغاء الفلاتر
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث برقم التذكرة، الاسم، الجهاز، الوصف..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none transition-all"
            />
          </div>

          {/* Status */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none">
            <option value="ALL">جميع الحالات</option>
            <option value="PENDING">قيد الانتظار</option>
            <option value="IN_PROGRESS">قيد المعالجة</option>
            <option value="RESOLVED">تم الحل</option>
            <option value="CLOSED">مغلقة</option>
          </select>

          {/* Priority */}
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none">
            <option value="ALL">جميع الأولويات</option>
            <option value="LOW">منخفضة</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="URGENT">عاجلة</option>
            <option value="CRITICAL">حرجة</option>
          </select>

          {/* Unit Type */}
          <select value={unitTypeFilter} onChange={(e) => setUnitTypeFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none">
            <option value="ALL">جميع الهياكل</option>
            <option value="FILIALE">المديريات الجهوية</option>
            <option value="CIC">المديريات الولائية</option>
            <option value="UPC">الوحدات الإنتاجية</option>
          </select>
        </div>

        {/* Tech filter row */}
        {technicians.length > 0 && (
          <div className="mt-3 pt-3 border-t border-navy-800">
            <select value={techFilter} onChange={(e) => setTechFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-purple-300 focus:border-purple-500 outline-none w-full sm:w-auto">
              <option value="ALL">جميع التقنيين</option>
              {technicians.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            جاري تحميل تذاكر التدخل...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <Ticket className="w-8 h-8 mx-auto text-slate-700" />
            <p>لا توجد تذاكر مطابقة.</p>
            {hasFilters && (
              <button onClick={resetFilters} className="text-sky-400 hover:underline font-bold">إلغاء الفلاتر</button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-3 text-right">رقم التذكرة</th>
                    <th className="py-3 px-3 text-right">صاحب الطلب</th>
                    <th className="py-3 px-3 text-right">الموقع</th>
                    <th className="py-3 px-3 text-right">العتاد</th>
                    <th className="py-3 px-3 text-right">الأولوية</th>
                    <th className="py-3 px-3 text-right">التقني</th>
                    <th className="py-3 px-3 text-right">الحالة</th>
                    <th className="py-3 px-3 text-left">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                  {pageTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-navy-850/60 transition-colors group">
                      <td className="py-3.5 px-3 font-mono font-bold text-sky-400">
                        <Link href={`/admin/tickets/${t.id}`} className="hover:text-sky-300 hover:underline transition-colors">
                          {t.ticketNumber}
                        </Link>
                        {/* Age indicator */}
                        {(() => {
                          const hours = Math.floor((Date.now() - new Date(t.createdAt).getTime()) / 3600000);
                          if (hours > 48 && (t.status === 'PENDING' || t.status === 'IN_PROGRESS')) {
                            return <span className="block text-[9px] text-rose-400 font-bold mt-0.5">⚠ {Math.floor(hours/24)}ي</span>;
                          }
                          return null;
                        })()}
                      </td>
                      <td className="py-3.5 px-3">
                        <p className="font-bold text-white">{t.fullName}</p>
                        <p className="text-[11px] text-slate-400">{t.service}</p>
                        {t.phone && <p className="text-[10px] text-slate-500">{t.phone}</p>}
                      </td>
                      <td className="py-3.5 px-3">
                        <SiteBadge unitType={t.unitType} unitName={t.unitName} />
                      </td>
                      <td className="py-3.5 px-3 max-w-[180px]">
                        <p className="font-bold text-slate-200 truncate">{t.equipment}</p>
                        <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
                      </td>
                      <td className="py-3.5 px-3">
                        <PriorityBadge priority={t.priority} />
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={t.technicianId || 'NONE'}
                          onChange={(e) => handleAssign(t.id, e.target.value)}
                          disabled={assigningTicketId === t.id}
                          className="bg-navy-950 border border-navy-750 rounded-xl px-2 py-1 text-[11px] text-purple-300 font-bold focus:outline-none focus:border-purple-500 max-w-[130px] truncate disabled:opacity-50"
                        >
                          <option value="NONE">-- تعيين --</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.id}>{tech.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-3 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Details */}
                          <Link
                            href={`/admin/tickets/${t.id}`}
                            className="p-1.5 rounded-xl bg-navy-850 hover:bg-indigo-500/15 border border-navy-750 hover:border-indigo-500/30 text-slate-400 hover:text-indigo-300 transition-all"
                            title="عرض التفاصيل الكاملة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {/* Comments */}
                          <button
                            onClick={() => { setCommentsTicket(t); setIsCommentsOpen(true); }}
                            className="p-1.5 rounded-xl bg-navy-850 hover:bg-sky-500/10 border border-navy-750 hover:border-sky-500/30 text-slate-400 hover:text-sky-300 transition-all"
                            title="التعليقات"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>

                          {/* Report */}
                          {t.report ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                              <Check className="w-3.5 h-3.5" />
                              #{t.report.reportNumber}
                            </span>
                          ) : (
                            <button
                              onClick={() => { setSelectedTicket(t); setIsReportModalOpen(true); }}
                              className="px-2.5 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 hover:bg-sky-500/25 text-[11px] font-bold transition-all"
                            >
                              محضر PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 pt-4 border-t border-navy-800">
                <p className="text-xs text-slate-500 font-medium">
                  عرض {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, tickets.length)} من {tickets.length} تذكرة
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${
                          currentPage === page
                            ? 'bg-sky-500/25 border border-sky-500/50 text-sky-300'
                            : 'bg-navy-850 border border-navy-750 text-slate-400 hover:text-white hover:border-navy-700'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-slate-600 text-xs">...</span>}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Report Modal */}
      {selectedTicket && (
        <ReportFormModal
          isOpen={isReportModalOpen}
          onClose={() => { setIsReportModalOpen(false); setSelectedTicket(null); }}
          ticket={selectedTicket}
          onSuccess={fetchAll}
        />
      )}

      {/* Comments Panel */}
      {commentsTicket && (
        <TicketCommentsPanel
          isOpen={isCommentsOpen}
          onClose={() => { setIsCommentsOpen(false); setCommentsTicket(null); }}
          ticketId={commentsTicket.id}
          ticketNumber={commentsTicket.ticketNumber}
        />
      )}
    </div>
  );
}
