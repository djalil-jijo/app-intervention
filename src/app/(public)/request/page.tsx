'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTicketSchema,
  CreateTicketInput,
  TICKET_CATEGORIES,
} from '@/lib/validations';
import { createTicketAction } from '@/app/actions/tickets';
import { getCurrentUserAction } from '@/app/actions/auth';
import { SignaturePadModal } from '@/components/ui/SignaturePadModal';
import { StampStudioModal } from '@/components/ui/StampStudioModal';
import { SessionUser } from '@/lib/auth';
import {
  Send, Loader2, CheckCircle2, AlertCircle,
  Building2, User, Monitor, Network, FileText,
  AlertTriangle, Barcode, Phone, Mail, Briefcase,
  Tag, UserCheck, Download, Printer, MapPin, Factory,
  Sparkles, ShieldCheck, ArrowRight, Zap, Check,
  PenTool, Award, Eye
} from 'lucide-react';

const UNIT_TYPE_OPTIONS = [
  {
    value: 'FILIALE',
    label: 'Filiale',
    desc:  'Direction Régionale',
    icon:  Building2,
    color: 'text-indigo-400',
    selectedBg: 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300 shadow-glow-indigo',
    placeholder: 'Ex: Filiale Annaba, Filiale Est...',
  },
  {
    value: 'CIC',
    label: 'CIC',
    desc:  'Direction de Wilaya',
    icon:  MapPin,
    color: 'text-sky-400',
    selectedBg: 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-glow-sky',
    placeholder: 'Ex: CIC Constantine, CIC Sétif...',
  },
  {
    value: 'UPC',
    label: 'UPC',
    desc:  'Unité de Production / Usine',
    icon:  Factory,
    color: 'text-emerald-400',
    selectedBg: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-glow-emerald',
    placeholder: 'Ex: UPC Minoterie Guelma, UPC Mill 3...',
  },
] as const;

const PRIORITY_OPTIONS = [
  {
    value: 'LOW',
    label: 'Basse',
    desc:  'N\'empêche pas le travail quotidien',
    badgeCls: 'border-slate-700 bg-slate-800/60 text-slate-300',
  },
  {
    value: 'MEDIUM',
    label: 'Moyenne',
    desc:  'Perturbation partielle d\'activité',
    badgeCls: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  },
  {
    value: 'URGENT',
    label: 'Urgente',
    desc:  'Impact fort sur la productivité',
    badgeCls: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  },
  {
    value: 'CRITICAL',
    label: 'Critique',
    desc:  'Blocage total de la production',
    badgeCls: 'border-rose-500/50 bg-rose-500/20 text-rose-300 shadow-glow-rose',
  },
] as const;

