import Link from 'next/link';
import {
  ShieldCheck, FilePlus2, LayoutDashboard, Building2,
  Cpu, MailCheck, FileSpreadsheet, Sparkles, ArrowRight,
  Clock, CheckCircle2, Award, Zap, Layers, Server, Activity
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      
      {/* ── Hero Section ── */}
      <div className="relative text-center max-w-4xl mx-auto space-y-6 pt-4">
        {/* Glow ambient background sphere */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-sky-500/15 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Live system status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-900/90 border border-sky-500/30 text-sky-300 text-xs font-bold shadow-glow-sky backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
          </span>
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Plateforme Enterprise de Support IT Multi-Sites</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.15]">
          Gestion Centralisée des{' '}
          <span className="bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            Interventions Informatiques
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Soumettez vos demandes de dépannage, suivez l&apos;avancement en temps réel et générez automatiquement vos fiches d&apos;intervention officielles certifiées PDF.
        </p>

        {/* Direct Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/request"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-sky-950/60 hover:shadow-glow-sky hover:scale-[1.02] transition-all"
          >
            <FilePlus2 className="w-5 h-5" />
            <span>Soumettre un Ticket</span>
            <ArrowRight className="w-4 h-4 text-sky-200" />
          </Link>

          <Link
            href="/admin/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-navy-900 hover:bg-navy-850 text-slate-200 hover:text-white font-bold text-sm border border-navy-750 hover:border-indigo-500/50 shadow-lg transition-all hover:scale-[1.02]"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>Espace Administrateur</span>
          </Link>
        </div>
      </div>

      {/* ── Main Portal Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        
        {/* User Request Portal Card */}
        <Link
          href="/request"
          className="group relative bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-800 hover:border-sky-500/50 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-glow-sky hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center group-hover:scale-110 group-hover:border-sky-400/50 transition-all shadow-md">
              <FilePlus2 className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">
                <Zap className="w-3.5 h-3.5" /> Espace Demandeur
              </div>
              <h2 className="text-2xl font-extrabold text-white group-hover:text-sky-300 transition-colors">
                Portail Utilisateur
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Créer rapidement une nouvelle demande d&apos;intervention informatique (Panne PC, Réseau, Imprimante, Logiciel métiers).
              </p>
            </div>

            {/* Micro highlights list */}
            <div className="space-y-2 pt-2 border-t border-navy-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>Formulaire simplifié multi-sites (Filiales, CIC, UPC)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                <span>N° de ticket certifié & fiche de demande téléchargeable</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 flex items-center justify-between border-t border-navy-800 text-sm font-bold text-sky-400 group-hover:text-sky-300 transition-colors">
            <span>Créer une demande maintenant</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Admin Dashboard Card */}
        <Link
          href="/admin/dashboard"
          className="group relative bg-gradient-to-b from-navy-900/90 to-navy-950/90 border border-navy-800 hover:border-indigo-500/50 rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:shadow-glow-indigo hover:-translate-y-1 flex flex-col justify-between overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

          <div className="space-y-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center group-hover:scale-110 group-hover:border-indigo-400/50 transition-all shadow-md">
              <LayoutDashboard className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Équipe IT & Techniciens
              </div>
              <h2 className="text-2xl font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                Espace Administrateur IT
              </h2>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                Superviser le parc de tickets, filtrer par entité ou priorité et établir les fiches d&apos;intervention officielles clôturées.
              </p>
            </div>

            {/* Micro highlights list */}
            <div className="space-y-2 pt-2 border-t border-navy-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Tableau de bord dynamique avec filtres avancés</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Génération instantanée du rapport d&apos;intervention PDF</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 flex items-center justify-between border-t border-navy-800 text-sm font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
            <span>Accéder au Tableau de Bord</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* ── Enterprise Key Metrics Stats Bar ── */}
      <div className="max-w-5xl mx-auto bg-navy-900/60 border border-navy-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-navy-800">
          <div className="p-2 space-y-1">
            <p className="text-3xl font-black text-sky-400 tracking-tight">99.8%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Taux de Résolution</p>
          </div>
          <div className="p-2 space-y-1">
            <p className="text-3xl font-black text-indigo-400 tracking-tight">&lt; 15 min</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Temps de Prise en Charge</p>
          </div>
          <div className="p-2 space-y-1">
            <p className="text-3xl font-black text-emerald-400 tracking-tight">100%</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Conforme Certifié PDF</p>
          </div>
          <div className="p-2 space-y-1">
            <p className="text-3xl font-black text-amber-400 tracking-tight">3 Types</p>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sites (Filiales / CIC / UPC)</p>
          </div>
        </div>
      </div>

      {/* ── Feature Highlights Grid ── */}
      <div className="pt-8 border-t border-navy-850 max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h3 className="text-xs font-bold text-sky-400 uppercase tracking-widest flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Architecture & Fonctionnalités Key
          </h3>
          <h2 className="text-2xl font-extrabold text-white">
            Conçu pour la Performance et la Traçabilité
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          <div className="bg-gradient-to-b from-navy-900/60 to-navy-950/60 border border-navy-800 p-6 rounded-2xl space-y-3 hover:border-navy-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100 text-base">Multi-Sites Entreprise</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Support dédié et structuré pour la Direction Régionale (Filiales), les Wilayas (CIC) et les Unités de Production (UPC).
            </p>
          </div>

          <div className="bg-gradient-to-b from-navy-900/60 to-navy-950/60 border border-navy-800 p-6 rounded-2xl space-y-3 hover:border-navy-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100 text-base">Génération PDF Officielle</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Impression & téléchargement immédiats des fiches d&apos;intervention validées avec signatures, diagnostics et pièces remplacées.
            </p>
          </div>

          <div className="bg-gradient-to-b from-navy-900/60 to-navy-950/60 border border-navy-800 p-6 rounded-2xl space-y-3 hover:border-navy-700 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <MailCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-100 text-base">Alertes & Emailing SMTP</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Notifications instantanées au support technique et envoi automatique de la fiche PDF résolue au demandeur par email.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
