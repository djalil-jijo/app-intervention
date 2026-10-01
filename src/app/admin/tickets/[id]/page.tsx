'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getTicketsAction,
  updateTicketStatusAction,
  assignTechnicianToTicketAction,
  signTicketAsTechnicianAction,
} from '@/app/actions/tickets';
import { getTechniciansAction } from '@/app/actions/technicians';
import { addTicketCommentAction, getTicketCommentsAction } from '@/app/actions/comments';
import { ReportFormModal } from '@/components/admin/ReportFormModal';
import { SignaturePadModal } from '@/components/ui/SignaturePadModal';
import { StampStudioModal } from '@/components/ui/StampStudioModal';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { PriorityBadge } from '@/components/admin/PriorityBadge';
import { SiteBadge } from '@/components/admin/SiteBadge';
import {
  ArrowLeft, User, Building2, Cpu, Clock, CheckCircle2, Wrench,
  FileText, Download, MessageSquare, Send, Loader2, AlertTriangle,
  Calendar, Hash, Phone, Mail, RefreshCw, Tag, Activity,
  ChevronLeft, Shield, Edit3, UserCheck, PenTool, Award, Check, X
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING',     label: 'قيد الانتظار', icon: Clock },
  { key: 'IN_PROGRESS', label: 'قيد المعالجة', icon: Wrench },
  { key: 'RESOLVED',    label: 'تم الحل',      icon: CheckCircle2 },
  { key: 'CLOSED',      label: 'مغلقة',        icon: Shield },
];

