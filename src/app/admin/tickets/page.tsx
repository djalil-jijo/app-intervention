'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Ticket,
  Search,
  Filter,
  RefreshCw,
  UserCheck,
  Wrench,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ChevronDown,
  Check,
  X,
  MessageSquare,
} from 'lucide-react';

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [unitTypeFilter, setUnitTypeFilter] = useState('ALL');

  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const [commentsTicket, setCommentsTicket] = useState<any | null>(null);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);

  const fetchTicketsAndTechs = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, techRes] = await Promise.all([
        getTicketsAction({
          search,
          status: statusFilter,
          priority: priorityFilter,
          unitType: unitTypeFilter,
        }),
        getTechniciansAction(),
      ]);
      if (tRes.success && tRes.data) setTickets(tRes.data);
      if (techRes.success && techRes.data) setTechnicians(techRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, unitTypeFilter]);

  useEffect(() => {
    fetchTicketsAndTechs();
  }, [fetchTicketsAndTechs]);

  const handleAssignTechnician = async (ticketId: string, techId: string) => {
    setAssigningTicketId(ticketId);
    await assignTechnicianToTicketAction(ticketId, techId === 'NONE' ? null : techId);
    setAssigningTicketId(null);
    fetchTicketsAndTechs();
  };

  const handleStatusChange = async (ticketId: string, newStatus: any) => {
    await updateTicketStatusAction(ticketId, newStatus);
    fetchTicketsAndTechs();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة تذاكر وتدخلات الصيانة</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                Intervention Tickets & Dispatching Management
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchTicketsAndTechs}
          disabled={loading}
          className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="بحث بالرقم، الاسم، الجهاز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pr-10 pl-4 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
            />
          </div>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PENDING">قيد الانتظار (En attente)</option>
            <option value="IN_PROGRESS">قيد المعالجة (En cours)</option>
            <option value="RESOLVED">تم الحل (Résolu)</option>
            <option value="CLOSED">مغلقة ومؤكدة (Clôturé)</option>
          </select>

          {/* Priority */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none"
          >
            <option value="ALL">جميع الأولويات</option>
            <option value="LOW">منخفضة</option>
            <option value="MEDIUM">متوسطة</option>
            <option value="URGENT">مستعجلة</option>
            <option value="CRITICAL">حرجة جداً</option>
          </select>

          {/* Unit Type */}
          <select
            value={unitTypeFilter}
            onChange={(e) => setUnitTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:border-sky-500 outline-none"
          >
            <option value="ALL">جميع الهياكل (Filiales / CIC / UPC)</option>
            <option value="FILIALE">المديريات الجهوية (Filiales)</option>
            <option value="CIC">المديريات الولائية (CIC)</option>
            <option value="UPC">الوحدات الإنتاجية (UPC)</option>
          </select>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs font-medium">
            جاري تحميل تذاكر التدخل...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            لا توجد تذاكر مطابقة لمعايير البحث.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4 text-right">رقم التذكرة</th>
                  <th className="py-3 px-4 text-right">صاحب الطلب & المصلحة</th>
                  <th className="py-3 px-4 text-right">الموقع</th>
                  <th className="py-3 px-4 text-right">العتاد & المشكلة</th>
                  <th className="py-3 px-4 text-right">الأولوية</th>
                  <th className="py-3 px-4 text-right">التقني المكلف</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-left">الإجراءات والمحضر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {tickets.map((t) => (
                  <tr key={t.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-sky-400 dir-ltr text-right">
                      {t.ticketNumber}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-white">{t.fullName}</p>
                      <p className="text-[11px] text-slate-400">{t.service}</p>
                      {t.phone && <p className="text-[10px] text-slate-500">الهاتف: {t.phone}</p>}
                    </td>
                    <td className="py-4 px-4">
                      <SiteBadge unitType={t.unitType} unitName={t.unitName} />
                    </td>
                    <td className="py-4 px-4 max-w-[200px]">
                      <p className="font-bold text-slate-200 truncate">{t.equipment}</p>
                      <p className="text-[11px] text-slate-400 truncate">{t.description}</p>
                    </td>
                    <td className="py-4 px-4">
                      <PriorityBadge priority={t.priority} />
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={t.technicianId || 'NONE'}
                        onChange={(e) => handleAssignTechnician(t.id, e.target.value)}
                        disabled={assigningTicketId === t.id}
                        className="bg-navy-950 border border-navy-750 rounded-xl px-2 py-1 text-[11px] text-purple-300 font-bold focus:outline-none focus:border-purple-500 max-w-[140px] truncate"
                      >
                        <option value="NONE">-- تعيين --</option>
                        {technicians.map((tech) => (
                          <option key={tech.id} value={tech.id}>
                            {tech.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        {/* Comments button */}
                        <button
                          onClick={() => {
                            setCommentsTicket(t);
                            setIsCommentsOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-400 hover:text-sky-300 transition-all"
                          title="سجل الملاحظات والتعليقات"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>

                        {/* Report / Action */}
                        {t.report ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            محضر #{t.report.reportNumber}
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTicket(t);
                              setIsReportModalOpen(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 text-xs font-bold transition-all shadow-sm"
                          >
                            تحرير المحضر PDF
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {selectedTicket && (
        <ReportFormModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setSelectedTicket(null);
          }}
          ticket={selectedTicket}
          onSuccess={fetchTicketsAndTechs}
        />
      )}

      {/* Internal Comments Panel */}
      {commentsTicket && (
        <TicketCommentsPanel
          isOpen={isCommentsOpen}
          onClose={() => {
            setIsCommentsOpen(false);
            setCommentsTicket(null);
          }}
          ticketId={commentsTicket.id}
          ticketNumber={commentsTicket.ticketNumber}
        />
      )}
    </div>
  );
}
