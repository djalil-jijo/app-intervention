'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createReportSchema, CreateReportInput } from '@/lib/validations';
import { createReportAction } from '@/app/actions/reports';
import { X, FileCheck, Loader2, AlertCircle, CheckCircle2, Download, Printer, User, Wrench, FileText, Check } from 'lucide-react';
import { UnitTypeBadge } from './UnitTypeBadge';
import { PriorityBadge } from './PriorityBadge';

interface TicketData {
  id:            string;
  ticketNumber:  string;
  fullName:      string;
  functionTitle?: string | null;
  service:       string;
  unitType:      string;
  unitName:      string;
  equipment:     string;
  ipAddress?:    string | null;
  serialNumber?: string | null;
  priority:      string;
  description:   string;
}

interface ReportFormModalProps {
  ticket:    TicketData | null;
  isOpen:    boolean;
  onClose:   () => void;
  onSuccess: () => void;
}

const FINAL_STATUS_OPTIONS = [
  'Résolu avec succès',
  'Matériel remplacé et testé',
  'Solution temporaire appliquée',
  'Reconfiguration terminée',
  'Réinstallation système effectuée',
  'Mise à jour appliquée et validée',
];

export const ReportFormModal: React.FC<ReportFormModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [createdReportData, setCreatedReportData] = useState<{
    ticketId:    string;
    reportNumber: string;
    ticketNumber: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateReportInput>({
    resolver: zodResolver(createReportSchema),
    defaultValues: {
      ticketId:      ticket?.id || '',
      technicianName: '',
      diagnosis:     '',
      actionsTaken:  '',
      partsReplaced: '',
      finalStatus:   'Résolu avec succès',
    },
  });

  React.useEffect(() => {
    if (ticket) {
      reset({
        ticketId:      ticket.id,
        technicianName: '',
        diagnosis:     '',
        actionsTaken:  '',
        partsReplaced: '',
        finalStatus:   'Résolu avec succès',
      });
      setErrorMsg(null);
      setCreatedReportData(null);
    }
  }, [ticket, reset]);

  if (!isOpen || !ticket) return null;

  const onSubmit = async (data: CreateReportInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await createReportAction({ ...data, ticketId: ticket.id });
      if (res.success && res.data) {
        setCreatedReportData({
          ticketId:     ticket.id,
          reportNumber: res.data.reportNumber,
          ticketNumber: res.data.ticketNumber,
        });
        onSuccess();
      } else {
        setErrorMsg(res.error || 'Une erreur est survenue lors de la sauvegarde.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur imprévue lors de la soumission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl bg-navy-950/90 border border-navy-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all font-medium';

  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-navy-750 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] backdrop-blur-xl">

        {/* ── Header ── */}
        <div className="px-6 py-4 bg-navy-950/90 border-b border-navy-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-md">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-100">Fiche d&apos;Intervention Informatique</h3>
              <p className="text-xs text-slate-400 font-medium">
                Ticket <span className="text-sky-400 font-mono font-bold">{ticket.ticketNumber}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-navy-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">

          {/* SUCCESS */}
          {createdReportData ? (
            <div className="py-10 px-4 text-center space-y-6 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-2xl flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <h4 className="text-2xl font-black text-white">
                  Rapport N° {createdReportData.reportNumber} Généré !
                </h4>
                <p className="text-sm text-slate-300">
                  L&apos;intervention sur le ticket{' '}
                  <span className="text-sky-400 font-mono font-bold">{ticket.ticketNumber}</span>{' '}
                  a été validée et clôturée avec succès.
                </p>
              </div>
              <div className="p-4 bg-navy-950/90 rounded-2xl border border-navy-800 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
                <a
                  href={`/api/tickets/${ticket.id}/pdf`}
                  download
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger Fiche PDF</span>
                </a>
                <a
                  href={`/api/tickets/${ticket.id}/pdf?inline=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-100 font-bold text-sm border border-navy-600 transition-all"
                >
                  <Printer className="w-4 h-4 text-sky-400" />
                  <span>Aperçu & Imprimer</span>
                </a>
              </div>
            </div>
          ) : (
            <>
              {/* Ticket Summary Card */}
              <div className="bg-navy-950/80 rounded-2xl p-4 border border-navy-800 space-y-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-extrabold text-slate-100 text-sm">{ticket.fullName}</p>
                    <p className="text-xs text-slate-400">{ticket.service}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <UnitTypeBadge unitType={ticket.unitType} unitName={ticket.unitName} showName />
                    <PriorityBadge priority={ticket.priority} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-navy-800/80">
                  <div>
                    <span className="text-slate-500 font-medium">Équipement:</span>{' '}
                    <span className="font-bold text-slate-200">{ticket.equipment}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">IP / N° Série:</span>{' '}
                    <span className="font-mono text-slate-300 font-bold">
                      {ticket.ipAddress || 'N/A'}{ticket.serialNumber ? ` (${ticket.serialNumber})` : ''}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-slate-300 bg-navy-900/90 p-3 rounded-xl border border-navy-800 leading-relaxed">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold block mb-1">Dysfonctionnement Signalé :</span>
                  {ticket.description}
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Report Form */}
              <form id="report-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Technicien */}
                <div>
                  <label className={labelCls}>
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    Technicien Intervenant <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Sofiane Benali — Support N2"
                    {...register('technicianName')}
                    className={inputCls}
                  />
                  {errors.technicianName && (
                    <p className="text-xs text-rose-400 mt-1 font-medium">{errors.technicianName.message}</p>
                  )}
                </div>

                {/* Diagnostic */}
                <div>
                  <label className={labelCls}>
                    <FileText className="w-3.5 h-3.5 text-sky-400" />
                    Diagnostic Technique <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Description précise de l'analyse et de la cause racine identifiée..."
                    {...register('diagnosis')}
                    className={inputCls}
                  />
                  {errors.diagnosis && (
                    <p className="text-xs text-rose-400 mt-1 font-medium">{errors.diagnosis.message}</p>
                  )}
                </div>

                {/* Actions */}
                <div>
                  <label className={labelCls}>
                    <Wrench className="w-3.5 h-3.5 text-sky-400" />
                    Actions Réalisées & Correctifs <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Réinstallations, configurations réseau, nettoyages, remplacements effectués..."
                    {...register('actionsTaken')}
                    className={inputCls}
                  />
                  {errors.actionsTaken && (
                    <p className="text-xs text-rose-400 mt-1 font-medium">{errors.actionsTaken.message}</p>
                  )}
                </div>

                {/* Parts */}
                <div>
                  <label className={labelCls}>
                    Pièces / Équipements Remplacés <span className="text-slate-500 font-normal lowercase">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SSD NVMe 512GB Kingston, Câble Patch RJ45 3m"
                    {...register('partsReplaced')}
                    className={inputCls}
                  />
                </div>

                {/* Final Status */}
                <div>
                  <label className={labelCls}>
                    Statut Final de l&apos;Intervention <span className="text-rose-400">*</span>
                  </label>
                  <select {...register('finalStatus')} className={inputCls}>
                    {FINAL_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </form>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 bg-navy-950/90 border-t border-navy-800 flex items-center justify-end gap-3 shrink-0">
          {createdReportData ? (
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-navy-800 hover:bg-navy-750 text-slate-200 border border-navy-700 transition-colors"
            >
              Fermer
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-slate-200 hover:bg-navy-800 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                form="report-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-950/50 disabled:opacity-50 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération PDF...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 text-emerald-200" />
                    <span>Valider & Générer Fiche PDF</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
