'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getMaintenanceSchedulesAction,
  createMaintenanceScheduleAction,
  updateMaintenanceStatusAction,
  deleteMaintenanceScheduleAction,
} from '@/app/actions/maintenance';
import { getAssetsAction } from '@/app/actions/assets';
import { getTechniciansAction } from '@/app/actions/technicians';
import {
  Wrench,
  Calendar,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Laptop,
  Users,
  ChevronDown,
  Trash2,
  X,
  Repeat,
} from 'lucide-react';
import { PriorityBadge } from '@/components/admin/PriorityBadge';

export default function MaintenancePage() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [techFilter, setTechFilter] = useState('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assetId: '',
    technicianId: '',
    scheduledDate: '',
    intervalDays: 0,
    priority: 'MEDIUM',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [schedRes, assetRes, techRes] = await Promise.all([
        getMaintenanceSchedulesAction({ status: statusFilter, technicianId: techFilter }),
        getAssetsAction(),
        getTechniciansAction(),
      ]);

      if (schedRes.success && schedRes.data) setSchedules(schedRes.data);
      if (assetRes.success && assetRes.data) setAssets(assetRes.data);
      if (techRes.success && techRes.data) setTechnicians(techRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, techFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.scheduledDate) return;
    setSubmitting(true);
    try {
      const res = await createMaintenanceScheduleAction({
        ...formData,
        intervalDays: formData.intervalDays > 0 ? formData.intervalDays : undefined,
        priority: formData.priority as any,
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          title: '',
          description: '',
          assetId: '',
          technicianId: '',
          scheduledDate: '',
          intervalDays: 0,
          priority: 'MEDIUM',
          notes: '',
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: any) => {
    await updateMaintenanceStatusAction(id, newStatus);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الجدولة؟')) {
      await deleteMaintenanceScheduleAction(id);
      fetchData();
    }
  };

  const statusMap: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    SCHEDULED: { label: 'مجدولة', bg: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-300', icon: Clock },
    IN_PROGRESS: { label: 'قيد التنفيذ', bg: 'bg-amber-500/10 border-amber-500/30', text: 'text-amber-300', icon: AlertTriangle },
    DONE: { label: 'مكتملة', bg: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-300', icon: CheckCircle2 },
    OVERDUE: { label: 'متأخرة', bg: 'bg-rose-500/10 border-rose-500/30', text: 'text-rose-300', icon: AlertTriangle },
    CANCELLED: { label: 'ملغاة', bg: 'bg-slate-500/10 border-slate-500/30', text: 'text-slate-400', icon: XCircle },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-6 rounded-3xl border border-navy-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">جدولة الصيانة الوقائية</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                Preventive Maintenance & Regular Servicing
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mr-12">
            برمجة الصيانة الدورية للعتاد، تجديد التراخيص، تنظيف السيرفرات ومراقبة الأجهزة الحساسة في جميع المواقع.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>برمجة صيانة جديدة</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-navy-900/40 p-3.5 rounded-2xl border border-navy-800/50">
        <span className="text-xs font-bold text-slate-400">تصفية حسب:</span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="SCHEDULED">مجدولة</option>
          <option value="IN_PROGRESS">قيد التنفيذ</option>
          <option value="DONE">مكتملة</option>
          <option value="OVERDUE">متأخرة</option>
        </select>

        <select
          value={techFilter}
          onChange={(e) => setTechFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200"
        >
          <option value="ALL">جميع التقنيين</option>
          {technicians.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Schedules List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">جاري تحميل جدول الصيانات...</div>
      ) : schedules.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-navy-900/40 rounded-3xl border border-navy-800/60 p-8 space-y-3">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold">لا توجد مهام صيانة وقائية مجدولة حالياً.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 text-xs font-bold hover:bg-sky-500/30 transition-all"
          >
            جدولة صيانة وقائية الآن
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map((item) => {
            const statusConfig = statusMap[item.status] || statusMap.SCHEDULED;
            const StatusIcon = statusConfig.icon;
            const isOverdue =
              new Date(item.scheduledDate) < new Date() &&
              item.status !== 'DONE' &&
              item.status !== 'CANCELLED';

            return (
              <div
                key={item.id}
                className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg relative flex flex-col justify-between space-y-4 hover:border-navy-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${
                        isOverdue
                          ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          : `${statusConfig.bg} ${statusConfig.text}`
                      }`}
                    >
                      <StatusIcon className="w-3 h-3" />
                      {isOverdue ? 'متأخرة عن الموعد' : statusConfig.label}
                    </span>
                    <PriorityBadge priority={item.priority} />
                  </div>

                  <h3 className="text-sm font-black text-white leading-snug">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <div className="mt-4 space-y-2 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-sky-400">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-bold">
                        {new Date(item.scheduledDate).toLocaleDateString('ar-DZ', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    {item.asset && (
                      <div className="flex items-center gap-2 text-indigo-300">
                        <Laptop className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium truncate">
                          {item.asset.name} ({item.asset.assetTag})
                        </span>
                      </div>
                    )}

                    {item.technician && (
                      <div className="flex items-center gap-2 text-purple-300">
                        <Users className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">{item.technician.name}</span>
                      </div>
                    )}

                    {item.intervalDays && (
                      <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
                        <Repeat className="w-3 h-3 shrink-0" />
                        <span>تتكرر تلقائياً كل {item.intervalDays} يوم</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-navy-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {item.status !== 'DONE' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'DONE')}
                        className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-[11px] font-bold transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم الإنجاز</span>
                      </button>
                    )}
                    {item.status === 'SCHEDULED' && (
                      <button
                        onClick={() => handleStatusChange(item.id, 'IN_PROGRESS')}
                        className="px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition-all"
                      >
                        بدء العمل
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="حذف الجدولة"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-sky-400" />
                برمجة صيانة وقائية جديدة
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1 text-slate-400">عنوان مهمة الصيانة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تنظيف وفحص سيرفر الملفات الرئيسي"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">تاريخ وتوقيت الصيانة *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-sky-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">الأولوية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="LOW">منخفضة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="URGENT">مستعجلة</option>
                    <option value="CRITICAL">حرجة</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">العتاد المعني (اختياري)</label>
                  <select
                    value={formData.assetId}
                    onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="">-- بدون تحديد عتاد --</option>
                    {assets.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.assetTag})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">التقني المسؤول (اختياري)</label>
                  <select
                    value={formData.technicianId}
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-sky-500 outline-none"
                  >
                    <option value="">-- بدون تحديد تقني --</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">التكرار التلقائي (بالأيام)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 = صيانة لمرة واحدة فقط (مثال: 30 كل شهر، 90 كل 3 أشهر)"
                  value={formData.intervalDays}
                  onChange={(e) => setFormData({ ...formData, intervalDays: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-sky-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">تفاصيل إضافية أو تعليمات</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="خطوات الفحص، النسخ الاحتياطي، المراجعة..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold shadow-lg shadow-sky-500/20 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'تأكيد وبرمجة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
