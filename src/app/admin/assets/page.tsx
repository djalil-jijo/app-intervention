'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getAssetsAction, createAssetAction, getAssetDetailsAction, deleteAssetAction } from '@/app/actions/assets';
import { SiteBadge } from '@/components/admin/SiteBadge';
import {
  Laptop, Search, Plus, RefreshCw, Server, Printer, Monitor, HardDrive, ShieldAlert,
  Calendar, User, Tag, Trash2, Eye, X, CheckCircle, AlertOctagon, Wrench, Shield, FileSignature
} from 'lucide-react';

export default function AdminAssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitTypeFilter, setUnitTypeFilter] = useState('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [assetHistory, setAssetHistory] = useState<any | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // New Asset Form State
  const [formData, setFormData] = useState({
    assetTag: '',
    name: '',
    type: 'DESKTOP',
    brand: '',
    model: '',
    serialNumber: '',
    unitType: 'FILIALE',
    unitName: 'Direction Générale Alger',
    service: '',
    assignedTo: '',
    ipAddress: '',
    status: 'OPERATIONAL',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAssetsAction({ search, type: typeFilter, status: statusFilter, unitType: unitTypeFilter });
      if (res.success && res.data) setAssets(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, unitTypeFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createAssetAction(formData as any);
      if (res.success) {
        setIsAddModalOpen(false);
        setFormData({
          assetTag: '', name: '', type: 'DESKTOP', brand: '', model: '', serialNumber: '',
          unitType: 'FILIALE', unitName: 'Direction Générale Alger', service: '', assignedTo: '',
          ipAddress: '', status: 'OPERATIONAL', notes: '',
        });
        fetchAssets();
      } else {
        alert(res.error || 'Erreur lors de la création');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewAssetDetails = async (asset: any) => {
    setSelectedAsset(asset);
    setLoadingHistory(true);
    const res = await getAssetDetailsAction(asset.id);
    if (res.success) {
      setAssetHistory(res.data);
    }
    setLoadingHistory(false);
  };

  const handleDeleteAsset = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer cet équipement du parc ?')) {
      await deleteAssetAction(id);
      fetchAssets();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return <span className="px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">شغال ممتاز (Opérationnel)</span>;
      case 'DEFECTIVE':
        return <span className="px-2.5 py-1 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold">متعطل (En Panne)</span>;
      case 'UNDER_MAINTENANCE':
        return <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">تحت الصيانة (En Maintenance)</span>;
      default:
        return <span className="px-2.5 py-1 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400 text-[11px] font-bold">خارج الخدمة (Réformé)</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Laptop className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">جرد العتاد المعلوماتي (Parc Informatique)</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">IT Assets & Hardware Inventory ERP</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/decharges"
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/30 font-bold text-xs transition-all"
          >
            <FileSignature className="w-4 h-4" />
            <span>سندات التسليم (Bons de Décharge)</span>
          </Link>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عتاد جديد</span>
          </button>
          <button
            onClick={fetchAssets}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الجرد Tag، Serial، اسم الجهاز..."
            className="w-full bg-navy-950 border border-navy-750 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">جميع أنواع العتاد</option>
          <option value="DESKTOP">حواسيب مكتبية (PC Fixe)</option>
          <option value="LAPTOP">حواسيب محمولة (PC Portable)</option>
          <option value="PRINTER">طابعات ومحابر (Imprimantes)</option>
          <option value="SERVER">خوادم (Serveurs)</option>
          <option value="SWITCH_ROUTER">أجهزة شبكات (Switches/Routers)</option>
          <option value="UPS">مغذيات طاقة (Onduleurs/UPS)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">جميع الحالات</option>
          <option value="OPERATIONAL">شغال ممتاز (Opérationnel)</option>
          <option value="DEFECTIVE">متعطل (En Panne)</option>
          <option value="UNDER_MAINTENANCE">تحت الصيانة (En Maintenance)</option>
          <option value="SCRAPPED">خارج الخدمة (Réformé)</option>
        </select>

        <select
          value={unitTypeFilter}
          onChange={(e) => setUnitTypeFilter(e.target.value)}
          className="bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
        >
          <option value="ALL">جميع الفروع</option>
          <option value="FILIALE">المديريات الجهوية (FILIALE)</option>
          <option value="CIC">المديريات الولائية (CIC)</option>
          <option value="UPC">الوحدات الإنتاجية (UPC)</option>
        </select>
      </div>

      {/* Assets Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-500 font-medium">جاري التحميل...</div>
        ) : assets.length === 0 ? (
          <div className="py-12 text-center text-slate-500">لا يوجد عتاد معلوماتي مطابق لخيارات البحث.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 text-right">رقم الجرد (Asset Tag)</th>
                  <th className="py-3.5 px-4 text-right">اسم الجهاز والنوع</th>
                  <th className="py-3.5 px-4 text-right">الرقم التسلسلي S/N</th>
                  <th className="py-3.5 px-4 text-right">الموقع / الهيكل</th>
                  <th className="py-3.5 px-4 text-right">المستعمل المسند له</th>
                  <th className="py-3.5 px-4 text-right">الحالة التقنية</th>
                  <th className="py-3.5 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {assets.map((ast) => (
                  <tr key={ast.id} className="hover:bg-navy-850/60 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-sky-400">
                      {ast.assetTag}
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-white">{ast.name}</p>
                      <p className="text-[11px] text-slate-400">{ast.brand} {ast.model}</p>
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-300">
                      {ast.serialNumber || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <SiteBadge unitType={ast.unitType} unitName={ast.unitName} />
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-200">{ast.assignedTo || 'غير مسند'}</p>
                      <p className="text-[10px] text-slate-500">{ast.service}</p>
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(ast.status)}
                    </td>
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href="/admin/decharges"
                          className="p-1.5 rounded-lg bg-navy-800 text-indigo-400 hover:bg-indigo-500/20 transition-colors"
                          title="تحرير / استعراض سندات التسليم"
                        >
                          <FileSignature className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleViewAssetDetails(ast)}
                          className="p-1.5 rounded-lg bg-navy-800 text-sky-400 hover:bg-sky-500/20 transition-colors"
                          title="التاريخ التقني"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAsset(ast.id)}
                          className="p-1.5 rounded-lg bg-navy-800 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-lg font-black text-white">إضافة عتاد معلوماتي جديد للرمز الجردي</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">رقم الجرد (Asset Tag)</label>
                  <input
                    type="text"
                    value={formData.assetTag}
                    onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
                    placeholder="تلقائي إن تركته فارغاً"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">نوع العتاد</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="DESKTOP">PC Fixe</option>
                    <option value="LAPTOP">PC Portable</option>
                    <option value="PRINTER">Imprimante</option>
                    <option value="SERVER">Serveur</option>
                    <option value="SWITCH_ROUTER">Switch / Router</option>
                    <option value="UPS">Onduleur / UPS</option>
                    <option value="MONITOR">Écran</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">اسم العتاد / التسمية *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. PC HP ProDesk 400 G6"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">العلامة (Marque)</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="HP, Dell, Canon..."
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">الرقم التسلسلي (Serial Number)</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                    placeholder="S/N: XXXX..."
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">نوع الهيكل التنظيمي</label>
                  <select
                    value={formData.unitType}
                    onChange={(e) => setFormData({ ...formData, unitType: e.target.value })}
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="FILIALE">Filiale (مديرية جهوية)</option>
                    <option value="CIC">CIC (مديرية ولائية)</option>
                    <option value="UPC">UPC (وحدة إنتاجية)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">اسم المقر / الوحدة *</label>
                  <input
                    type="text"
                    required
                    value={formData.unitName}
                    onChange={(e) => setFormData({ ...formData, unitName: e.target.value })}
                    placeholder="e.g. Direction Générale Alger"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">المستخدم المكلف (Assigned To)</label>
                  <input
                    type="text"
                    value={formData.assignedTo}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    placeholder="اسم الموظف المستعمل"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">المصلحة (Service)</label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    placeholder="Comptabilité, RH..."
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
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
                  className="px-5 py-2 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-400 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ العتاد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset History Modal Drawer */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold text-sky-400">{selectedAsset.assetTag}</span>
                <h3 className="text-lg font-black text-white">{selectedAsset.name}</h3>
              </div>
              <button onClick={() => setSelectedAsset(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-8 text-center text-slate-400">جاري تحميل السجل التقني...</div>
            ) : assetHistory ? (
              <div className="space-y-4 text-xs">
                {/* Details card */}
                <div className="bg-navy-950 rounded-2xl p-4 border border-navy-800 grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block">الرقم التسلسلي:</span>
                    <span className="font-mono text-white font-bold">{assetHistory.serialNumber || 'غير متوفر'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">العلامة والموديل:</span>
                    <span className="text-white font-bold">{assetHistory.brand} {assetHistory.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الموقع:</span>
                    <span className="text-white font-bold">{assetHistory.unitName} ({assetHistory.service})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">المستخدم:</span>
                    <span className="text-white font-bold">{assetHistory.assignedTo || 'غير مسند'}</span>
                  </div>
                </div>

                <h4 className="font-extrabold text-white text-sm">سجل التدخلات التقنية المنجزة على هذا الجهاز</h4>
                {assetHistory.tickets && assetHistory.tickets.length > 0 ? (
                  <div className="space-y-2">
                    {assetHistory.tickets.map((tk: any) => (
                      <div key={tk.id} className="bg-navy-950/80 border border-navy-800 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sky-400 font-bold">{tk.ticketNumber}</span>
                          <span className="text-slate-500 text-[10px]">{new Date(tk.createdAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                        <p className="text-slate-300 font-medium">{tk.description}</p>
                        {tk.report && (
                          <div className="mt-2 pt-2 border-t border-navy-800 text-emerald-300">
                            <p className="font-bold text-[11px]">محضر الصيانة #{tk.report.reportNumber}:</p>
                            <p className="text-slate-400 text-[11px]">التشخيص: {tk.report.diagnosis}</p>
                            <p className="text-slate-400 text-[11px]">الإجراء المتخذ: {tk.report.actionsTaken}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic py-3">لم يتم تسجيل أي تدخل سابق على هذا الجهاز.</p>
                )}

                {/* History of Decharges for this asset */}
                {assetHistory.dechargeItems && assetHistory.dechargeItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-navy-800">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-indigo-400" />
                      سجل وصولات التسليم (Bons de Décharge) لهذا الجهاز
                    </h4>
                    <div className="space-y-2">
                      {assetHistory.dechargeItems.map((di: any) => (
                        <div key={di.id} className="bg-navy-950/80 border border-navy-800 rounded-xl p-3 flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sky-400 font-bold">{di.decharge?.dechargeNumber}</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                di.decharge?.status === 'ACTIVE'
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-slate-500/15 text-slate-300'
                              }`}>
                                {di.decharge?.status === 'ACTIVE' ? 'قيد الاستعمال' : 'مسترجع'}
                              </span>
                            </div>
                            <p className="text-slate-300 text-xs mt-1">المستفيد: <span className="font-bold text-white">{di.decharge?.beneficiaryName}</span> ({di.decharge?.department})</p>
                          </div>
                          <div className="text-left">
                            <span className="text-slate-500 text-[10px] block">
                              {di.decharge?.dischargeDate ? new Date(di.decharge.dischargeDate).toLocaleDateString('fr-FR') : '—'}
                            </span>
                            <a
                              href={`/api/decharges/${di.decharge?.id}/pdf?inline=true`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-sky-400 hover:underline flex items-center gap-1 mt-1 justify-end"
                            >
                              <Printer className="w-3 h-3" />
                              <span>طباعة الوصل</span>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
