'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, PlusCircle, LayoutDashboard, Sparkles, Activity } from 'lucide-react';

export const Navbar = () => {
  const pathname = usePathname();

  const isRequest = pathname === '/request';
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800/80 text-slate-100 shadow-2xl transition-all">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo Brand */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
            <div className="relative w-10 h-10 rounded-xl bg-navy-900 border border-sky-400/30 flex items-center justify-center text-sky-400 shadow-md group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white group-hover:text-sky-300 transition-colors">
                IT-TASKER
              </span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 text-sky-300 border border-sky-500/30 tracking-widest uppercase shadow-sm">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium -mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Support & Interventions Multi-Sites
            </p>
          </div>
        </Link>

        {/* Action Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/request"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${isRequest
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-sky'
                : 'text-slate-300 hover:text-white hover:bg-navy-850 border border-transparent hover:border-navy-750'
              }
            `}
          >
            <PlusCircle className={`w-4 h-4 ${isRequest ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Nouveau Ticket</span>
            <span className="sm:hidden">Ticket</span>
          </Link>

          <Link
            href="/admin/dashboard"
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${isAdmin
                ? 'bg-indigo-600 text-white shadow-glow-indigo border border-indigo-400/30'
                : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-lg shadow-sky-950/50 hover:shadow-glow-sky hover:scale-[1.02]'
              }
            `}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Admin</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};
