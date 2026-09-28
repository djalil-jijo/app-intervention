'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getTechniciansAction,
  createTechnicianAction,
  updateTechnicianAction,
  deleteTechnicianAction,
} from '@/app/actions/technicians';
import {
  Users, Plus, RefreshCw, Mail, Phone, ShieldCheck, Wrench,
  CheckCircle2, Clock, X, Trash2, Award, Check, Edit2, Eye,
  Search, PenTool, Lock, AlertCircle, Loader2
} from 'lucide-react';
import { SignaturePadModal } from '@/components/ui/SignaturePadModal';
import { StampStudioModal } from '@/components/ui/StampStudioModal';

const AVAILABLE_ROLES = [
  { value: 'Technicien en Informatique', label: 'تقني في الإعلام الآلي (Technicien IT)' },
  { value: 'Ingénieur d\'État en Informatique', label: 'مهندس دولة في الإعلام الآلي (Ingénieur IT)' },
  { value: 'Cadre Supérieur IT / Responsable', label: 'إطار سامي / مسؤول الإعلام الآلي (Cadre IT)' },
  { value: 'Administrateur Systèmes & Réseaux', label: 'مدير أنظمة وشبكات (Administrateur)' },
];

const AVAILABLE_SPECIALITIES = [
  'Maintenance Hardware & PC',
  'Réseaux & Commutateurs Cisco',
  'Systèmes & Serveurs Linux/Win',
  'Imprimantes & Consommables',
  'Sécurité Informatique & Firewall',
  'Développement & Bases de Données',
];

