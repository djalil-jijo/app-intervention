'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck, PlusCircle, LayoutDashboard, Search,
  User, LogIn, LogOut, Wrench, Award, PenTool
} from 'lucide-react';
import { getCurrentUserAction, logoutUserAction } from '@/app/actions/auth';
import { SessionUser } from '@/lib/auth';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const u = await getCurrentUserAction();
      setUser(u);
    }
    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await logoutUserAction();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const isRequest = pathname === '/request';
  const isTrack   = pathname === '/track';
  const isProfile = pathname === '/profile';
  const isLogin   = pathname === '/login';
  const isAdmin   = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-40 bg-navy-950/85 backdrop-blur-xl border-b border-navy-800/80 text-slate-100 shadow-2xl transition-all">
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
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${isRequest
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-glow-sky'
                : 'text-slate-300 hover:text-white hover:bg-navy-850 border border-transparent hover:border-navy-750'
              }
            `}
          >
            <PlusCircle className={`w-4 h-4 ${isRequest ? 'text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">طلب تدخل جديد</span>
            <span className="sm:hidden">طلب</span>
          </Link>

          <Link
            href="/track"
            className={`
              flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${isTrack
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-glow-teal'
                : 'text-slate-300 hover:text-white hover:bg-navy-850 border border-transparent hover:border-navy-750'
              }
            `}
          >
            <Search className={`w-4 h-4 ${isTrack ? 'text-teal-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">
              {user?.role === 'EMPLOYEE' ? 'طلباتي وتتبعها' : 'تتبع طلب'}
            </span>
            <span className="sm:hidden">تتبع</span>
          </Link>

          {/* User Session Profile or Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                    isProfile
                      ? 'bg-indigo-500/25 border-indigo-400 text-white shadow-glow-indigo'
                      : 'bg-navy-900 border-navy-750 text-slate-300 hover:text-white hover:border-navy-700'
                  }
                `}
                title="الملف الشخصي، التوقيع والختم الرقمي"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[9px] text-sky-400 font-medium leading-tight">
                    {user.role === 'EMPLOYEE' ? 'موظف' : user.role === 'TECHNICIAN' ? 'تقني IT' : 'مسؤول'}
                  </span>
                </div>
              </Link>

              {(user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'TECHNICIAN') && (
                <Link
                  href="/admin/dashboard"
                  className={`
                    flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                    ${isAdmin
                      ? 'bg-indigo-600 text-white shadow-glow-indigo'
                      : 'bg-navy-800 text-slate-300 hover:text-white border border-navy-750'
                    }
                  `}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">لوحة الإدارة</span>
                </Link>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-navy-800 border border-transparent hover:border-navy-750 transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={`
                  flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200
                  ${isLogin
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-750'
                  }
                `}
              >
                <LogIn className="w-3.5 h-3.5 text-sky-400" />
                <span>تسجيل الدخول</span>
              </Link>

              <Link
                href="/admin/login"
                className={`
                  hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all
                  ${isAdmin
                    ? 'bg-indigo-600 text-white shadow-glow-indigo border border-indigo-400/30'
                    : 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white shadow-md'
                  }
                `}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
