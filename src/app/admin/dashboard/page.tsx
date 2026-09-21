'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTicketsAction } from '@/app/actions/tickets';
import { getDashboardStatsAction } from '@/app/actions/stats';
import { seedErpDemoDataAction } from '@/app/actions/seed';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PriorityBadge } from '@/components/admin/PriorityBadge';
import { SiteBadge } from '@/components/admin/SiteBadge';
import { ReportFormModal } from '@/components/admin/ReportFormModal';
import { TicketsBarChart } from '@/components/admin/charts/TicketsBarChart';
import { StatusDonutChart } from '@/components/admin/charts/StatusDonutChart';
import { TechnicianPerformanceChart } from '@/components/admin/charts/TechnicianPerformanceChart';
import {
  LayoutDashboard,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Boxes,
  Users,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Building2,
  MapPin,
  Factory,
  ShieldCheck,
  Check,
  AlertCircle,
  FileText,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, statsRes] = await Promise.all([
        getTicketsAction(),
        getDashboardStatsAction(),
      ]);

      if (ticketsRes.success && ticketsRes.data) {
        setTickets(ticketsRes.data);
      }
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Error loading ERP dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleSeed = async () => {
    setSeeding(true);
    await seedErpDemoDataAction();
    setSeeding(false);
    loadDashboardData();
  };

  const totalTickets = tickets.length;
  const pendingTickets = tickets.filter((t) => t.status === 'PENDING').length;
  const inProgressTickets = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const resolutionRate = stats?.resolutionRate ?? (totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0);

  const filialeCount = stats?.byUnitType?.FILIALE ?? tickets.filter((t) => t.unitType === 'FILIALE').length;
  const cicCount = stats?.byUnitType?.CIC ?? tickets.filter((t) => t.unitType === 'CIC').length;
  const upcCount = stats?.byUnitType?.UPC ?? tickets.filter((t) => t.unitType === 'UPC').length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-6 rounded-3xl border border-navy-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">نظام ERP مصلحة الإعلام الآلي</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                IT Operations & Interventions Executive Console
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mr-12">
            متابعة شاملة للتدخلات، جرد العتاد المعلوماتي، ومخزون قطع الغيار عبر المديريات الجهوية (Filiales)، الولائية (CIC)، والوحدات (UPC).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 hover:opacity-90 transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'جاري التحميل...' : 'تحميل بيانات توضيحية ERP'}</span>
          </button>

          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all disabled:opacity-50"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Critical & Stock Alerts */}
      {stats?.stockStats?.lowStock > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-amber-200">
                تنبيه مخزون: {stats.stockStats.lowStock} قطع غيار/مستهلكات تحت الحد الأدنى!
              </p>
              <p className="text-xs text-amber-300/80 font-medium">
                تأكد من إعادة التموين لتفادي تعطيل التدخلات التقنية القادمة.
              </p>
            </div>
          </div>
          <Link
            href="/admin/stock"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all whitespace-nowrap"
          >
            إدارة المخزون &larr;
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Interventions */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">إجمالي طلبات التدخل</p>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-3">{totalTickets}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] font-bold text-amber-400">{pendingTickets} قيد الانتظار</span>
            <span className="text-slate-600">•</span>
            <span className="text-[11px] font-bold text-sky-400">{inProgressTickets} قيد المعالجة</span>
          </div>
        </div>

        {/* Resolution Rate */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">نسبة نجاح الصيانة</p>
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-emerald-400 mt-3">{resolutionRate}%</h3>
          <p className="text-[11px] font-medium text-slate-400 mt-2">
            {resolvedTickets} تدخل مكتمل بمحضر تقني (متوسط {stats?.avgResolutionHours || 2} س)
          </p>
        </div>

        {/* IT Assets */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">العتاد المعلوماتي المسجل</p>
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Laptop className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-3">{stats?.assetStats?.total ?? 0}</h3>
          <p className="text-[11px] font-bold text-rose-400 mt-2">
            {stats?.assetStats?.defective ?? 0} عتاد متعطل/تحت الصيانة
          </p>
        </div>

        {/* Technicians */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">فريق الإعلام الآلي</p>
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-3">{stats?.totalTechnicians ?? 0}</h3>
          <p className="text-[11px] font-medium text-purple-300 mt-2">تقنيون ونشاط عام على النظام</p>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-indigo-400" />
              <h3 className="text-sm font-black text-white">تطور طلبات التدخل خلال الـ 6 أشهر الأخيرة</h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-navy-800 px-2.5 py-1 rounded-lg">
              شهري
            </span>
          </div>
          <TicketsBarChart data={stats?.monthlyTrend || []} />
        </div>

        {/* Status Donut Chart */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">توزيع الحالات الحالية</h3>
          </div>
          <StatusDonutChart data={stats?.byStatus || { PENDING: 0, IN_PROGRESS: 0, RESOLVED: 0, CLOSED: 0 }} />
        </div>
      </div>

      {/* Performance & Upcoming Maintenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Technician Performance Chart */}
        <div className="lg:col-span-2 bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-sky-400" />
              <h3 className="text-sm font-black text-white">إنتاجية وتقييم أداء التقنيين</h3>
            </div>
            <Link href="/admin/technicians" className="text-xs font-bold text-sky-400 hover:underline">
              تفاصيل الفريق &larr;
            </Link>
          </div>
          <TechnicianPerformanceChart data={stats?.technicianStats || []} />
        </div>

        {/* Upcoming Maintenance List */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-amber-400" />
                <h3 className="text-sm font-black text-white">الصيانة الوقائية القادمة</h3>
              </div>
              <Link href="/admin/maintenance" className="text-xs font-bold text-amber-400 hover:underline">
                الجدول الكامل
              </Link>
            </div>

            {(!stats?.upcomingMaintenance || stats.upcomingMaintenance.length === 0) ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                لا توجد مواعيد صيانة مجدولة للأيام القادمة.
              </div>
            ) : (
              <div className="space-y-2.5">
                {stats.upcomingMaintenance.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-navy-850/80 border border-navy-750 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{item.title}</span>
                      <span className="text-[10px] text-sky-400 font-mono">
                        {new Date(item.scheduledDate).toLocaleDateString('ar-DZ')}
                      </span>
                    </div>
                    {item.technician && (
                      <p className="text-[11px] text-purple-300">التقني: {item.technician.name}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/admin/maintenance"
            className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-200 text-xs font-bold text-center block transition-all mt-3"
          >
            + برمجة صيانة دورية جديدة
          </Link>
        </div>
      </div>

      {/* Organization Scope Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-navy-900/70 border border-navy-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">المديريات الجهوية (Filiales)</p>
              <p className="text-xl font-black text-white">{filialeCount} تدخل</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
            FILIALES
          </span>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">المديريات الولائية (CIC)</p>
              <p className="text-xl font-black text-white">{cicCount} تدخل</p>
            </div>
          </div>
          <span className="text-xs font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-xl">
            CIC
          </span>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-3xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Factory className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">الوحدات الإنتاجية (UPC)</p>
              <p className="text-xl font-black text-white">{upcCount} تدخل</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
            UPC
          </span>
        </div>
      </div>

      {/* Recent Interventions Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-black text-white">أحدث طلبات التدخل التقنية</h2>
            <p className="text-xs text-slate-400">متابعة الفحص، التعيين، وتوثيق المحاضر</p>
          </div>
          <Link
            href="/admin/tickets"
            className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
          >
            <span>عرض كل التدخلات ({tickets.length})</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">جاري تحميل البيانات...</div>
        ) : tickets.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <p>لا توجد طلبات تدخل مسجلة حالياً.</p>
            <button
              onClick={handleSeed}
              className="px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold hover:bg-sky-500/30 transition-all"
            >
              انقر هنا لتوليد بيانات توضيحية ERP
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4 text-right">رقم التذكرة</th>
                  <th className="py-3 px-4 text-right">صاحب الطلب & المصلحة</th>
                  <th className="py-3 px-4 text-right">الموقع / الهيكل</th>
                  <th className="py-3 px-4 text-right">العتاد المشكو</th>
                  <th className="py-3 px-4 text-right">الأولولية</th>
                  <th className="py-3 px-4 text-right">التقني المكلف</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {tickets.slice(0, 8).map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-400 dir-ltr text-right">
                      {ticket.ticketNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{ticket.fullName}</p>
                      <p className="text-[11px] text-slate-400">{ticket.service}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <SiteBadge unitType={ticket.unitType} unitName={ticket.unitName} />
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-200">{ticket.equipment}</p>
                      {ticket.serialNumber && (
                        <p className="text-[10px] text-slate-500 font-mono">S/N: {ticket.serialNumber}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="py-3.5 px-4">
                      {ticket.technician ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold">
                          <Users className="w-3 h-3 text-purple-400" />
                          {ticket.technician.name}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium italic">غير معين</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="py-3.5 px-4 text-left">
                      {ticket.report ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          محضر محرر #{ticket.report.reportNumber}
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsReportModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 text-[11px] font-bold transition-all"
                        >
                          تحرير المحضر PDF
                        </button>
                      )}
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
          onSuccess={loadDashboardData}
        />
      )}
    </div>
  );
}
