'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createTicketSchema,
  CreateTicketInput,
  TICKET_CATEGORIES,
} from '@/lib/validations';
import { createTicketAction } from '@/app/actions/tickets';
import {
  Send, Loader2, CheckCircle2, AlertCircle,
  Building2, User, Monitor, Network, FileText,
  AlertTriangle, Barcode, Phone, Mail, Briefcase,
  Tag, UserCheck, Download, Printer, MapPin, Factory,
  Sparkles, ShieldCheck, ArrowRight, Zap, Check
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
  const [isSubmitting,    setIsSubmitting]    = useState(false);
  const [errorMsg,        setErrorMsg]        = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{ id: string; number: string } | null>(null);

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

  const selectedUnitType = watch('unitType');
  const selectedPriority = watch('priority');
  const currentUnitOpt   = UNIT_TYPE_OPTIONS.find((o) => o.value === selectedUnitType) ?? UNIT_TYPE_OPTIONS[0];

  const onSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await createTicketAction(data);
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
            Nouveau Ticket d&apos;Assistance
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <FileText className="w-8 h-8 text-sky-400 shrink-0" />
            Demande d&apos;Intervention Informatique
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
            Renseignez les détails du dysfonctionnement rencontré. Un ticket certifié sera généré et transmis immédiatement à l&apos;équipe IT Support.
          </p>
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
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Confirmation d&apos;enregistrement</span>
              <h3 className="text-2xl font-extrabold text-emerald-200">
                Demande Enregistrée avec Succès !
              </h3>
              <p className="text-sm text-slate-300">
                Votre ticket d&apos;intervention certifié a été créé sous le numéro :
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
              <span>Télécharger Fiche PDF Certifiée</span>
            </a>
            <a
              href={`/api/tickets/${submittedTicket.id}/pdf?type=ticket&inline=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-100 font-bold text-sm border border-navy-600 transition-all"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Aperçu & Imprimer</span>
            </a>
          </div>

          <div className="pt-2 border-t border-emerald-900/60 flex items-center justify-between text-xs">
            <button
              onClick={() => setSubmittedTicket(null)}
              className="font-bold text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1.5"
            >
              ← Soumettre une autre demande
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
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  Fonction / Poste <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ex: Responsable Commercial"
                  {...register('functionTitle')}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Direction / Service <span className="text-rose-400 ml-0.5">*</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Service Comptabilité & Finance"
                {...register('service')}
                className={inputCls}
              />
              {errors.service && (
                <p className="text-xs text-rose-400 mt-1 font-medium">{errors.service.message}</p>
              )}
            </div>

            {/* ── Org Hierarchy: UnitType + UnitName ── */}
            <div className="bg-navy-950/80 border border-navy-800 rounded-2xl p-5 space-y-5">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-400" />
                Entité de Rattachement <span className="text-rose-400 ml-0.5">*</span>
              </h3>

              {/* UnitType selector cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {UNIT_TYPE_OPTIONS.map(({ value, label, desc, icon: Icon, color, selectedBg }) => {
                  const isSelected = selectedUnitType === value;
                  return (
                    <button
                      type="button"
                      key={value}
                      onClick={() => setValue('unitType', value as any)}
                      className={`
                        relative flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer
                        ${isSelected
                          ? selectedBg
                          : 'bg-navy-900 border-navy-750 text-slate-400 hover:border-navy-600 hover:text-slate-200'
                        }
                      `}
                    >
                      <Icon className={`w-6 h-6 mb-2 ${isSelected ? color : 'text-slate-500'}`} />
                      <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                        {label}
                      </span>
                      <span className={`text-[11px] mt-0.5 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {desc}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-sky-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              {errors.unitType && (
                <p className="text-xs text-rose-400 font-medium">{errors.unitType.message}</p>
              )}

              {/* UnitName */}
              <div>
                <label className={labelCls}>
                  <currentUnitOpt.icon className={`w-3.5 h-3.5 ${currentUnitOpt.color}`} />
                  Nom de l&apos;entité — {currentUnitOpt.label}{' '}
                  <span className="text-rose-400 ml-0.5">*</span>
                </label>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Téléphone <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: 0555 12 34 56"
                  {...register('phone')}
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
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
            </div>

            <div>
              <label className={labelCls}>
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                Nom du Responsable Hiérarchique <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: M. Ahmed Khelifi — Chef de Service"
                {...register('managerName')}
                className={inputCls}
              />
            </div>
          </div>

          {/* ── Section 2: Équipement & Priorité ── */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-navy-800 pb-3">
              <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h2 className="text-base font-extrabold uppercase tracking-wider text-white">
                Équipement & Priorité
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
    </div>
  );
}
