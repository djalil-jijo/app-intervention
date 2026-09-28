'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { logoutAdminAction } from '@/app/actions/auth';
import {
  ShieldCheck,
  LayoutDashboard,
  Ticket,
  Laptop,
  Boxes,
  Users,
  BookOpen,
  FilePlus2,
  Clock,
  Wrench,
  CheckCircle2,
  Archive,
  Building2,
  MapPin,
  Factory,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  FileCode,
  UserCheck,
  Search,
  FileSignature,
} from 'lucide-react';
import { seedErpDemoDataAction } from '@/app/actions/seed';
import { NotificationBell } from '@/components/ui/NotificationBell';
import { GlobalSearch } from '@/components/ui/GlobalSearch';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const erpNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { href: '/admin/tickets', label: 'Interventions & Tickets', icon: Ticket },
  { href: '/admin/maintenance', label: 'Maintenance Préventive', icon: Wrench },
  { href: '/admin/assets', label: 'Parc Informatique', icon: Laptop },
  { href: '/admin/decharges', label: 'Bons de Décharge', icon: FileSignature },
  { href: '/admin/stock', label: 'Stock & Pièces', icon: Boxes },
  { href: '/admin/reports', label: 'Rapports & Exports', icon: FileSpreadsheet },
  { href: '/admin/technicians', label: 'Équipe IT Techniciens', icon: Users },
  { href: '/admin/employees', label: 'Employés & Signatures', icon: UserCheck },
  { href: '/admin/knowledge', label: 'Base de Connaissances', icon: BookOpen },
  { href: '/admin/templates', label: 'Modèles & Pannes', icon: FileCode },
  { href: '/admin/users', label: 'Utilisateurs & Rôles', icon: ShieldCheck },
];

const orgLevels = [
  { label: 'Filiales', desc: 'Directions Régionales', icon: Building2, color: 'text-indigo-400', dot: 'bg-indigo-400' },
  { label: 'CIC', desc: 'Directions de Wilaya', icon: MapPin, color: 'text-sky-400', dot: 'bg-sky-400' },
  { label: 'UPC', desc: 'Unités de Production', icon: Factory, color: 'text-emerald-400', dot: 'bg-emerald-400' },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAdminAction();
    } finally {
      window.location.href = '/admin/login';
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    setSeedStatus('idle');
    try {
      const res = await seedErpDemoDataAction();
      if (res.success) {
        setSeedStatus('success');
        router.refresh();
      } else {
        setSeedStatus('error');
        console.error('[Seed] Error:', res.error);
      }
    } catch (err: any) {
      setSeedStatus('error');
      console.error('[Seed] Exception:', err);
    } finally {
      setSeeding(false);
      setTimeout(() => setSeedStatus('idle'), 3500);
    }
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside
      className={`
        relative flex flex-col h-screen bg-navy-950 border-r border-navy-800/70
        transition-all duration-300 ease-in-out shrink-0 shadow-2xl z-30
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* ── Logo / Brand ── */}
      <div className={`flex items-center justify-between border-b border-navy-800/70 shrink-0 ${collapsed ? 'justify-center py-5 px-2' : 'px-4 py-4'}`}>
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl blur opacity-75"></div>
            <div className="relative w-9 h-9 rounded-xl bg-navy-950 border border-sky-400/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-black text-sm tracking-tight text-white leading-none">IT-ERP SYSTEM</p>
              <p className="text-[9px] text-sky-400 font-bold mt-1 leading-none tracking-wider uppercase">
                مصلحة الإعلام الآلي
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <ThemeToggle />
          </div>
        )}
      </div>

      {/* ── Collapse Toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-16 w-7 h-7 rounded-full bg-navy-800 border border-navy-750 text-slate-300 hover:text-white flex items-center justify-center shadow-xl z-40 transition-all hover:bg-navy-700 hover:border-sky-500/50"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* ── Search Bar (Ctrl+K) ── */}
      {!collapsed && (
        <div className="px-3 pt-3">
          <GlobalSearch />
        </div>
      )}

      {/* ── Scrollable nav body ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-5 px-3">
        {/* Main ERP Navigation */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Modules ERP
            </p>
          )}
          {erpNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200
                ${collapsed ? 'justify-center px-2' : ''}
                ${
                  isActive(href)
                    ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-sky-300 border border-sky-500/30 shadow-md shadow-sky-950/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-850'
                }
              `}
              title={collapsed ? label : undefined}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive(href) ? 'text-sky-400' : 'text-slate-400'}`} />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          ))}
        </div>

        {/* Action Shortcuts */}
        <div className="space-y-1 pt-2 border-t border-navy-800/50">
          {!collapsed && (
            <p className="px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Actions Rapides
            </p>
          )}
          <Link
            href="/request"
            target="_blank"
            className={`
              flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200
              text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20
              ${collapsed ? 'justify-center px-2' : ''}
            `}
            title={collapsed ? 'Formulaire Demande' : undefined}
          >
            <FilePlus2 className="w-4 h-4 shrink-0 text-emerald-400" />
            {!collapsed && <span>Formulaire Demande</span>}
          </Link>

          <button
            onClick={handleSeedData}
            disabled={seeding}
            className={`
              flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 w-full
              disabled:opacity-50
              ${
                seedStatus === 'success'
                  ? 'text-emerald-300 bg-emerald-500/15 border border-emerald-500/30'
                  : seedStatus === 'error'
                  ? 'text-rose-300 bg-rose-500/15 border border-rose-500/30'
                  : 'text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20'
              }
              ${collapsed ? 'justify-center px-2' : ''}
            `}
            title={collapsed ? 'Charger Données DÉMO' : undefined}
          >
            <Sparkles
              className={`w-4 h-4 shrink-0 ${
                seedStatus === 'success'
                  ? 'text-emerald-400'
                  : seedStatus === 'error'
                  ? 'text-rose-400'
                  : 'text-indigo-400'
              } ${seeding ? 'animate-spin' : ''}`}
            />
            {!collapsed && (
              <span className="truncate">
                {seeding
                  ? 'جاري التحميل...'
                  : seedStatus === 'success'
                  ? '✓ تم التحميل!'
                  : seedStatus === 'error'
                  ? '✗ خطأ في التحميل'
                  : 'Données Démo ERP'}
              </span>
            )}
          </button>
        </div>

        {/* Périmètre Multi-Sites */}
        {!collapsed && (
          <div className="pt-2 border-t border-navy-800/50">
            <p className="px-2 mb-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              Périmètre Multi-Sites
            </p>
            <div className="bg-navy-900/80 border border-navy-800/60 rounded-2xl p-2.5 space-y-2">
              {orgLevels.map(({ label, desc, icon: Icon, color, dot }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`}></div>
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${color}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-black ${color} leading-none`}>{label}</p>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5 truncate">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* ── Footer / Logout ── */}
      <div className={`border-t border-navy-800/70 p-3 shrink-0 ${collapsed ? 'flex justify-center' : ''}`}>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`
            flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-200
            text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent
            w-full disabled:opacity-50
            ${collapsed ? 'justify-center px-2' : ''}
          `}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0 text-rose-400" />
          {!collapsed && <span>{isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>}
        </button>
      </div>
    </aside>
  );
};
