'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getTechniciansAction, createTechnicianAction, deleteTechnicianAction } from '@/app/actions/technicians';
import { Users, Plus, RefreshCw, Mail, Phone, ShieldCheck, Wrench, CheckCircle2, Clock, X, Trash2, Award, Check } from 'lucide-react';

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Technicien en Informatique');
  const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>(['Maintenance Hardware & PC']);

  const [submitting, setSubmitting] = useState(false);

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

  const handleCreateTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSpecialities.length === 0) {
      alert('يرجى اختيار تخصص واحد على الأقل للموظف.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createTechnicianAction({
        name,
        email,
        phone,
        role,
        speciality: selectedSpecialities,
      });
      if (res.success) {
        setIsAddModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setRole('Technicien en Informatique');
        setSelectedSpecialities(['Maintenance Hardware & PC']);
        fetchTechs();
      } else {
        alert(res.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTechnician = async (id: string, name: string) => {
    if (confirm(`Voulez-vous vraiment supprimer le profil de ${name} ?`)) {
      await deleteTechnicianAction(id);
      fetchTechs();
    }
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة طاقم وموظفي الإعلام الآلي</h1>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">IT Personnel, Engineers & Technicians Directory</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تقني / مهندس / إطار جديد</span>
          </button>
          <button
            onClick={fetchTechs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Technicians Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">جاري تحميل بيانات طاقم الإعلام الآلي...</div>
      ) : technicians.length === 0 ? (
        <div className="py-12 text-center text-slate-500">لا يوجد موظفون مسجلون حالياً.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {technicians.map((tech) => {
            const specArray = tech.speciality ? tech.speciality.split(',').map((s: string) => s.trim()) : [];
            return (
              <div key={tech.id} className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-lg font-black shrink-0">
                        {tech.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-white text-base leading-snug">{tech.name}</h3>
                        <p className="text-[11px] text-slate-400 font-semibold">{tech.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteTechnician(tech.id, tech.name)}
                      className="p-1.5 rounded-lg bg-navy-950 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="حذف الموظف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Grade Badge */}
                  <div>
                    {getRoleBadge(tech.role)}
                  </div>

                  {/* Contact Info */}
                  <div className="bg-navy-950 rounded-2xl p-3 border border-navy-800 space-y-1.5 text-xs text-slate-300 dir-ltr text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-mono text-slate-200">{tech.email}</span>
                      <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    </div>
                    {tech.phone && (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-mono text-slate-200">{tech.phone}</span>
                        <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      </div>
                    )}
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
                    <span className="text-xl font-black text-amber-300">{tech.activeTickets}</span>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-2.5 text-center">
                    <span className="text-[10px] text-emerald-400 font-bold block">التدخلات المحلولة</span>
                    <span className="text-xl font-black text-emerald-300">{tech.resolvedTickets}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-lg font-black text-white">إضافة موظف جديد بمصلحة الإعلام الآلي</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTechnician} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Karim Benali"
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">البريد الإلكتروني المهني *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="k.benali@enterprise.com"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0550 XX XX XX"
                    className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Role / Grade Select */}
              <div>
                <label className="text-slate-400 block mb-1">الرتبة / الصفة الوظيفية (Role & Grade) *</label>
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
                <label className="text-slate-400 block mb-2">
                  التخصصات التقنية والمهارات (يمكن تحديد عدة تخصصات) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-navy-950 border border-navy-750 rounded-2xl p-3">
                  {AVAILABLE_SPECIALITIES.map((spec) => {
                    const isChecked = selectedSpecialities.includes(spec);
                    return (
                      <label
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
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-navy-800 text-slate-300 font-bold hover:bg-navy-750"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : 'حفظ الموظف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