export default function RequestPage() {
  const [currentUser,     setCurrentUser]     = useState<SessionUser | null>(null);
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; number: string } | null>(null);

  // Digital Signature & Stamp
  const [employeeSignature, setEmployeeSignature] = useState<string | null>(null);
  const [employeeStamp,     setEmployeeStamp]     = useState<string | null>(null);
  const [isSigModalOpen,    setIsSigModalOpen]    = useState(false);
  const [isStampModalOpen,  setIsStampModalOpen]  = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema) as any,
    defaultValues: {
      fullName:      '',
      functionTitle: '',
      service:       '',
      phone:         '',
      email:         '',
      managerName:   '',
      unitType:      'FILIALE',
      unitName:      '',
      category:      'Matériel informatique (PC, imprimante...)',
      equipment:     '',
      ipAddress:     '',
      serialNumber:  '',
      priority:      'MEDIUM',
      description:   '',
    },
  });

  // Pre-fill user data if logged in
  useEffect(() => {
    async function loadUser() {
      const u = await getCurrentUserAction();
      if (u) {
        setCurrentUser(u);
        if (u.name) setValue('fullName', u.name);
        if (u.functionTitle) setValue('functionTitle', u.functionTitle);
        if (u.service) setValue('service', u.service);
        if (u.phone) setValue('phone', u.phone);
        if (u.email) setValue('email', u.email);
        if (u.unitType) setValue('unitType', u.unitType as any);
        if (u.unitName) setValue('unitName', u.unitName);
        if (u.signature) setEmployeeSignature(u.signature);
        if (u.stamp) setEmployeeStamp(u.stamp);
      }
    }
    loadUser();
  }, [setValue]);

  const selectedUnitType = watch('unitType');
  const selectedPriority = watch('priority');
  const currentUnitOpt   = UNIT_TYPE_OPTIONS.find((o) => o.value === selectedUnitType) ?? UNIT_TYPE_OPTIONS[0];

  const onSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await createTicketAction({
        ...data,
        employeeId: currentUser?.employeeId || undefined,
        employeeSignature: employeeSignature || null,
        employeeStamp: employeeStamp || null,
      });

      if (res.success && res.data) {
        setSubmittedTicket({ id: res.data.id, number: res.data.ticketNumber });
        reset();
      } else {
        setErrorMsg(res.error || 'Impossible de créer le ticket.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la soumission du formulaire.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-3 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/25 transition-all shadow-inner';

  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2';

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-8 animate-fade-in-up">

      {/* ── Banner ── */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-750 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-56 h-56 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Nouveau Ticket d&apos;Assistance Certifié
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-sky-400 shrink-0" />
            Demande d&apos;Intervention Informatique
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Renseignez les détails du dysfonctionnement rencontré. Un ticket certifié avec votre visa, émargement et cachet sera transmis immédiatement à l&apos;équipe IT Support.
          </p>

          {/* User authentication status card */}
          {currentUser ? (
            <div className="mt-4 p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-sky-300 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  مرحباً بك {currentUser.name}! تم استيراد بياناتك وسيتم إرفاق إمضائك وختمك المعتمدين تلقائياً بالطلب.
                </span>
              </div>
              <Link
                href="/profile"
                className="shrink-0 px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 border border-sky-400/30 text-[11px] font-extrabold transition-colors"
              >
                تعديل إمضائي / ختمي
              </Link>
            </div>
          ) : (
            <div className="mt-4 p-3.5 rounded-2xl bg-navy-950/80 border border-navy-750 flex items-center justify-between gap-3 text-xs text-slate-300">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                هل لديك حساب موظف مسجل؟ سجّل دخولك لتعبئة بياناتك وإرفاق إمضائك وختمك تلقائياً!
              </span>
              <Link
                href="/login"
                className="shrink-0 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-[11px] shadow-md transition-transform hover:scale-105"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Success Card ── */}
      {submittedTicket && (
        <div className="bg-emerald-950/90 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/40 space-y-6 animate-fade-in backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Confirmation d&apos;enregistrement certifié</span>
              <h3 className="text-2xl font-extrabold text-emerald-200">
                Demande Enregistrée avec Succès !
              </h3>
              <p className="text-sm text-slate-300">
                Votre ticket d&apos;intervention certifié avec signature et cachet a été créé sous le numéro :
              </p>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-navy-950 border border-emerald-500/40 font-mono text-2xl font-black text-emerald-400 tracking-wider shadow-inner">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span>{submittedTicket.number}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-navy-950/90 rounded-2xl border border-navy-800 flex flex-col sm:flex-row items-center gap-3">
            <a
              href={`/api/tickets/${submittedTicket.id}/pdf?type=ticket`}
              download
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>تحميل الاستمارة الموقعة والمختومة PDF</span>
            </a>
            <Link
              href="/track"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-100 font-bold text-sm border border-navy-600 transition-all"
            >
              <ArrowRight className="w-4 h-4 text-sky-400" />
              <span>تتبع حالة الطلب فورياً</span>
            </Link>
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs">
            <button
              onClick={() => setSubmittedTicket(null)}
              className="font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
            >
              ← تقديم طلب تدخل إضافي
            </button>
            <span className="text-slate-400 font-mono">Status: En Attente de Prise en Charge</span>
          </div>
        </div>
      )}

      {/* ── Main Form ── */}
      {!submittedTicket && (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-navy-900/90 border border-navy-750 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-10 backdrop-blur-xl"
        >
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ── Section 1: Demandeur ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
                Informations du Demandeur
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  <User className="w-3.5 h-3.5 text-sky-400" />
                  Nom & Prénom <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Karim Benali"
                  {...register('fullName')}
                  className={inputCls}
                />
                {errors.fullName && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                  Fonction / Poste <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Chef de Département / Ingénieur"
                  {...register('functionTitle')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  Service / Direction <span className="text-rose-400 ml-0.5">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Direction des Finances, RH, Production..."
                  {...register('service')}
                  className={inputCls}
                />
                {errors.service && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{errors.service.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Téléphone / N° Poste <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 0550 12 34 56 / Poste 204"
                  {...register('phone')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Adresse Email <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="email"
                  placeholder="Ex: k.benali@enterprise.com"
                  {...register('email')}
                  className={inputCls}
                />
                {errors.email && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Responsable Hiérarchique <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: M. Hadj Ahmed"
                  {...register('managerName')}
                  className={inputCls}
                />
              </div>
            </div>

            {/* Structure / Entité Selector */}
            <div className="space-y-3 pt-2">
              <label className={labelCls}>
                <Building2 className="w-3.5 h-3.5 text-sky-400" />
                Type de Structure / Entité <span className="text-rose-400 ml-0.5">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UNIT_TYPE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedUnitType === opt.value;
                  return (
                    <button
                      type="button"
                      key={opt.value}
                      onClick={() => setValue('unitType', opt.value as any)}
                      className={`
                        p-4 rounded-2xl border text-left flex items-start gap-3 transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? `${opt.selectedBg} ring-2 ring-sky-400/40 scale-[1.02]`
                          : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:bg-navy-850 hover:text-slate-200'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/10' : 'bg-navy-800'}`}>
                        <Icon className={`w-5 h-5 ${opt.color}`} />
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-white">{opt.label}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder={currentUnitOpt.placeholder}
                  {...register('unitName')}
                  className={inputCls}
                />
                {errors.unitName && (
                  <p className="text-xs text-rose-400 mt-1 font-medium">{errors.unitName.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Section 2: Matériel & Incident ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
                Détails du Matériel &amp; Degré d&apos;Urgence
              </h2>
            </div>

            <div>
              <label className={labelCls}>
                <Tag className="w-3.5 h-3.5 text-sky-400" />
                Catégorie de la Demande <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <select {...register('category')} className={inputCls}>
                {TICKET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>
                <Monitor className="w-3.5 h-3.5 text-sky-400" />
                Équipement / Matériel Concerné <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: PC Portable Dell Latitude 5420 / Imprimante HP LaserJet"
                {...register('equipment')}
                className={inputCls}
              />
              {errors.equipment && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.equipment.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  <Network className="w-3.5 h-3.5 text-slate-400" />
                  Adresse IP <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: 192.168.1.45"
                  {...register('ipAddress')}
                  className={`${inputCls} font-mono`}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                  N° de Série / Tag <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: SN-8492048-DX"
                  {...register('serialNumber')}
                  className={`${inputCls} font-mono`}
                />
              </div>
            </div>

            {/* Visual priority selectors */}
            <div>
              <label className={labelCls}>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Niveau d&apos;Urgence / Priorité <span className="text-rose-400 ml-0.5">*</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {PRIORITY_OPTIONS.map(({ value, label, desc, badgeCls }) => {
                  const isSelected = selectedPriority === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setValue('priority', value as any)}
                      className={`
                        p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? `${badgeCls} ring-2 ring-sky-400/30 scale-[1.02]`
                          : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:bg-navy-850 hover:text-slate-200'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black uppercase tracking-wider">{label}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>}
                      </div>
                      <span className="text-[10px] leading-tight text-slate-400">{desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Section 3: Description ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
                Description du Dysfonctionnement
              </h2>
            </div>

            <div>
              <label className={labelCls}>
                Description Détaillée du Problème <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <textarea
                rows={5}
                placeholder="Décrivez les symptômes observés, les messages d'erreur, depuis quand le problème persiste et les éventuels événements déclencheurs..."
                {...register('description')}
                className={inputCls}
              />
              {errors.description && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* ── Section 4: Signature & Stamp (الإمضاء والختم الرقمي المعتمد) ── */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold text-sm flex items-center justify-center">
                  4
                </div>
                <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
                  التأشيرة والإمضاء والختم الرقمي المعتمد
                </h2>
              </div>
              <span className="text-xs text-sky-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                يوضعان تلقائياً في وثيقة PDF الرسمية
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Employee Signature Card */}
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-navy-800 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <PenTool className="w-3.5 h-3.5 text-sky-400" />
                    توقيع طالب التدخل
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSigModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[11px] font-bold transition-colors"
                  >
                    {employeeSignature ? 'تغيير التوقيع' : 'رسم / رفع التوقيع'}
                  </button>
                </div>

                <div className="w-full h-24 rounded-xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner relative overflow-hidden">
                  {employeeSignature ? (
                    <img src={employeeSignature} alt="Signature" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400 space-y-1">
                      <PenTool className="w-5 h-5 mx-auto opacity-40" />
                      <p className="text-[10px]">انقر على الزر لرسم أو استيراد توقيعك</p>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono select-none">
                    Visa Demandeur
                  </span>
                </div>
              </div>

              {/* Employee Stamp Card */}
              <div className="p-4 rounded-2xl bg-navy-950/90 border border-navy-800 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    الختم الرسمي للمصلحة
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsStampModalOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold transition-colors"
                  >
                    {employeeStamp ? 'تغيير الختم' : 'توليد / رفع الختم'}
                  </button>
                </div>

                <div className="w-full h-24 rounded-xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner relative overflow-hidden">
                  {employeeStamp ? (
                    <img src={employeeStamp} alt="Official Stamp" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400 space-y-1">
                      <Award className="w-5 h-5 mx-auto opacity-40" />
                      <p className="text-[10px]">انقر لتوليد ختم دائري رسمي أو رفع صورة الختم</p>
                    </div>
                  )}
                  <span className="absolute bottom-1 right-2 text-[8px] text-slate-400 font-mono select-none">
                    Cachet Direction
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Submit CTA ── */}
          <div className="pt-4 flex items-center justify-end border-t border-navy-800">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-2xl text-base font-black bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-xl shadow-sky-950/60 hover:shadow-glow-sky disabled:opacity-50 transition-all hover:scale-[1.02]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Traitement de la demande...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Envoyer la Demande d&apos;Intervention</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Signature and Stamp Modals */}
      <SignaturePadModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSave={(sig) => setEmployeeSignature(sig)}
        initialSignature={employeeSignature}
      />
      <StampStudioModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSave={(st) => setEmployeeStamp(st)}
        initialStamp={employeeStamp}
        defaultOrgName={watch('unitName') || 'ENTREPRISE INDUSTRIELLE'}
        defaultServiceName={watch('service') || 'DIRECTION FINANCES'}
        defaultUserName={watch('fullName') || 'DEMANDEUR'}
      />
    </div>
  );
}
