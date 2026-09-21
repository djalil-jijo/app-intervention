import Link from 'next/link';
import { FileQuestion, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      {/* Glow ambient background sphere */}
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle,_rgba(56,189,248,0.04)_1px,_transparent_1px)] bg-[size:32px_32px]" />
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center space-y-6 bg-navy-900/80 border border-navy-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto shadow-inner">
          <FileQuestion className="w-8 h-8 text-sky-400" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-sky-400 uppercase tracking-widest bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20">
            Erreur 404 · الصفحة غير موجودة
          </span>
          <h1 className="text-2xl font-black text-white">Page Introuvable</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
            <br />
            الصفحة المطلوبة غير متوفرة أو تم تغيير مسارها.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-950/50 transition-all hover:scale-[1.02]"
          >
            <Home className="w-4 h-4" />
            <span>Accueil / الرئيسية</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white font-medium text-sm border border-navy-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tableau de bord</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
