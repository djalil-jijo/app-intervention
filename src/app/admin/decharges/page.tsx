'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getDechargesAction,
  createDechargeAction,
  getDechargeDetailsAction,
  returnDechargeAction,
  deleteDechargeAction,
  CreateDechargeItemInput,
} from '@/app/actions/decharges';
import { getAssetsAction } from '@/app/actions/assets';
import { getTechniciansAction } from '@/app/actions/technicians';
import { SiteBadge } from '@/components/admin/SiteBadge';
import {
  FileSignature,
  Search,
  Plus,
  RefreshCw,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  Eye,
  X,
  Laptop,
  AlertCircle,
  FileCheck,
  User,
  Building2,
  Calendar,
  Layers,
  Package,
} from 'lucide-react';

export default function DechargesPage() {
  const [decharges, setDecharges] = useState<any[]>([]);
  const [availableAssets, setAvailableAssets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [unitTypeFilter, setUnitTypeFilter] = useState('ALL');
  const [dischargeTypeFilter, setDischargeTypeFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDecharge, setSelectedDecharge] = useState<any | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Return modal
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');
  const [returning, setReturning] = useState(false);

  // Form State
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [functionTitle, setFunctionTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [matricule, setMatricule] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [unitType, setUnitType] = useState<'FILIALE' | 'CIC' | 'UPC'>('FILIALE');
  const [unitName, setUnitName] = useState('Direction Générale Alger');
  const [dischargeType, setDischargeType] = useState<'PERMANENT' | 'TEMPORARY'>('PERMANENT');
  const [dischargeDate, setDischargeDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<CreateDechargeItemInput[]>([
    {
      equipmentName: '',
      category: 'LAPTOP',
      brand: '',
      model: '',
      serialNumber: '',
      assetTag: '',
      condition: 'BON_ETAT',
      accessories: 'Chargeur, Sacoche, Souris',
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchDecharges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDechargesAction({
        search,
        status: statusFilter,
        unitType: unitTypeFilter,
        dischargeType: dischargeTypeFilter,
      });
      if (res.success && res.data) {
        setDecharges(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, unitTypeFilter, dischargeTypeFilter]);

  const loadDependencies = useCallback(async () => {
    try {
      const [assetsRes, techsRes] = await Promise.all([
        getAssetsAction({ status: 'OPERATIONAL' }),
        getTechniciansAction(),
      ]);
      if (assetsRes.success && assetsRes.data) setAvailableAssets(assetsRes.data);
      if (techsRes.success && techsRes.data) {
        setTechnicians(techsRes.data);
        if (techsRes.data.length > 0 && !technicianName) {
          setTechnicianName(techsRes.data[0].name);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [technicianName]);

  useEffect(() => {
    fetchDecharges();
  }, [fetchDecharges]);

  useEffect(() => {
    loadDependencies();
  }, [loadDependencies]);

  // Handle Asset Auto-Fill in Item
  const handleSelectAssetForItem = (index: number, assetId: string) => {
    const selected = availableAssets.find((a) => a.id === assetId);
    const updated = [...items];
    if (selected) {
      updated[index] = {
        ...updated[index],
        assetId: selected.id,
        assetTag: selected.assetTag,
        equipmentName: selected.name,
        category: selected.type,
        brand: selected.brand || '',
        model: selected.model || '',
        serialNumber: selected.serialNumber || '',
      };
    } else {
      updated[index].assetId = undefined;
    }
    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        equipmentName: '',
        category: 'DESKTOP',
        brand: '',
        model: '',
        serialNumber: '',
        assetTag: '',
        condition: 'BON_ETAT',
        accessories: '',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (index: number, field: keyof CreateDechargeItemInput, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleCreateDecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!beneficiaryName.trim()) {
      setFormError('Le nom du bénéficiaire est obligatoire.');
      return;
    }
    if (!department.trim()) {
      setFormError('Le service / direction est obligatoire.');
      return;
    }
    if (!technicianName.trim()) {
      setFormError('Le technicien responsable est obligatoire.');
      return;
    }
    const hasEmptyItem = items.some((it) => !it.equipmentName.trim());
    if (hasEmptyItem) {
      setFormError('Veuillez renseigner la désignation de tous les équipements listés.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createDechargeAction({
        beneficiaryName,
        functionTitle,
        department,
        matricule,
        phone,
        email,
        unitType,
        unitName,
        dischargeType,
        dischargeDate,
        expectedReturnDate: dischargeType === 'TEMPORARY' ? expectedReturnDate : undefined,
        technicianName,
        notes,
        items,
      });

      if (res.success) {
        setIsAddModalOpen(false);
        // Reset form
        setBeneficiaryName('');
        setFunctionTitle('');
        setDepartment('');
        setMatricule('');
        setPhone('');
        setEmail('');
        setNotes('');
        setItems([
          {
            equipmentName: '',
            category: 'LAPTOP',
            brand: '',
            model: '',
            serialNumber: '',
            assetTag: '',
            condition: 'BON_ETAT',
            accessories: 'Chargeur, Sacoche, Souris',
          },
        ]);
        fetchDecharges();
        loadDependencies();
      } else {
        setFormError(res.error || 'Erreur lors de la création');
      }
    } catch (err: any) {
      setFormError(err.message || 'Une erreur est survenue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDetails = async (decharge: any) => {
    setSelectedDecharge(decharge);
    setLoadingDetails(true);
    const res = await getDechargeDetailsAction(decharge.id);
    if (res.success && res.data) {
      setSelectedDecharge(res.data);
    }
    setLoadingDetails(false);
  };

  const handleOpenReturnModal = (decharge: any) => {
    setSelectedDecharge(decharge);
    setReturnNotes('');
    setIsReturnModalOpen(true);
  };

  const handleConfirmReturn = async () => {
    if (!selectedDecharge) return;
    setReturning(true);
    try {
      const res = await returnDechargeAction(selectedDecharge.id, returnNotes);
      if (res.success) {
        setIsReturnModalOpen(false);
        if (selectedDecharge) {
          const updated = await getDechargeDetailsAction(selectedDecharge.id);
          if (updated.success) setSelectedDecharge(updated.data);
        }
        fetchDecharges();
        loadDependencies();
      } else {
        alert(res.error || 'Erreur lors de la restitution');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReturning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce bon de décharge ?')) {
      await deleteDechargeAction(id);
      fetchDecharges();
    }
  };

  // KPIs
  const totalCount = decharges.length;
  const activeCount = decharges.filter((d) => d.status === 'ACTIVE').length;
  const returnedCount = decharges.filter((d) => d.status === 'RETURNED').length;
  const temporaryCount = decharges.filter((d) => d.dischargeType === 'TEMPORARY' && d.status === 'ACTIVE').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-sky-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileSignature className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">سندات ومحاضر تسليم العتاد (Bons de Décharge)</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                Equipment Handover Receipts & Responsibility Discharge
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mr-13">
            توثيق تسليم العتاد للموظفين، توليد وثائق PDF رسمية للطباعة والتوقيع، وتتبع العتاد المسلّم والمسترجع.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>تحرير وصل تسليم جديد (Nouvelle Décharge)</span>
          </button>
          <button
            onClick={fetchDecharges}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">إجمالي الوصولات</p>
            <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">سندات مسجلة في النظام</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">مسلّمة قيد الاستعمال</p>
            <p className="text-2xl font-black text-white mt-1">{activeCount}</p>
            <p className="text-[10px] text-emerald-400/80 mt-0.5">بحوزة الموظفين حالياً</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">إعارات مؤقتة</p>
            <p className="text-2xl font-black text-white mt-1">{temporaryCount}</p>
            <p className="text-[10px] text-amber-400/80 mt-0.5">محددة بأجل استرجاع</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">عتاد مسترجع (Restitué)</p>
            <p className="text-2xl font-black text-white mt-1">{returnedCount}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">تم إرجاعه لمصلحة الإعلام الآلي</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            placeholder="بحث برقم الوصل، اسم المستفيد، العتاد..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500 placeholder:text-slate-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">جميع الحالات (Tous les statuts)</option>
            <option value="ACTIVE">مسلّم قيد الاستعمال (Actif / En cours)</option>
            <option value="RETURNED">مسترجع (Restitué)</option>
          </select>
        </div>

        <div>
          <select
            value={unitTypeFilter}
            onChange={(e) => setUnitTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">جميع الهياكل والمواقع (Sites)</option>
            <option value="FILIALE">المديريات الجهوية (Filiales)</option>
            <option value="CIC">المديريات الولائية (CIC)</option>
            <option value="UPC">الوحدات الإنتاجية (UPC)</option>
          </select>
        </div>

        <div>
          <select
            value={dischargeTypeFilter}
            onChange={(e) => setDischargeTypeFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs font-bold text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">جميع أنواع التسليم (Tous types)</option>
            <option value="PERMANENT">تسليم نهائي للعمل (Affectation définitive)</option>
            <option value="TEMPORARY">إعارة مؤقتة (Prêt temporaire)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-xl">
        {loading ? (
          <div className="py-16 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-400 mb-2" />
            <p className="text-xs">جاري تحميل وصولات التسليم...</p>
          </div>
        ) : decharges.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <FileSignature className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="font-bold text-slate-300 text-sm">لا توجد وصولات تسليم مطابقة للبحث</p>
            <p className="text-xs text-slate-500 mt-1">يمكنك الضغط على زر &quot;تحرير وصل تسليم جديد&quot; لتسليم عتاد لموظف.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3.5 px-4 text-right">رقم الوصل (N° Décharge)</th>
                  <th className="py-3.5 px-4 text-right">المستفيد (Bénéficiaire)</th>
                  <th className="py-3.5 px-4 text-right">المصلحة والهيكل</th>
                  <th className="py-3.5 px-4 text-right">العتاد المسلّم</th>
                  <th className="py-3.5 px-4 text-right">تاريخ التسليم &amp; النوع</th>
                  <th className="py-3.5 px-4 text-right">الحالة</th>
                  <th className="py-3.5 px-4 text-left">الإجراءات والطباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {decharges.map((d) => (
                  <tr key={d.id} className="hover:bg-navy-850/60 transition-colors">
                    {/* N° Decharge */}
                    <td className="py-4 px-4 font-mono font-bold text-sky-400">
                      <div className="flex items-center gap-1.5">
                        <FileSignature className="w-4 h-4 text-sky-400 shrink-0" />
                        <span>{d.dechargeNumber}</span>
                      </div>
                    </td>

                    {/* Beneficiary */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-white text-sm">{d.beneficiaryName}</p>
                      <p className="text-[11px] text-slate-400">{d.functionTitle || 'موظف'}</p>
                      {d.matricule && (
                        <span className="text-[10px] font-mono text-slate-500">Mat: {d.matricule}</span>
                      )}
                    </td>

                    {/* Service & Site */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-slate-200">{d.department}</p>
                      <div className="mt-1">
                        <SiteBadge unitType={d.unitType} unitName={d.unitName} />
                      </div>
                    </td>

                    {/* Items */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1 max-w-[240px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold w-fit">
                          <Package className="w-3 h-3" />
                          {d._count?.items || d.items?.length || 0} عتاد مسجّل
                        </span>
                        {d.items && d.items.length > 0 && (
                          <div className="text-[11px] text-slate-300 truncate">
                            {d.items.map((it: any) => it.equipmentName).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Date & Type */}
                    <td className="py-4 px-4">
                      <p className="font-mono text-slate-200">
                        {new Date(d.dischargeDate).toLocaleDateString('fr-FR')}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.dischargeType === 'TEMPORARY'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {d.dischargeType === 'TEMPORARY' ? 'إعارة مؤقتة' : 'تسليم نهائي'}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {d.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          قيد الاستعمال (Actif)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-500/10 border border-slate-500/30 text-slate-400 text-[11px] font-bold">
                          <RotateCcw className="w-3 h-3" />
                          مسترجع (Restitué)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-left">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print / Preview PDF */}
                        <a
                          href={`/api/decharges/${d.id}/pdf?inline=true`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-navy-800 hover:bg-sky-500/20 text-sky-400 border border-navy-700 transition-colors"
                          title="معاينة وطباعة الوصل (PDF)"
                        >
                          <Printer className="w-4 h-4" />
                        </a>

                        {/* Download PDF */}
                        <a
                          href={`/api/decharges/${d.id}/pdf`}
                          className="p-2 rounded-xl bg-navy-800 hover:bg-emerald-500/20 text-emerald-400 border border-navy-700 transition-colors"
                          title="تحميل PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>

                        {/* View details */}
                        <button
                          onClick={() => handleViewDetails(d)}
                          className="p-2 rounded-xl bg-navy-800 hover:bg-indigo-500/20 text-indigo-300 border border-navy-700 transition-colors"
                          title="تفاصيل الوصل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Return equipment action if ACTIVE */}
                        {d.status === 'ACTIVE' && (
                          <button
                            onClick={() => handleOpenReturnModal(d)}
                            className="p-2 rounded-xl bg-navy-800 hover:bg-amber-500/20 text-amber-400 border border-navy-700 transition-colors"
                            title="تسجيل استرجاع العتاد (Restitution)"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-2 rounded-xl bg-navy-800 hover:bg-rose-500/20 text-rose-400 border border-navy-700 transition-colors"
                          title="حذف الوصل"
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

      {/* ── CREATE DECHARGE MODAL ── */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">تحرير وصل تسليم عتاد جديد (Nouveau Bon de Décharge)</h3>
                  <p className="text-xs text-slate-400">إثبات تسليم العتاد للموظف وتحديد المسؤولية</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDecharge} className="space-y-5">
              {/* Section 1: Bénéficiaire */}
              <div className="bg-navy-950/60 p-4 rounded-2xl border border-navy-800/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
                  <User className="w-4 h-4" />
                  1. معلومات المستفيد (Bénéficiaire)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      الاسم واللقب <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Mohamed Amine"
                      value={beneficiaryName}
                      onChange={(e) => setBeneficiaryName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الوظيفة / الرتبة</label>
                    <input
                      type="text"
                      placeholder="Ex: Ingénieur Système"
                      value={functionTitle}
                      onChange={(e) => setFunctionTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      المصلحة / القسم <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Service Comptabilité"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">رقم التسجيل (Matricule / CIN)</label>
                    <input
                      type="text"
                      placeholder="Ex: MAT-4892"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">الهاتف</label>
                    <input
                      type="text"
                      placeholder="Ex: 0550 12 34 56"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      placeholder="Ex: amine@entreprise.dz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-navy-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">نوع الهيكل (Structure)</label>
                    <select
                      value={unitType}
                      onChange={(e) => setUnitType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="FILIALE">مديرية جهوية (Filiale)</option>
                      <option value="CIC">مديرية ولائية (CIC)</option>
                      <option value="UPC">وحدة إنتاجية (UPC)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اسم الموقع / الهيكل</label>
                    <input
                      type="text"
                      required
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Type et Conditions de Remise */}
              <div className="bg-navy-950/60 p-4 rounded-2xl border border-navy-800/80 space-y-3">
                <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  2. شروط وطبيعة التسليم (Modalités de Remise)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">نوع التسليم</label>
                    <select
                      value={dischargeType}
                      onChange={(e) => setDischargeType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    >
                      <option value="PERMANENT">تسليم نهائي للعمل (Affectation définitive)</option>
                      <option value="TEMPORARY">إعارة مؤقتة (Prêt temporaire)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ التسليم</label>
                    <input
                      type="date"
                      required
                      value={dischargeDate}
                      onChange={(e) => setDischargeDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  {dischargeType === 'TEMPORARY' ? (
                    <div>
                      <label className="block text-xs font-bold text-amber-400 mb-1">تاريخ الإرجاع المتوقع</label>
                      <input
                        type="date"
                        required
                        value={expectedReturnDate}
                        onChange={(e) => setExpectedReturnDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-amber-500/40 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">
                        التقني المسلّم <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Sofiane Benali"
                        value={technicianName}
                        onChange={(e) => setTechnicianName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  )}
                </div>

                {dischargeType === 'TEMPORARY' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      التقني المسلّم <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Sofiane Benali"
                      value={technicianName}
                      onChange={(e) => setTechnicianName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">ملاحظات إضافية أو شروط خاصة</label>
                  <textarea
                    rows={2}
                    placeholder="Ex: الجهاز في حالة ممتازة، تم تسليم حقيبة أصلية وشاحن سريع..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Section 3: Équipements Remis (Dynamic multi-item list) */}
              <div className="bg-navy-950/60 p-4 rounded-2xl border border-navy-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase text-sky-400 tracking-wider flex items-center gap-2">
                    <Laptop className="w-4 h-4" />
                    3. العتاد والملحقات المسلّمة ({items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold border border-indigo-500/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة عتاد آخر في نفس الوصل</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-navy-900 border border-navy-800 rounded-2xl space-y-3 relative"
                    >
                      <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                        <span className="text-xs font-bold text-sky-400 font-mono">
                          العتاد #{idx + 1}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        )}
                      </div>

                      {/* Pick from IT Assets Inventory */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          اختيار من الجرد المعلوماتي (Optionnel - Auto-remplissage) :
                        </label>
                        <select
                          value={item.assetId || ''}
                          onChange={(e) => handleSelectAssetForItem(idx, e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="">-- عتاد حر أو اختيار من القائمة --</option>
                          {availableAssets.map((ast) => (
                            <option key={ast.id} value={ast.id}>
                              [{ast.assetTag}] {ast.name} ({ast.brand} {ast.model}) - S/N:{ast.serialNumber || 'N/A'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">
                            اسم وتعيين الجهاز <span className="text-rose-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: PC Portable HP ProBook 450"
                            value={item.equipmentName}
                            onChange={(e) => handleUpdateItem(idx, 'equipmentName', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">الصنف</label>
                          <select
                            value={item.category}
                            onChange={(e) => handleUpdateItem(idx, 'category', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                          >
                            <option value="LAPTOP">حاسوب محمول (Laptop)</option>
                            <option value="DESKTOP">كمبيوتر مكتبي (Desktop)</option>
                            <option value="MONITOR">شاشة (Écran)</option>
                            <option value="PRINTER">طابعة (Imprimante)</option>
                            <option value="UPS">موزع طاقة (Onduleur)</option>
                            <option value="OTHER">عتاد آخر (Autre)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">رقم الجرد (Asset Tag)</label>
                          <input
                            type="text"
                            placeholder="Ex: AST-2026-0012"
                            value={item.assetTag || ''}
                            onChange={(e) => handleUpdateItem(idx, 'assetTag', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">الرقم التسلسلي S/N</label>
                          <input
                            type="text"
                            placeholder="Ex: 5CD23498XYZ"
                            value={item.serialNumber || ''}
                            onChange={(e) => handleUpdateItem(idx, 'serialNumber', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">حالة العتاد</label>
                          <select
                            value={item.condition}
                            onChange={(e) => handleUpdateItem(idx, 'condition', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                          >
                            <option value="NEUF">جديد (Neuf)</option>
                            <option value="BON_ETAT">حالة جيدة (Bon état)</option>
                            <option value="ETAT_MOYEN">حالة مقبولة (État moyen)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1">الملحقات المسلّمة معه</label>
                          <input
                            type="text"
                            placeholder="Ex: Sacoche, Câble HDMI, Souris..."
                            value={item.accessories || ''}
                            onChange={(e) => handleUpdateItem(idx, 'accessories', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-300 font-bold text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-sky-500/20 hover:opacity-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>{submitting ? 'جاري الحفظ...' : 'تأكيد وحفظ وصل التسليم'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DETAILS MODAL ── */}
      {selectedDecharge && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <FileSignature className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">تفاصيل سند التسليم {selectedDecharge.dechargeNumber}</h3>
                  <p className="text-xs text-slate-400">
                    تاريخ التسليم: {new Date(selectedDecharge.dischargeDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDecharge(null)}
                className="p-2 rounded-xl bg-navy-850 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="py-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-sky-400 mb-2" />
                <p className="text-xs">جاري تحميل البيانات...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Beneficiary card */}
                <div className="bg-navy-950 p-4 rounded-2xl border border-navy-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-white text-base">{selectedDecharge.beneficiaryName}</p>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        selectedDecharge.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-500/15 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {selectedDecharge.status === 'ACTIVE' ? 'قيد الاستعمال (Actif)' : 'مسترجع (Restitué)'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 pt-2 border-t border-navy-800">
                    <div>
                      <span className="text-slate-500">الوظيفة:</span> {selectedDecharge.functionTitle || '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">المصلحة:</span> {selectedDecharge.department}
                    </div>
                    <div>
                      <span className="text-slate-500">رقم التسجيل:</span> {selectedDecharge.matricule || '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">الاتصال:</span> {selectedDecharge.phone || selectedDecharge.email || '—'}
                    </div>
                    <div>
                      <span className="text-slate-500">الهيكل:</span> {selectedDecharge.unitName}
                    </div>
                    <div>
                      <span className="text-slate-500">التقني المسلّم:</span> {selectedDecharge.technicianName}
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    العتاد المسجل في هذا السند ({selectedDecharge.items?.length || 0})
                  </h4>
                  <div className="space-y-2">
                    {selectedDecharge.items?.map((it: any, i: number) => (
                      <div key={i} className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{it.equipmentName}</span>
                          <span className="font-mono text-sky-400 font-bold">{it.assetTag || 'بدون كود'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-slate-400 text-[11px]">
                          <div>S/N: <span className="font-mono text-slate-300">{it.serialNumber || '—'}</span></div>
                          <div>الحالة: <span className="text-emerald-400 font-bold">{it.condition}</span></div>
                          {it.accessories && (
                            <div className="col-span-2">الملحقات: <span className="text-slate-300">{it.accessories}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Restitution Notes if returned */}
                {selectedDecharge.status === 'RETURNED' && (
                  <div className="bg-navy-950 p-3.5 rounded-xl border border-navy-800 text-xs space-y-1">
                    <p className="text-[11px] font-bold text-slate-400 uppercase">معلومات الاسترجاع :</p>
                    <p className="text-slate-300">
                      تاريخ الاسترجاع: {selectedDecharge.returnedAt ? new Date(selectedDecharge.returnedAt).toLocaleDateString('fr-FR') : '—'}
                    </p>
                    <p className="text-slate-400 text-[11px]">{selectedDecharge.returnNotes}</p>
                  </div>
                )}

                {/* Actions bottom */}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-navy-800">
                  <div className="flex items-center gap-2">
                    <a
                      href={`/api/decharges/${selectedDecharge.id}/pdf?inline=true`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-sky-400 font-bold text-xs border border-navy-700 transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>معاينة وطباعة الوصل</span>
                    </a>
                    <a
                      href={`/api/decharges/${selectedDecharge.id}/pdf`}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل PDF</span>
                    </a>
                  </div>

                  {selectedDecharge.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleOpenReturnModal(selectedDecharge)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>تسجيل استرجاع العتاد</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RETURN CONFIRMATION MODAL ── */}
      {isReturnModalOpen && selectedDecharge && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 border-b border-navy-800 pb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-white">إرجاع العتاد لمصلحة الإعلام الآلي</h3>
                <p className="text-xs text-slate-400">Restitution du Matériel</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              أنت على وشك تأكيد استرجاع العتاد المسجل في الوصل{' '}
              <span className="font-mono font-bold text-sky-400">{selectedDecharge.dechargeNumber}</span> من الموظف{' '}
              <span className="font-bold text-white">{selectedDecharge.beneficiaryName}</span>. سيتم تحرير الأجهزة في المخزون
              تلقائياً.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                ملاحظات الاسترجاع وحالة العتاد (État de retour) :
              </label>
              <textarea
                rows={3}
                placeholder="Ex: تم استرجاع العتاد كاملاً مع الشاحن وبحالة سليمة وجاهز لإعادة التوزيع..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-850 text-slate-300 hover:text-white text-xs font-bold transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                disabled={returning}
                onClick={handleConfirmReturn}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-extrabold shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
              >
                {returning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>{returning ? 'جاري التأكيد...' : 'تأكيد الاسترجاع'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
