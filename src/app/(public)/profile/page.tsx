'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User, ShieldCheck, Wrench, Award, PenTool, Check,
  RefreshCw, Lock, Phone, Briefcase, Building2, Eye,
  Sparkles, PlusCircle, Search, LogOut
} from 'lucide-react';
import {
  getCurrentUserAction,
  updateEmployeeProfileAction,
  updateTechnicianProfileAction,
  logoutUserAction
} from '@/app/actions/auth';
import { SignaturePadModal } from '@/components/ui/SignaturePadModal';
import { StampStudioModal } from '@/components/ui/StampStudioModal';
import { SessionUser } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [functionTitle, setFunctionTitle] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [stamp, setStamp] = useState<string | null>(null);

  // Modals
  const [isSigModalOpen, setIsSigModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const u = await getCurrentUserAction();
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      setPhone(u.phone || '');
      setFunctionTitle(u.functionTitle || '');
      setSpeciality(u.speciality || '');
      setSignature(u.signature || null);
      setStamp(u.stamp || null);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    let res: any;
    if (user.role === 'EMPLOYEE') {
      res = await updateEmployeeProfileAction({
        phone,
        functionTitle,
        signature,
        stamp,
        newPassword: newPassword || undefined,
      });
    } else if (user.role === 'TECHNICIAN') {
      res = await updateTechnicianProfileAction({
        phone,
        speciality,
        signature,
        stamp,
        newPassword: newPassword || undefined,
      });
    }

    if (res?.success) {
      setSuccessMsg('تم حفظ التغييرات وتحديث التوقيع والختم الرقمي بنجاح!');
      if (res.user) setUser(res.user);
      setNewPassword('');
    } else {
      setErrorMsg(res?.error || 'حدث خطأ أثناء الحفظ.');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logoutUserAction();
    router.push('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400 mx-auto" />
        <p className="text-sm text-slate-400">جاري تحميل بيانات الملف الشخصي...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-850 to-navy-900 border border-navy-750 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 text-2xl font-black">
              {user.role === 'EMPLOYEE' ? <User className="w-8 h-8" /> : user.role === 'TECHNICIAN' ? <Wrench className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-500/15 border border-sky-500/30 text-sky-300">
                  {user.role === 'EMPLOYEE' ? 'موظف طالب تدخل' : user.role === 'TECHNICIAN' ? 'تقني معتمد' : 'مدير النظام'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{user.email}</p>
              {user.service && (
                <p className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-sky-400" />
                  <span>{user.service}</span>
                  {user.unitName && <span className="text-slate-500">· {user.unitName}</span>}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              href="/request"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-transform hover:scale-105"
            >
              <PlusCircle className="w-4 h-4" />
              <span>طلب تدخل موقع تلقائياً</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-navy-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 border border-navy-750 text-xs font-bold transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Official Credential & Live Preview Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-navy-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
              معاينة بطاقة الاعتماد الرسمية (التوقيع والختم الرقميين)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            تدرج هذه الإمضاءات تلقائياً في وثائق PDF وطلبات التدخل
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Signature Box */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-750 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-white">التوقيع الرقمي المعتمد</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSigModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-bold transition-colors"
              >
                {signature ? 'تعديل التوقيع' : 'إضافة توقيع'}
              </button>
            </div>

            <div className="w-full h-28 rounded-xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner relative overflow-hidden">
              {signature ? (
                <img src={signature} alt="Signature" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <PenTool className="w-6 h-6 mx-auto opacity-30" />
                  <p className="text-[11px]">لا يوجد توقيع رقمي معتمد بعد</p>
                </div>
              )}
              <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono select-none">
                Émargement Numérique
              </span>
            </div>
          </div>

          {/* Stamp Box */}
          <div className="p-5 rounded-2xl bg-navy-950 border border-navy-750 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white">الختم الرسمي للمصلحة</span>
              </div>
              <button
                type="button"
                onClick={() => setIsStampModalOpen(true)}
                className="px-3 py-1 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-bold transition-colors"
              >
                {stamp ? 'تعديل الختم' : 'توليد / رفع ختم'}
              </button>
            </div>

            <div className="w-full h-28 rounded-xl bg-white p-2 flex items-center justify-center border border-slate-300 shadow-inner relative overflow-hidden">
              {stamp ? (
                <img src={stamp} alt="Official Stamp" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="text-center text-slate-400 space-y-1">
                  <Award className="w-6 h-6 mx-auto opacity-30" />
                  <p className="text-[11px]">لا يوجد ختم رسمي معتمد بعد</p>
                </div>
              )}
              <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono select-none">
                Cachet Officiel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-navy-900 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-navy-800 pb-3">
          تعديل البيانات الشخصية والوظيفية
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">رقم الهاتف المهني</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0550 12 34 56"
                className="w-full pr-11 pl-4 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs font-mono focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {user.role === 'EMPLOYEE' ? 'الصفة / المسمى الوظيفي' : 'التخصص الدقيق'}
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={user.role === 'EMPLOYEE' ? functionTitle : speciality}
                onChange={(e) => (user.role === 'EMPLOYEE' ? setFunctionTitle(e.target.value) : setSpeciality(e.target.value))}
                placeholder={user.role === 'EMPLOYEE' ? 'Chef de Service / Ingénieur' : 'Réseaux, Systèmes & Maintenance'}
                className="w-full pr-11 pl-4 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
              />
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-300 mb-2">
              تغيير كلمة المرور <span className="text-slate-500 font-normal">(اتركه فارغاً إذا كنت لا ترغب بتغييرها)</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة مرور جديدة (6 أحرف على الأقل)"
                className="w-full pr-11 pl-4 py-2.5 rounded-xl bg-navy-950 border border-navy-750 text-white text-xs focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-navy-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl transition-all hover:scale-105 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            <span>حفظ واعتماد التغييرات</span>
          </button>
        </div>
      </form>

      {/* Signature & Stamp Modals */}
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
        defaultOrgName={user.unitName || 'ENTREPRISE INDUSTRIELLE'}
        defaultServiceName={user.service || 'SERVICE IT'}
        defaultUserName={user.name}
      />
    </div>
  );
}
