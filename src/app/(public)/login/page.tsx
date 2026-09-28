'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, Lock, Mail, ArrowRight, Loader2,
  AlertCircle, Sparkles
} from 'lucide-react';
import { loginUserAction } from '@/app/actions/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick Demo Login
  const handleQuickLogin = async (user: string, pass: string) => {
    setLoading(true);
    setErrorMsg(null);
    setIdentifier(user);
    setPassword(pass);
    const res = await loginUserAction(user, pass);
    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
      router.refresh();
    } else {
      setErrorMsg('تعذر تسجيل الدخول بالحساب التجريبي. تأكد من تشغيل البذر أولاً.');
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMsg('يرجى ملء جميع الحقول.');
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    const res = await loginUserAction(identifier.trim(), password);
    if (res.success && res.redirectUrl) {
      router.push(res.redirectUrl);
      router.refresh();
    } else {
      setErrorMsg(res.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 shadow-xl shadow-sky-500/25 text-white mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              تسجيل الدخول
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              منصة IT-Tasker — إدارة التدخلات التقنية
            </p>
          </div>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-navy-900/90 border border-navy-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={handleLoginSubmit} className="space-y-5">

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                البريد الإلكتروني أو اسم المستخدم
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setErrorMsg(null); }}
                  placeholder="example@enterprise.com"
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="w-full pr-11 pl-4 py-3.5 rounded-xl bg-navy-950 border border-navy-750 text-white placeholder-slate-600 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full pr-11 pl-4 py-3.5 rounded-xl bg-navy-950 border border-navy-750 text-white placeholder-slate-600 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500/30 transition-all disabled:opacity-60"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-sky-950/60 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق من الهوية...</span>
                </>
              ) : (
                <>
                  <span>دخول</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        </div>

        {/* Info note */}
        <p className="text-center text-xs text-slate-500">
          يتم تحديد الصلاحيات تلقائياً بناءً على بيانات حسابك.
          <br />
          لا تملك حساباً؟ تواصل مع مصلحة الإعلام الآلي.
        </p>

        {/* Quick Demo Footer */}
        <div className="p-4 rounded-3xl bg-navy-900/50 border border-navy-800/60 space-y-3 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>حسابات تجريبية — Demo Test Only</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('employee@enterprise.com', 'Emp2026!')}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
            >
              👤 موظف تجريبي
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('technician@enterprise.com', 'Tech2026!')}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/30 text-teal-300 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
            >
              🔧 تقني معتمد
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@enterprise.com', 'Admin2026!')}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 text-indigo-300 text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
            >
              🛡️ مدير النظام
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
