'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getSparePartsAction, createSparePartAction, recordStockMovementAction, deleteSparePartAction } from '@/app/actions/stock';
import {
  Boxes, Search, Plus, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownLeft,
  DollarSign, PackageCheck, Layers, X, Trash2, CheckCircle
} from 'lucide-react';

export default function AdminStockPage() {
  const [parts, setParts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<any | null>(null);

  // Add Part Form State
  const [partForm, setPartForm] = useState({
    name: '',
    partNumber: '',
    category: 'Consommables',
    quantity: 10,
    minThreshold: 5,
    unitPrice: 0,
    location: '',
  });

  // Stock Movement Form State
  const [movementForm, setMovementForm] = useState({
    movementType: 'IN' as 'IN' | 'OUT',
    quantity: 1,
    reason: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const fetchStock = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSparePartsAction({ search, category: categoryFilter, lowStockOnly });
      if (res.success && res.data) setParts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, lowStockOnly]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  const handleCreatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createSparePartAction(partForm);
      if (res.success) {
        setIsAddModalOpen(false);
        setPartForm({ name: '', partNumber: '', category: 'Consommables', quantity: 10, minThreshold: 5, unitPrice: 0, location: '' });
        fetchStock();
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    setSubmitting(true);
    try {
      const res = await recordStockMovementAction({
        sparePartId: selectedPart.id,
        movementType: movementForm.movementType,
        quantity: Number(movementForm.quantity),
        reason: movementForm.reason,
      });
      if (res.success) {
        setIsMovementModalOpen(false);
        setSelectedPart(null);
        setMovementForm({ movementType: 'IN', quantity: 1, reason: '' });
        fetchStock();
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePart = async (id: string) => {
    if (confirm('Supprimer cet article du stock ?')) {
      await deleteSparePartAction(id);
      fetchStock();
    }
  };

  const totalValue = parts.reduce((acc, p) => acc + (p.quantity * p.unitPrice), 0);
  const lowStockCount = parts.filter(p => p.quantity <= p.minThreshold).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Boxes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة مخزون قطع الغيار والمستهلكات</h1>
              <p className="text-xs text-amber-400 font-bold uppercase tracking-wider">Spare Parts & Inventory Stock Control ERP</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة قطة/مستهلك جديد</span>
          </button>
          <button
            onClick={fetchStock}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">إجمالي الأصناف بالمخزون</p>
            <h3 className="text-2xl font-black text-white mt-1">{parts.length} صنف</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <PackageCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">التنبيهات (قريب من النفاذ)</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">{lowStockCount} أجزاء</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">القيمة الإجمالية التقديرية للمخزون</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">{totalValue.toLocaleString('fr-FR')} د.ج</h3>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم قطعة الغيار، الحبر، الكابل..."
            className="w-full bg-navy-950 border border-navy-750 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
        >
          <option value="ALL">جميع التخصصات/الفئات</option>
          <option value="Stockage">تخزين (Disques SSD/HDD)</option>
          <option value="Mémoire">ذاكرة (RAM)</option>
          <option value="Toners">أحبار طابعات (Toners/Cartouches)</option>
          <option value="Câblage">شبكات وكوابل (Câbles RJ45/Power)</option>
          <option value="Composants">قطع مكونات (Alimentation, Cartes)</option>
        </select>

        <label className="flex items-center gap-2 px-3 py-2 bg-navy-950 border border-navy-750 rounded-xl text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="rounded border-navy-700 text-amber-500 focus:ring-0"
          />
          <span className="font-bold text-amber-400">عرض المواد القريبة من النفاذ فقط</span>
        </label>
      </div>

      {/* Stock Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">جاري تحميل المخزون...</div>
        ) : parts.length === 0 ? (
          <div className="py-12 text-center text-slate-500">لا توجد قطع غيار مطابقة للبحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 text-right">اسم المادة / القطعة</th>
                  <th className="py-3.5 px-4 text-right">الفئة والتصنيف</th>
                  <th className="py-3.5 px-4 text-right">موقع التخزين</th>
                  <th className="py-3.5 px-4 text-right">الكمية بالمخزون</th>
                  <th className="py-3.5 px-4 text-right">الحد الأدنى</th>
                  <th className="py-3.5 px-4 text-right">سعر الوحدة</th>
                  <th className="py-3.5 px-4 text-left">حركة المخزون</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {parts.map((part) => {
                  const isLow = part.quantity <= part.minThreshold;
                  return (
                    <tr key={part.id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="py-4 px-4">
                        <p className="font-bold text-white text-sm">{part.name}</p>
                        {part.partNumber && <p className="text-[10px] text-slate-500 font-mono">P/N: {part.partNumber}</p>}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-xl bg-navy-800 border border-navy-750 text-slate-300 text-[11px] font-bold">
                          {part.category}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {part.location || 'غير محدد'}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black ${
                          isLow ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                        }`}>
                          {part.quantity} قطعة
                          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-bold">
                        {part.minThreshold}
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-slate-200">
                        {part.unitPrice ? `${part.unitPrice.toLocaleString('fr-FR')} د.ج` : '—'}
                      </td>
                      <td className="py-4 px-4 text-left">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPart(part);
                              setIsMovementModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-[11px] font-bold transition-all"
                          >
                            تعديل المخزون (إدخال/إخراج)
                          </button>
                          <button
                            onClick={() => handleDeletePart(part.id)}
                            className="p-1.5 rounded-lg bg-navy-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Part Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-lg font-black text-white">إضافة قطعة غيار أو مستهلك جديد</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePart} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">اسم المادة / قطعة الغيار *</label>
                <input
                  type="text"
                  required
                  value={partForm.name}
                  onChange={(e) => setPartForm({ ...partForm, name: e.target.value })}
                  placeholder="e.g. Disque SSD 512GB Kingston"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">رمز القطعة (Part Number)</label>
                  <input
                    type="text"
                    value={partForm.partNumber}
                    onChange={(e) => setPartForm({ ...partForm, partNumber: e.target.value })}
                    placeholder="P/N..."
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">الفئة</label>
                  <select
                    value={partForm.category}
                    onChange={(e) => setPartForm({ ...partForm, category: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Stockage">Stockage</option>
                    <option value="Mémoire">Mémoire RAM</option>
                    <option value="Toners">Toners & Imp</option>
                    <option value="Câblage">Câblage</option>
                    <option value="Composants">Composants ATX</option>
                    <option value="Consommables">Consommables</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">الكمية الابتدائية</label>
                  <input
                    type="number"
                    min="0"
                    value={partForm.quantity}
                    onChange={(e) => setPartForm({ ...partForm, quantity: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">حد التنبيه</label>
                  <input
                    type="number"
                    min="1"
                    value={partForm.minThreshold}
                    onChange={(e) => setPartForm({ ...partForm, minThreshold: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">السعر (د.ج)</label>
                  <input
                    type="number"
                    min="0"
                    value={partForm.unitPrice}
                    onChange={(e) => setPartForm({ ...partForm, unitPrice: Number(e.target.value) })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">موقع التخزين بالمخزن</label>
                <input
                  type="text"
                  value={partForm.location}
                  onChange={(e) => setPartForm({ ...partForm, location: e.target.value })}
                  placeholder="e.g. Armoire A - الرف 2"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
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
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإضافة...' : 'حفظ المادة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Movement Modal */}
      {isMovementModalOpen && selectedPart && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <p className="text-xs font-bold text-amber-400">{selectedPart.name}</p>
                <h3 className="text-base font-black text-white">تسجيل حركة مخزون (المتوفر: {selectedPart.quantity})</h3>
              </div>
              <button onClick={() => setIsMovementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordMovement} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">نوع الحركة</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'IN' })}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                      movementForm.movementType === 'IN'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-navy-950 border-navy-750 text-slate-400'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                    تزويد / إدخال (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementForm({ ...movementForm, movementType: 'OUT' })}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                      movementForm.movementType === 'OUT'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-navy-950 border-navy-750 text-slate-400'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    سحب / استخدام (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">الكمية</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementForm.quantity}
                  onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">السبب / بيان الحركة</label>
                <input
                  type="text"
                  value={movementForm.reason}
                  onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
                  placeholder="e.g. تموين جديد، أو استخدام لصيانة طابعة..."
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 font-bold hover:bg-navy-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-400 disabled:opacity-50"
                >
                  {submitting ? 'تسجيل...' : 'تأكيد الحركة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
