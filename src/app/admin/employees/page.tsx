'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getEmployeesAction,
  createEmployeeAdminAction,
  updateEmployeeAdminAction,
  deleteEmployeeAdminAction
} from '@/app/actions/employees';
import {
  UserCheck, User, Plus, Search, RefreshCw, Trash2,
  Edit2, Check, X, ShieldCheck, PenTool, Award, Phone,
  Mail, Building2, MapPin, Factory, AlertCircle, Loader2,
  Eye, Lock
} from 'lucide-react';
import { UnitType } from '@prisma/client';
import { SignaturePadModal } from '@/components/ui/SignaturePadModal';
import { StampStudioModal } from '@/components/ui/StampStudioModal';

export default function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unitFilter, setUnitFilter] = useState('ALL');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [functionTitle, setFunctionTitle] = useState('');
  const [service, setService] = useState('Direction des Finances');
  const [unitType, setUnitType] = useState<UnitType>('FILIALE');
  const [unitName, setUnitName] = useState('Filiale Annaba');
  const [managerName, setManagerName] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);

  // Sub-modals
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  // Preview card modal
  const [previewEmp, setPreviewEmp] = useState<any | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getEmployeesAction();
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const openCreateModal = () => {
    setEditingEmp(null);
    setFullName('');
    setEmail('');
    setUsername('');
    setPassword('Emp2026!');
    setPhone('');
    setFunctionTitle('');
    setService('Direction des Finances & Comptabilité');
    setUnitType('FILIALE');
    setUnitName('Filiale Annaba');
    setManagerName('');
    setSignature(null);
    setStamp(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmp(emp);
    setFullName(emp.fullName);
    setEmail(emp.email);
    setUsername(emp.username);
    setPassword('');
    setPhone(emp.phone || '');
    setFunctionTitle(emp.functionTitle || '');
    setService(emp.service);
    setUnitType(emp.unitType);
    setUnitName(emp.unitName);
    setManagerName(emp.managerName || '');
    setSignature(emp.signature || null);
    setStamp(emp.stamp || null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (editingEmp) {
        const res = await updateEmployeeAdminAction(editingEmp.id, {
          fullName,
          email,
          phone,
          functionTitle,
          service,
          unitType,
          unitName,
          managerName,
          signature,
          stamp,
          password: password || undefined,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          setFormError(res.error || 'فشل التحديث');
        }
      } else {
        const res = await createEmployeeAdminAction({
          fullName,
          email,
          username,
          password,
          phone,
          functionTitle,
          service,
          unitType,
          unitName,
          managerName,
          signature: signature || undefined,
          stamp: stamp || undefined,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchEmployees();
        } else {
          setFormError(res.error || 'فشل الإنشاء');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'خطأ في العملية');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف حساب الموظف "${name}"؟`)) {
      await deleteEmployeeAdminAction(id);
      fetchEmployees();
    }
  };

  const handleToggleActive = async (emp: any) => {
    await updateEmployeeAdminAction(emp.id, { active: !emp.active });
    fetchEmployees();
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.service.toLowerCase().includes(search.toLowerCase()) ||
      emp.unitName.toLowerCase().includes(search.toLowerCase());

    const matchesUnit = unitFilter === 'ALL' || emp.unitType === unitFilter;
    return matchesSearch && matchesUnit;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة حسابات الموظفين والإمضاءات</h1>
              <p className="text-xs text-sky-400 font-bold uppercase tracking-wider">
                طالبو التدخلات · الإمضاءات والأختام الرقمية المعتمدة
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-sky-950/50 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موظف جديد</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-navy-900 border border-navy-800 rounded-3xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، المصلحة، الفرع أو البريد..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs placeholder-slate-500 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
          >
            <option value="ALL">جميع الفروع</option>
            <option value="FILIALE">مديريات جهوية (Filiale)</option>
            <option value="CIC">مديريات ولائية (CIC)</option>
            <option value="UPC">وحدات إنتاجية (UPC)</option>
          </select>

          <button
            type="button"
            onClick={fetchEmployees}
            className="p-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-navy-700 transition-colors"
            title="تحديث"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Employees Table / Cards */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
          <p className="text-xs text-slate-400">جاري تحميل قائمة الموظفين...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-3xl space-y-3">
          <User className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">لم يتم العثور على أي موظف</p>
          <p className="text-xs text-slate-400">أضف موظفاً جديداً لبدء تعيين الإمضاءات والأختام الرقمية.</p>
        </div>
      ) : (
        <div className="bg-navy-900 border border-navy-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-navy-950/80 border-b border-navy-800 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-4">الموظف</th>
                  <th className="px-5 py-4">المصلحة والفرع</th>
                  <th className="px-5 py-4">الاتصال</th>
                  <th className="px-5 py-4 text-center">التوقيع الرقمي</th>
                  <th className="px-5 py-4 text-center">الختم الرسمي</th>
                  <th className="px-5 py-4 text-center">الطلبات</th>
                  <th className="px-5 py-4 text-center">الحالة</th>
                  <th className="px-5 py-4 text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800">
                {filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-navy-850/50 transition-colors">
                    {/* Name */}
                    <td className="px-5 py-4 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-extrabold">
                          {emp.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-white">{emp.fullName}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{emp.functionTitle || 'موظف'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Structure */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-200">{emp.service}</p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <span className="text-sky-400 font-bold">{emp.unitType}:</span>
                        <span>{emp.unitName}</span>
                      </p>
                    </td>

                    {/* Contact */}
                    <td className="px-5 py-4 font-mono text-slate-300">
                      <p>{emp.email}</p>
                      {emp.phone && <p className="text-[11px] text-slate-400">{emp.phone}</p>}
                    </td>

                    {/* Signature */}
                    <td className="px-5 py-4 text-center">
                      {emp.signature ? (
                        <div className="w-16 h-8 mx-auto bg-white rounded p-0.5 border border-slate-300 shadow-sm flex items-center justify-center">
                          <img src={emp.signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">غير محدد</span>
                      )}
                    </td>

                    {/* Stamp */}
                    <td className="px-5 py-4 text-center">
                      {emp.stamp ? (
                        <div className="w-14 h-14 mx-auto bg-white rounded-full p-1 border border-slate-300 shadow-sm flex items-center justify-center">
                          <img src={emp.stamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">غير محدد</span>
                      )}
                    </td>

                    {/* Tickets */}
                    <td className="px-5 py-4 text-center font-mono">
                      <span className="px-2 py-0.5 rounded-full bg-navy-950 text-sky-400 font-bold border border-navy-750">
                        {emp.totalTickets}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(emp)}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                          emp.active
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {emp.active ? 'نشط' : 'معطّل'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-left">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setPreviewEmp(emp)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-sky-400 transition-colors"
                          title="معاينة بطاقة الاعتماد"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(emp.id, emp.fullName)}
                          className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-navy-900 border border-navy-750 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {editingEmp ? 'تعديل بيانات الموظف والإمضاء' : 'إضافة موظف جديد'}
                  </h3>
                  <p className="text-xs text-slate-400">حساب الموظف، التوقيع الرقمي والختم الرسمي</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الاسم واللقب *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم المستخدم *</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={!!editingEmp}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500 disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    {editingEmp ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور *'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingEmp ? 'اتركه فارغاً للإبقاء على الحالية' : 'Emp2026!'}
                    required={!editingEmp}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المصلحة / القسم *</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">الصفة / الوظيفة</label>
                  <input
                    type="text"
                    value={functionTitle}
                    onChange={(e) => setFunctionTitle(e.target.value)}
                    placeholder="Ingénieur / Chef de Service"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">نوع الهيكل *</label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as UnitType)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  >
                    <option value="FILIALE">مديرية جهوية (Filiale)</option>
                    <option value="CIC">مديرية ولائية (CIC)</option>
                    <option value="UPC">وحدة إنتاجية (UPC)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">اسم الوحدة / الموقع *</label>
                  <input
                    type="text"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 12 34 56"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs font-mono focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">المسؤول المباشر</label>
                  <input
                    type="text"
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    placeholder="Nom du Responsable"
                    className="w-full px-3 py-2 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
                  />
                </div>
              </div>

              {/* Signature & Stamp Section */}
              <div className="pt-2 border-t border-navy-800 space-y-2">
                <label className="block font-bold text-sky-400">التوقيع الرقمي والختم الرسمي للموظف:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Signature */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                    <span className="font-bold text-slate-300">التوقيع الرقمي</span>
                    <div className="w-full h-28 bg-white rounded-2xl p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {signature ? (
                        <img src={signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-slate-400 text-xs">لا يوجد توقيع</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsSigModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold"
                    >
                      {signature ? 'تعديل التوقيع' : 'رسم / رفع التوقيع'}
                    </button>
                  </div>

                  {/* Stamp */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                    <span className="font-bold text-slate-300">الختم الرسمي للمصلحة (الحجم الطبيعي)</span>
                    <div className="w-full h-28 bg-white rounded-2xl p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {stamp ? (
                        <img src={stamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-slate-400 text-xs">لا يوجد ختم</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStampModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-bold"
                    >
                      {stamp ? 'تعديل الختم' : 'توليد / رفع ختم'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit footer */}
              <div className="pt-4 border-t border-navy-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs shadow-lg disabled:opacity-50"
                >
                  {formSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingEmp ? 'حفظ التعديلات' : 'إنشاء الحساب'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CREDENTIAL MODAL */}
      {previewEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-navy-750 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                بطاقة الاعتماد الرسمية للموظف
              </h3>
              <button
                onClick={() => setPreviewEmp(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xl space-y-4 border-2 border-indigo-500/30">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900">{previewEmp.fullName}</h4>
                  <p className="text-xs text-indigo-600 font-bold">{previewEmp.functionTitle || 'موظف'}</p>
                  <p className="text-xs text-slate-600">{previewEmp.service}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{previewEmp.unitName}</p>
                </div>
                <div className="px-2 py-1 rounded bg-indigo-50 text-indigo-700 font-bold text-[10px] uppercase">
                  {previewEmp.unitType}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">التوقيع الرقمي</span>
                  <div className="h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                    {previewEmp.signature ? (
                      <img src={previewEmp.signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">غير معتمد</span>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">الختم الرسمي</span>
                  <div className="h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                    {previewEmp.stamp ? (
                      <img src={previewEmp.stamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">غير معتمد</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewEmp(null)}
                className="px-5 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature and Stamp Modals */}
      <SignaturePadModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSave={(sig) => setSignature(sig)}
        initialSignature={signature}
      />
      <StampStudioModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSave={(st) => setStamp(st)}
        initialStamp={stamp}
        defaultOrgName={unitName || 'ENTREPRISE ALGERIE'}
        defaultServiceName={service || 'DIRECTION FINANCES'}
        defaultUserName={fullName || 'DEMANDEUR'}
      />
    </div>
  );
}