export default function TicketDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const id      = params?.id as string;

  const [ticket,       setTicket]       = useState<any | null>(null);
  const [technicians,  setTechnicians]  = useState<any[]>([]);
  const [comments,     setComments]     = useState<any[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [newComment,   setNewComment]   = useState('');
  const [commentAuthor,setCommentAuthor]= useState('التقني المكلف');
  const [addingComment,setAddingComment]= useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [changingStatus,setChangingStatus] = useState(false);
  const [assigningTech,  setAssigningTech] = useState(false);

  const [isSignTicketModalOpen, setIsSignTicketModalOpen] = useState(false);
  const [techSig, setTechSig] = useState<string | null>(null);
  const [techStamp, setTechStamp] = useState<string | null>(null);
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [savingSignatures, setSavingSignatures] = useState(false);

  const handleSaveTicketSignatures = async () => {
    setSavingSignatures(true);
    await signTicketAsTechnicianAction(id, techSig, techStamp);
    setSavingSignatures(false);
    setIsSignTicketModalOpen(false);
    loadData();
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ticketsRes, techRes, commentsRes] = await Promise.all([
        getTicketsAction(),
        getTechniciansAction(),
        getTicketCommentsAction(id),
      ]);
      if (ticketsRes.success && ticketsRes.data) {
        const found = ticketsRes.data.find((t: any) => t.id === id);
        if (!found) { router.push('/admin/tickets'); return; }
        setTicket(found);
      }
      if (techRes.success && techRes.data) setTechnicians(techRes.data);
      if (commentsRes.success && commentsRes.data) setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleStatusChange = async (newStatus: any) => {
    setChangingStatus(true);
    await updateTicketStatusAction(id, newStatus);
    setChangingStatus(false);
    loadData();
  };

  const handleAssign = async (techId: string) => {
    setAssigningTech(true);
    await assignTechnicianToTicketAction(id, techId === 'NONE' ? null : techId);
    setAssigningTech(false);
    loadData();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setAddingComment(true);
    await addTicketCommentAction({ ticketId: id, author: commentAuthor, content: newComment.trim() });
    setNewComment('');
    setAddingComment(false);
    const res = await getTicketCommentsAction(id);
    if (res.success) setComments(res.data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  if (!ticket) return null;

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === ticket.status);

  return (
    <div className="space-y-6 pb-12">

      {/* Breadcrumb + Back */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Link href="/admin/tickets" className="hover:text-sky-400 transition-colors flex items-center gap-1">
          <ChevronLeft className="w-3.5 h-3.5" />
          التذاكر
        </Link>
        <span>/</span>
        <span className="font-mono text-sky-400">{ticket.ticketNumber}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-navy-900/60 p-6 rounded-3xl border border-navy-800 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{ticket.equipment}</h1>
              <p className="font-mono text-sky-400 text-sm font-bold">{ticket.ticketNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SiteBadge unitType={ticket.unitType} unitName={ticket.unitName} />
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-navy-800 border border-navy-750 text-[11px] text-slate-400 font-bold">
              <Tag className="w-3 h-3" />
              {ticket.interventionType === 'CURATIVE' ? 'علاجي' : ticket.interventionType === 'PREVENTIVE' ? 'وقائي' : 'تثبيت'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
          {!ticket.report && (
            <button
              onClick={() => setIsReportOpen(true)}
              id="btn-create-report"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 text-xs font-bold transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              تحرير المحضر
            </button>
          )}
          <a
            href={`/api/tickets/${ticket.id}/pdf${ticket.report ? '' : '?type=ticket'}`}
            target="_blank"
            rel="noreferrer"
            id="btn-download-pdf"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            PDF
          </a>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">مسار معالجة التذكرة</p>
        <div className="relative flex items-start justify-between">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-navy-800 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700 z-0"
            style={{ width: `${Math.max(0, (currentStepIdx / 3) * 100)}%` }}
          />
          {STATUS_STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isDone   = i < currentStepIdx;
            const isActive = i === currentStepIdx;
            return (
              <button
                key={step.key}
                onClick={() => !changingStatus && handleStatusChange(step.key as any)}
                disabled={changingStatus}
                title={`تغيير الحالة إلى: ${step.label}`}
                className={`relative z-10 flex flex-col items-center gap-1.5 flex-1 group disabled:cursor-not-allowed`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isDone   ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-900/50' :
                  isActive ? 'bg-sky-500/20 border-sky-400 shadow-lg shadow-sky-900/50' :
                  'bg-navy-900 border-navy-700 group-hover:border-navy-600'
                }`}>
                  <StepIcon className={`w-4 h-4 ${isDone ? 'text-white' : isActive ? 'text-sky-400' : 'text-slate-600'}`} />
                </div>
                <p className={`text-[11px] font-black text-center ${
                  isDone ? 'text-emerald-400' : isActive ? 'text-white' : 'text-slate-600'
                }`}>{step.label}</p>
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600 text-center mt-2 font-medium">
          انقر على أي خطوة لتغيير حالة التذكرة مباشرة
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-5">

          {/* Requester Info */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-indigo-400" />
              بيانات صاحب الطلب
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'الاسم الكامل', value: ticket.fullName },
                { label: 'المصلحة', value: ticket.service },
                { label: 'المنصب', value: ticket.functionTitle || '—' },
                { label: 'المسؤول المباشر', value: ticket.managerName || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-navy-850/60 border border-navy-750 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="font-bold text-white text-sm">{value}</p>
                </div>
              ))}
              {ticket.phone && (
                <div className="bg-navy-850/60 border border-navy-750 rounded-2xl p-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">الهاتف</p>
                    <p className="font-mono text-sky-300 font-bold">{ticket.phone}</p>
                  </div>
                </div>
              )}
              {ticket.email && (
                <div className="bg-navy-850/60 border border-navy-750 rounded-2xl p-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">البريد</p>
                    <p className="text-indigo-300 font-bold text-xs">{ticket.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Equipment & Problem */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-sky-400" />
              بيانات العتاد والمشكلة
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { label: 'الجهاز المعني', value: ticket.equipment },
                { label: 'الفئة', value: ticket.category },
                { label: 'الرقم التسلسلي', value: ticket.serialNumber || '—' },
                { label: 'عنوان IP', value: ticket.ipAddress || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-navy-850/60 border border-navy-750 rounded-2xl p-3">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="font-mono font-bold text-white text-sm">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-navy-850/60 border border-navy-750 rounded-2xl p-4">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1.5">وصف المشكلة</p>
              <p className="text-slate-300 text-sm leading-relaxed">{ticket.description}</p>
            </div>
          </div>

          {/* Signatures & Official Stamps */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <PenTool className="w-3.5 h-3.5 text-sky-400" />
                الإمضاءات والأختام الرقمية الرسمية المعتمدة
              </p>
              <span className="text-[10px] text-slate-500 font-bold">
                تدرج تلقائياً في وصل التدخل ومحضر الصيانة
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Demandeur Side */}
              <div className="p-4 rounded-2xl bg-navy-850/70 border border-navy-750 space-y-3">
                <div className="flex items-center justify-between border-b border-navy-750/80 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    صاحب الطلب: {ticket.fullName}
                  </span>
                  <span className="text-[10px] text-sky-400 font-bold">المستخدم</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">التوقيع الرقمي</span>
                    <div className="h-28 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {ticket.employeeSignature || ticket.employee?.signature ? (
                        <img src={ticket.employeeSignature || ticket.employee?.signature} alt="Emp Sig" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">غير موقع</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">الختم الرسمي</span>
                    <div className="h-28 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {ticket.employeeStamp || ticket.employee?.stamp ? (
                        <img src={ticket.employeeStamp || ticket.employee?.stamp} alt="Emp Stamp" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">بدون ختم</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Technician Side */}
              <div className="p-4 rounded-2xl bg-navy-850/70 border border-navy-750 space-y-3">
                <div className="flex items-center justify-between border-b border-navy-750/80 pb-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wrench className="w-3.5 h-3.5 text-purple-400" />
                    التقني المكلف: {ticket.technician?.name || 'مصلحة الإعلام الآلي'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTechSig(ticket.technician ? (ticket.technicianSignature || ticket.technician.signature || null) : null);
                      setTechStamp(ticket.technician ? (ticket.technicianStamp || ticket.technician.stamp || null) : null);
                      setIsSignTicketModalOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold border border-purple-500/40 transition-colors"
                  >
                    توقيع / ختم
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">توقيع التقني</span>
                    <div className="h-28 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {ticket.technician && (ticket.technicianSignature || ticket.technician.signature) ? (
                        <img src={(ticket.technicianSignature || ticket.technician.signature)!} alt="Tech Sig" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">غير موقع</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">ختم مصلحة IT</span>
                    <div className="h-28 rounded-2xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                      {ticket.technician && (ticket.technicianStamp || ticket.technician.stamp) ? (
                        <img src={(ticket.technicianStamp || ticket.technician.stamp)!} alt="Tech Stamp" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">بدون ختم</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Intervention Report */}
          {ticket.report ? (
            <div className="bg-navy-900/80 border border-emerald-500/20 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  محضر التدخل #{ticket.report.reportNumber}
                </p>
                <a
                  href={`/api/tickets/${ticket.id}/pdf`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  تنزيل PDF
                </a>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'التقني المتدخل', value: ticket.report.technicianName },
                  { label: 'الحالة النهائية', value: ticket.report.finalStatus },
                  { label: 'مدة التدخل', value: `${ticket.report.durationMinutes} دقيقة` },
                  { label: 'تاريخ الإغلاق', value: new Date(ticket.report.completedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric' }) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="font-bold text-emerald-300 text-sm">{value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {[
                  { label: 'التشخيص', value: ticket.report.diagnosis },
                  { label: 'الإجراءات المتخذة', value: ticket.report.actionsTaken },
                  ...(ticket.report.partsReplaced ? [{ label: 'القطع المستبدلة', value: ticket.report.partsReplaced }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-3">
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-slate-300 text-xs leading-relaxed">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-navy-900/60 border border-dashed border-navy-700 rounded-3xl p-6 text-center space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-500">لم يتم تحرير محضر التدخل بعد</p>
              <button
                onClick={() => setIsReportOpen(true)}
                id="btn-create-report-empty"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 text-xs font-bold transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                تحرير المحضر الآن
              </button>
            </div>
          )}

          {/* Comments */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-4">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
              سجل التعليقات والأنشطة ({comments.length})
            </p>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {comments.length === 0 && (
                <p className="text-center text-slate-600 text-xs py-4">لا توجد تعليقات بعد.</p>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3.5 rounded-2xl text-xs ${
                    c.isSystem
                      ? 'bg-navy-850/50 border border-navy-750 text-slate-500'
                      : 'bg-sky-500/5 border border-sky-500/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-black ${c.isSystem ? 'text-slate-500' : 'text-sky-300'}`}>
                      {c.isSystem ? '⚙ النظام' : c.author}
                    </span>
                    <span className="text-slate-600 text-[10px]">
                      {new Date(c.createdAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{c.content}</p>
                </div>
              ))}
            </div>

            {/* Add Comment Form */}
            <div className="pt-3 border-t border-navy-800 space-y-2">
              <input
                type="text"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="اسمك / المرسل"
                className="w-full px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none"
              />
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleAddComment(); }}
                  placeholder="أضف تعليقاً أو ملاحظة تقنية... (Ctrl+Enter للإرسال)"
                  rows={2}
                  className="flex-1 px-3 py-2 rounded-xl bg-navy-850 border border-navy-750 text-xs text-white placeholder-slate-500 focus:border-sky-500 outline-none resize-none"
                />
                <button
                  onClick={handleAddComment}
                  disabled={addingComment || !newComment.trim()}
                  id="btn-add-comment"
                  className="px-3 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 transition-all disabled:opacity-50"
                >
                  {addingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-4">

          {/* Assign Technician */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-3.5 h-3.5 text-purple-400" />
              التقني المكلف
            </p>
            {ticket.technician && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-black text-white text-sm">{ticket.technician.name}</p>
                  <p className="text-[11px] text-purple-300">{ticket.technician.speciality}</p>
                </div>
              </div>
            )}
            <select
              value={ticket.technicianId || 'NONE'}
              onChange={(e) => handleAssign(e.target.value)}
              disabled={assigningTech}
              className="w-full px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-xs text-slate-300 font-bold focus:border-purple-500 outline-none disabled:opacity-50"
            >
              <option value="NONE">-- {ticket.technician ? 'تغيير التقني' : 'تعيين تقني'} --</option>
              {technicians.map((t: any) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Quick Status Actions */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">إجراءات سريعة</p>
            {STATUS_STEPS.filter((s) => s.key !== ticket.status).map((step) => {
              const StepIcon = step.icon;
              return (
                <button
                  key={step.key}
                  onClick={() => handleStatusChange(step.key as any)}
                  disabled={changingStatus}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 text-xs font-bold transition-all disabled:opacity-50 text-right"
                >
                  <StepIcon className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                  تعيين: {step.label}
                </button>
              );
            })}
          </div>

          {/* Ticket Meta */}
          <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-3">
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              معلومات التذكرة
            </p>
            {[
              { label: 'تاريخ الإيداع', value: new Date(ticket.createdAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
              { label: 'آخر تحديث', value: new Date(ticket.updatedAt).toLocaleDateString('ar-DZ', { day: '2-digit', month: 'long', year: 'numeric' }) },
              { label: 'المدة المنقضية', value: (() => {
                const diff = Date.now() - new Date(ticket.createdAt).getTime();
                const hours = Math.floor(diff / 3600000);
                if (hours < 24) return `${hours} ساعة`;
                return `${Math.floor(hours / 24)} يوم`;
              })() },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium shrink-0">{label}</span>
                <span className="font-bold text-slate-300 text-right">{value}</span>
              </div>
            ))}
          </div>

          {/* Asset Link */}
          {ticket.asset && (
            <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-5 shadow-lg space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-wider">العتاد المرتبط</p>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-navy-850 border border-navy-750">
                <Hash className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <p className="font-bold text-white text-sm">{ticket.asset.name}</p>
                  <p className="font-mono text-xs text-sky-400">{ticket.asset.assetTag}</p>
                </div>
              </div>
              <Link
                href="/admin/assets"
                className="flex items-center gap-2 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors"
              >
                عرض تفاصيل العتاد ←
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {isReportOpen && (
        <ReportFormModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          ticket={ticket}
          onSuccess={loadData}
        />
      )}

      {/* Technician Sign / Stamp Modal */}
      {isSignTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <div className="flex items-center gap-2">
                <PenTool className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-black text-white">إمضاء وختم التذكرة للتقني</h3>
              </div>
              <button
                onClick={() => setIsSignTicketModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Tech Sig */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                <span className="text-xs font-bold text-slate-300">التوقيع الرقمي</span>
                <div className="w-full h-28 bg-white rounded-2xl p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                  {techSig ? (
                    <img src={techSig} alt="Sig" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">لا يوجد توقيع</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsSigModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs font-bold"
                >
                  {techSig ? 'تعديل التوقيع' : 'رسم / رفع التوقيع'}
                </button>
              </div>

              {/* Tech Stamp */}
              <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col items-center gap-2.5">
                <span className="text-xs font-bold text-slate-300">الختم الرسمي لمصلحة IT</span>
                <div className="w-full h-28 bg-white rounded-2xl p-2 flex items-center justify-center border border-slate-300 shadow-inner">
                  {techStamp ? (
                    <img src={techStamp} alt="Stamp" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">لا يوجد ختم</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsStampModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold"
                >
                  {techStamp ? 'تعديل الختم' : 'توليد / رفع ختم'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
              <button
                type="button"
                onClick={() => setIsSignTicketModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-navy-800 text-slate-300 text-xs font-bold hover:bg-navy-750"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveTicketSignatures}
                disabled={savingSignatures}
                className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-black hover:opacity-90 disabled:opacity-50"
              >
                {savingSignatures ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>حفظ التوقيع والختم</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature & Stamp Modals */}
      <SignaturePadModal
        isOpen={isSigModalOpen}
        onClose={() => setIsSigModalOpen(false)}
        onSave={(sig) => setTechSig(sig)}
        initialSignature={techSig}
      />
      <StampStudioModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        onSave={(st) => setTechStamp(st)}
        initialStamp={techStamp}
        defaultOrgName={ticket.unitName || 'DIRECTION DES SYSTEMES D\'INFORMATION'}
        defaultServiceName="SERVICE MAINTENANCE & SUPPORT IT"
        defaultUserName={ticket.technician?.name || 'TECHNICIEN IT'}
      />
    </div>
  );
}
