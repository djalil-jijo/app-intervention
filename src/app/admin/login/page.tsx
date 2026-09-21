'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAdminAction } from '@/app/actions/auth';
import { Lock, User, KeyRound, ShieldCheck, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [loginInput, setLoginInput] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await loginAdminAction(loginInput, password);
      if (res.success) {
        router.push('/admin/dashboard');
        router.refresh();
      } else {
        setErrorMsg(res.error || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء محاولة تسجيل الدخول.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-10 px-4 animate-fade-in-up">
      <div className="w-full max-w-md bg-navy-900/90 border border-navy-750 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 relative overflow-hidden backdrop-blur-xl text-right">
        {/* Glow ambient background sphere */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-radial from-sky-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-radial from-indigo-500/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Header Icon */}
        <div className="text-center space-y-3 relative z-10">
          <div className="relative inline-block">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl blur opacity-75 animate-pulse"></div>
            <div className="relative w-16 h-16 rounded-2xl bg-navy-950 border border-sky-400/40 text-sky-400 flex items-center justify-center mx-auto shadow-xl">
              <ShieldCheck className="w-8 h-8 text-sky-400" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 inline-block mb-1">
              Accès Sécurisé IT
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">
              تسجيل الدخول للإدارة
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              فضاء مخصص لتقنيي ومسؤولي مصلحة الإعلام الآلي.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-sky-400" />
              اسم المستخدم أو البريد الإلكتروني
            </label>
            <input
              type="text"
              required
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="admin@enterprise.com أو superadmin"
              className="w-full px-4 py-3 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner font-medium dir-ltr text-right"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 rounded-xl bg-navy-950/80 border border-navy-750 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-inner font-medium dir-ltr text-right"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-xl shadow-sky-950/60 disabled:opacity-50 transition-all hover:scale-[1.01] mt-3"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>جاري التحقق من الهوية...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>دخول لوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="pt-3 border-t border-navy-800 text-center text-[11px] text-slate-500 font-medium">
          <p>جميع جلسات تسجيل الدخول مشفرة ومؤمنة.</p>
        </div>
      </div>
    </div>
  );
}
