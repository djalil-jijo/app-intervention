'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getTemplatesAction,
  createTemplateAction,
  deleteTemplateAction,
} from '@/app/actions/templates';
import {
  FileCode,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Laptop,
  CheckCircle,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { PriorityBadge } from '@/components/admin/PriorityBadge';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Matériel informatique',
    equipment: '',
    description: '',
    priority: 'MEDIUM',
    solution: '',
  });

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTemplatesAction();
      if (res.success && res.data) setTemplates(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createTemplateAction(formData as any);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          name: '',
          category: 'Matériel informatique',
          equipment: '',
          description: '',
          priority: 'MEDIUM',
          solution: '',
        });
        fetchTemplates();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
      await deleteTemplateAction(id);
      fetchTemplates();
    }
  };

  const handleCopy = (t: any) => {
    navigator.clipboard.writeText(`${t.equipment}\n${t.description}`);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-6 rounded-3xl border border-navy-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">قوالب التدخلات والمشاكل الشائعة</h1>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                Pre-defined Intervention Templates & Rapid Dispatch
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mr-12">
            نماذج جاهزة للمشاكل المتكررة (مثل مشاكل الطباعة، تعطل الشبكة، الفيروسات) لتسريع تسجيل الطلبات وتشخيصها.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قالب جديد</span>
          </button>

          <button
            onClick={fetchTemplates}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 text-xs">جاري تحميل القوالب...</div>
      ) : templates.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-3 bg-navy-900/40 rounded-3xl border border-navy-800/60 p-8">
          <FileCode className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="font-bold">لا توجد قوالب تدخل مسجلة حالياً.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold hover:bg-amber-500/30 transition-all"
          >
            إنشاء أول قالب تدخل
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-navy-750 transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-navy-800 text-slate-400">
                    {tpl.category}
                  </span>
                  <PriorityBadge priority={tpl.priority} />
                </div>

                <h3 className="text-sm font-black text-white">{tpl.name}</h3>
                <p className="text-xs font-bold text-sky-400 mt-1 flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" />
                  {tpl.equipment}
                </p>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 bg-navy-950/60 p-2.5 rounded-xl border border-navy-850">
                  {tpl.description}
                </p>

                {tpl.solution && (
                  <div className="mt-3 text-xs bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-emerald-300">
                    <p className="font-bold mb-0.5">الحل المقترح:</p>
                    <p className="text-[11px] text-emerald-400 line-clamp-2">{tpl.solution}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between">
                <button
                  onClick={() => handleCopy(tpl)}
                  className="px-3 py-1.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  {copiedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>نسخ النص</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleDelete(tpl.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  title="حذف القالب"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-right">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                إضافة قالب تدخل جديد
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1 text-slate-400">اسم القالب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تعطل طابعة شبكية / عدم سحب الورق"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="Matériel informatique">عتاد وحواسيب</option>
                    <option value="Imprimantes & Copieurs">طابعات وناسخات</option>
                    <option value="Réseau & Câblage">شبكات وربط</option>
                    <option value="Logiciels & Systèmes">برمجيات وأنظمة</option>
                    <option value="Messagerie & Internet">بريد وإنترنت</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">الأولوية الافتراضية</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-amber-500 outline-none"
                  >
                    <option value="LOW">منخفضة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="URGENT">مستعجلة</option>
                    <option value="CRITICAL">حرجة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">العتاد / التجهيز *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: Imprimante HP LaserJet Pro MFP"
                  value={formData.equipment}
                  onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-amber-500 outline-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">وصف المشكلة النمطي *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="تفاصيل العطب والأعراض المتكررة..."
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-amber-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">الحل أو التوصية المقترحة (اختياري)</label>
                <textarea
                  rows={2}
                  value={formData.solution}
                  onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                  placeholder="خطوات حل سريعة للتقني..."
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-amber-500 outline-none resize-none"
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
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold shadow-lg shadow-amber-500/20 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ القالب'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