export default function AdminTechniciansPage() {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Technicien en Informatique');
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>(['Maintenance Hardware & PC']);
  const [signature, setSignature] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);

  // Signature & Stamp sub-modals
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  // Preview credential modal
  const [previewTech, setPreviewTech] = useState<any | null>(null);

  const fetchTechs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTechniciansAction();
      if (res.success && res.data) setTechnicians(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTechs();
  }, [fetchTechs]);

  const toggleSpeciality = (spec: string) => {
    if (selectedSpecialities.includes(spec)) {
      setSelectedSpecialities(selectedSpecialities.filter(s => s !== spec));
    } else {
      setSelectedSpecialities([...selectedSpecialities, spec]);
    }
  };

  const openCreateModal = () => {
    setEditingTech(null);
    setName('');
    setEmail('');
    setUsername('');
    setPassword('Tech2026!');
    setPhone('');
    setRole('Technicien en Informatique');
    setSelectedSpecialities(['Maintenance Hardware & PC']);
    setSignature(null);
    setStamp(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tech: any) => {
    setEditingTech(tech);
    setName(tech.name);
    setEmail(tech.email);
    setUsername(tech.username || '');
    setPassword('');
    setPhone(tech.phone || '');
    setRole(tech.role || 'Technicien en Informatique');
    const specArray = tech.speciality ? tech.speciality.split(',').map((s: string) => s.trim()) : ['Maintenance Hardware & PC'];
    setSelectedSpecialities(specArray);
    setSignature(tech.signature || null);
    setStamp(tech.stamp || null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialities.length === 0) {
      setFormError('يرجى اختيار تخصص واحد على الأقل للموظف.');
      return;
    }
    setSubmitting(true);
    setFormError(null);

    try {
      if (editingTech) {
        const res = await updateTechnicianAction(editingTech.id, {
          name,
          email,
          phone,
          role,
          speciality: selectedSpecialities,
          username: username || undefined,
          password: password || undefined,
          signature,
          stamp,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchTechs();
        } else {
          setFormError(res.error || 'فشل التحديث');
        }
      } else {
        const res = await createTechnicianAction({
          name,
          email,
          phone,
          role,
          speciality: selectedSpecialities,
          username: username || undefined,
          password: password || undefined,
          signature: signature || undefined,
          stamp: stamp || undefined,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchTechs();
        } else {
          setFormError(res.error || 'فشل الإنشاء');
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTechnician = async (id: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف حساب التقني "${name}"؟`)) {
      await deleteTechnicianAction(id);
      fetchTechs();
    }
  };

  const handleToggleActive = async (tech: any) => {
    await updateTechnicianAction(tech.id, { active: !tech.active });
    fetchTechs();
  };

  const getRoleBadge = (roleStr: string) => {
    if (roleStr.includes('Ingénieur')) {
      return <span className="px-2.5 py-1 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-black uppercase">مهندس (Ingénieur)</span>;
    }
    if (roleStr.includes('Cadre') || roleStr.includes('Responsable')) {
      return <span className="px-2.5 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase">إطار (Cadre IT)</span>;
    }
    return <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-black uppercase">تقني (Technicien)</span>;
  };

  const filtered = technicians.filter((tech) => {
    const matchesSearch =
      tech.name.toLowerCase().includes(search.toLowerCase()) ||
      tech.email.toLowerCase().includes(search.toLowerCase()) ||
      (tech.username && tech.username.toLowerCase().includes(search.toLowerCase())) ||
      (tech.speciality && tech.speciality.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === 'ALL' ||
      (roleFilter === 'INGENIEUR' && tech.role.includes('Ingénieur')) ||
      (roleFilter === 'CADRE' && (tech.role.includes('Cadre') || tech.role.includes('Responsable'))) ||
      (roleFilter === 'TECHNICIEN' && !tech.role.includes('Ingénieur') && !tech.role.includes('Cadre'));

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20 text-white">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">طاقم الإعلام الآلي والإمضاءات الرسمية</h1>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                تقنيون ومهندسون معتمدون · الأختام والتوقيعات الرقمية للتدخلات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقني / مهندس جديد</span>
          </button>
          <button
            onClick={fetchTechs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-navy-900 border border-navy-800 rounded-3xl">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث بالاسم، البريد، اسم المستخدم أو التخصص..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs placeholder-slate-500 focus:border-purple-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-purple-500 font-bold"
          >
            <option value="ALL">جميع الرتب</option>
            <option value="TECHNICIEN">تقنيون (Techniciens)</option>
            <option value="INGENIEUR">مهندسون (Ingénieurs)</option>
            <option value="CADRE">إطارات ومسؤولون (Cadres IT)</option>
          </select>
        </div>
      </div>

      {/* Technicians Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-xs text-slate-400">جاري تحميل بيانات طاقم الإعلام الآلي...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-navy-900 border border-navy-800 rounded-3xl space-y-3">
          <Wrench className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-bold text-white">لم يتم العثور على أي تقني</p>
          <p className="text-xs text-slate-400">أضف تقنياً جديداً لتمكينه من التوقيع والختم على محاضر التدخل.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((tech) => {
            const specArray = tech.speciality ? tech.speciality.split(',').map((s: string) => s.trim()) : [];
            return (
              <div
                key={tech.id}
                className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between hover:border-purple-500/40 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top row: Avatar, Name, Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-lg font-black shrink-0 shadow-md">
                        {tech.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-white text-base leading-snug">{tech.name}</h3>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(tech)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border transition-colors ${
                              tech.active !== false
                                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                            }`}
                          >
                            {tech.active !== false ? 'نشط' : 'معطّل'}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 font-semibold">{tech.role}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setPreviewTech(tech)}
                        className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-purple-400 transition-colors"
                        title="معاينة بطاقة الاعتماد والختم"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(tech)}
                        className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-300 hover:text-white transition-colors"
                        title="تعديل الحساب والإمضاء"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTechnician(tech.id, tech.name)}
                        className="p-1.5 rounded-lg bg-navy-950 text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="حذف التقني"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grade Badge */}
                  <div>
                    {getRoleBadge(tech.role)}
                  </div>

                  {/* Contact Info & Username */}
                  <div className="bg-navy-950 rounded-2xl p-3 border border-navy-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">البريد:</span>
                      <span className="font-mono text-slate-200 text-right">{tech.email}</span>
                    </div>
                    {tech.username && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">المستخدم:</span>
                        <span className="font-mono text-purple-300 font-bold">{tech.username}</span>
                      </div>
                    )}
                    {tech.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">الهاتف:</span>
                        <span className="font-mono text-slate-200">{tech.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Signature & Stamp Visual Box */}
                  <div className="grid grid-cols-2 gap-3 bg-navy-950/60 p-3 rounded-2xl border border-navy-800/80">
                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <PenTool className="w-3.5 h-3.5 text-sky-400" />
                        التوقيع الرقمي
                      </span>
                      <div className="h-24 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                        {tech.signature ? (
                          <img src={tech.signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">غير مدرج</span>
                        )}
                      </div>
                    </div>

                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        الختم الرسمي
                      </span>
                      <div className="h-24 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                        {tech.stamp ? (
                          <img src={tech.stamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-[10px] text-slate-400 font-bold">غير مدرج</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Multiple Specialities Pills */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">التخصصات والمهارات المسندة ({specArray.length}):</p>
                    <div className="flex flex-wrap gap-1.5">
                      {specArray.map((spec: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 rounded-xl bg-navy-950 border border-navy-800 text-purple-300 text-[11px] font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3 text-purple-400" />
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Workload Stats */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-navy-800 mt-4">
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-amber-400 font-bold block">التدخلات النشطة</span>
                    <span className="text-xl font-black text-amber-300">{tech.activeTickets || 0}</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold block">التدخلات المحلولة</span>
                    <span className="text-xl font-black text-emerald-300">{tech.resolvedTickets || 0}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT TECHNICIAN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-navy-800 bg-navy-950/70">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingTech ? 'تعديل بيانات التقني والإمضاء' : 'إضافة موظف جديد بمصلحة الإعلام الآلي'}
                  </h3>
                  <p className="text-xs text-purple-400 font-bold">الحساب التقني، التوقيع الرقمي والختم الرسمي</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-navy-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4 text-xs font-semibold flex-1">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="text-slate-300 block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karim Benali"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1">البريد الإلكتروني المهني *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="k.benali@enterprise.com"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 XX XX XX"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Login credentials: Username & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-navy-950/70 p-3 rounded-2xl border border-navy-800">
                <div>
                  <label className="text-purple-300 block mb-1 font-bold">اسم المستخدم لتسجيل الدخول</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="karim.it"
                    className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-purple-300 block mb-1 font-bold">
                    {editingTech ? 'كلمة مرور جديدة (اختياري)' : 'كلمة المرور الأولية *'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={editingTech ? 'اتركه فارغاً للإبقاء عليها' : 'Tech2026!'}
                    required={!editingTech}
                    className="w-full bg-navy-900 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>
              </div>

              {/* Role / Grade Select */}
              <div>
                <label className="text-slate-300 block mb-1">الرتبة / الصفة الوظيفية (Role & Grade) *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500 font-bold"
                >
                  {AVAILABLE_ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Multiple Specialities Selection Checkboxes */}
              <div>
                <label className="text-slate-300 block mb-2">
                  التخصصات التقنية والمهارات (يمكن تحديد عدة تخصصات) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-navy-950 border border-navy-750 rounded-2xl p-3">
                  {AVAILABLE_SPECIALITIES.map((spec) => {
                    const isChecked = selectedSpecialities.includes(spec);
                    return (
                      <div
                        key={spec}
                        onClick={() => toggleSpeciality(spec)}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition-all text-xs font-bold ${
                          isChecked
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-navy-900/60 border-navy-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                          isChecked ? 'bg-purple-500 border-purple-400 text-white' : 'border-slate-600'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="min-w-0 truncate">{spec}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Digital Signature & Official Stamp */}
              <div className="pt-2 border-t border-navy-800 space-y-2">
                <label className="block font-bold text-purple-400">التوقيع الرقمي والختم الرسمي للتقني (الحجم الطبيعي المعتمد):</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Signature */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <PenTool className="w-3.5 h-3.5 text-sky-400" />
                      التوقيع الرقمي
                    </span>
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
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold transition-colors"
                    >
                      {signature ? 'تعديل التوقيع' : 'رسم / رفع التوقيع'}
                    </button>
                  </div>

                  {/* Stamp */}
                  <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                    <span className="font-bold text-slate-300 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      الختم الرسمي للمصلحة
                    </span>
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
                      className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-colors"
                    >
                      {stamp ? 'تعديل الختم' : 'توليد / رفع ختم'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-navy-800 text-slate-300 font-bold hover:bg-navy-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black hover:opacity-90 disabled:opacity-50 shadow-lg shadow-purple-500/20"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>{editingTech ? 'حفظ التعديلات' : 'حفظ الموظف الجديد'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW CREDENTIAL MODAL */}
      {previewTech && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-navy-750 rounded-3xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                بطاقة الاعتماد الرسمية للتقني
              </h3>
              <button
                onClick={() => setPreviewTech(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white text-slate-900 shadow-xl space-y-4 border-2 border-purple-500/40">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-black text-base text-slate-900">{previewTech.name}</h4>
                  <p className="text-xs text-purple-700 font-bold">{previewTech.role}</p>
                  <p className="text-xs text-slate-600 font-mono">{previewTech.email}</p>
                  {previewTech.phone && <p className="text-xs text-slate-500 font-mono">{previewTech.phone}</p>}
                </div>
                <div className="px-2 py-1 rounded bg-purple-100 text-purple-800 font-black text-[10px] uppercase">
                  IT STAFF
                </div>
              </div>

              {/* Specialities in card */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">المجالات والمهارات:</span>
                <p className="text-xs text-slate-800 font-semibold">{previewTech.speciality || 'Généraliste'}</p>
              </div>

              {/* Signature & Stamp preview */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">التوقيع الرقمي</span>
                  <div className="h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                    {previewTech.signature ? (
                      <img src={previewTech.signature} alt="Sig" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">غير معتمد</span>
                    )}
                  </div>
                </div>

                <div className="text-center space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">الختم الرسمي</span>
                  <div className="h-28 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 shadow-inner">
                    {previewTech.stamp ? (
                      <img src={previewTech.stamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
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
                onClick={() => setPreviewTech(null)}
                className="px-5 py-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature & Stamp Studio Modals */}
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
        defaultOrgName="DIRECTION DES SYSTEMES D'INFORMATION"
        defaultServiceName="SERVICE MAINTENANCE & SUPPORT IT"
        defaultUserName={name || 'TECHNICIEN IT'}
      />
    </div>
  );
}
