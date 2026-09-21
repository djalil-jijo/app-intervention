'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getArticlesAction, createArticleAction, incrementArticleViewsAction } from '@/app/actions/knowledge';
import { BookOpen, Search, Plus, RefreshCw, Eye, Tag, User, CheckCircle, FileText, X } from 'lucide-react';

export default function AdminKnowledgePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);

  const [form, setForm] = useState({
    title: '',
    category: 'Imprimante',
    problem: '',
    solution: '',
    tags: '',
    author: 'Karim Benali',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getArticlesAction({ search, category: categoryFilter });
      if (res.success && res.data) setArticles(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createArticleAction(form);
      if (res.success) {
        setIsAddModalOpen(false);
        setForm({ title: '', category: 'Imprimante', problem: '', solution: '', tags: '', author: 'Karim Benali' });
        fetchArticles();
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenArticle = async (article: any) => {
    setSelectedArticle(article);
    await incrementArticleViewsAction(article.id);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">قاعدة المعارف والحلول التقنية (Knowledge Base)</h1>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">IT Knowledge Base & Troubleshooting Guides</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>توثيق حل تقني جديد</span>
          </button>
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالخلل، الكلمات المفتاحية، أو نوع الجهاز..."
            className="w-full bg-navy-950 border border-navy-750 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">جميع التخصصات</option>
          <option value="Imprimante">طابعات ومحابر (Imprimante)</option>
          <option value="Réseau">شبكات وتوصيلات (Réseau)</option>
          <option value="Hardware">عتاد وتخزين (Hardware)</option>
          <option value="Système">أنظمة تشغيل (Système)</option>
        </select>
      </div>

      {/* Articles Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">جاري تحميل الحلول التقنية...</div>
      ) : articles.length === 0 ? (
        <div className="py-12 text-center text-slate-500">لا توجد مقالات تقنية مطابقة.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <div
              key={art.id}
              onClick={() => handleOpenArticle(art)}
              className="bg-navy-900/80 border border-navy-800 hover:border-emerald-500/40 rounded-3xl p-5 shadow-xl space-y-3 cursor-pointer transition-all hover:-translate-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  {art.category}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  {art.views} مشاهدة
                </span>
              </div>

              <h3 className="font-extrabold text-white text-sm group-hover:text-emerald-300 transition-colors line-clamp-2">
                {art.title}
              </h3>

              <p className="text-slate-400 text-xs line-clamp-3">
                {art.problem}
              </p>

              <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  {art.author}
                </span>
                <span className="text-emerald-400 font-bold">قراءة الحل &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Article Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-lg font-black text-white">توثيق حل تقني جديد بقاعدة المعارف</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">عنوان الحل / العطل *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. حل مشكلة توقف Spooler الطابعة"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">التصنيف</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Imprimante">Imprimante</option>
                  <option value="Réseau">Réseau</option>
                  <option value="Hardware">Hardware</option>
                  <option value="Système">Système</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">وصف العطل / المشكلة المشهودة *</label>
                <textarea
                  required
                  rows={3}
                  value={form.problem}
                  onChange={(e) => setForm({ ...form, problem: e.target.value })}
                  placeholder="وصف الأعراض ومؤشرات الخلل..."
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">خطوات الحل المعيارية *</label>
                <textarea
                  required
                  rows={4}
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  placeholder="1. الخطوة الأولى&#10;2. الخطوة الثانية..."
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl p-3 text-white focus:outline-none focus:border-emerald-500 resize-none font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الكلمات المفتاحية (Tags)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="spooler, printer, windows, canon"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-bold hover:bg-navy-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الحل التقني'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Article Detail View Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <span className="text-xs font-bold text-emerald-400">{selectedArticle.category}</span>
                <h3 className="text-lg font-black text-white">{selectedArticle.title}</h3>
              </div>
              <button onClick={() => setSelectedArticle(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 space-y-1">
                <h4 className="font-extrabold text-rose-300 text-sm">توصيف الخلل والمشكلة:</h4>
                <p className="text-slate-300 whitespace-pre-line leading-relaxed">{selectedArticle.problem}</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 space-y-1">
                <h4 className="font-extrabold text-emerald-300 text-sm">خطوات الحل المعيارية:</h4>
                <p className="text-slate-200 font-mono whitespace-pre-line leading-relaxed">{selectedArticle.solution}</p>
              </div>

              {selectedArticle.tags && (
                <div className="flex items-center gap-2 pt-2 text-slate-400">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px]">{selectedArticle.tags}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
