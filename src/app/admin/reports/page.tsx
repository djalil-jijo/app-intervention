'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Laptop,
  Boxes,
  Building2,
  FileText,
  ExternalLink,
  ShieldAlert,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import { getDashboardStatsAction } from '@/app/actions/stats';
import { getDechargesAction } from '@/app/actions/decharges';

export default function ReportsPage() {
  // Filters
  const [ticketStatus, setTicketStatus] = useState('ALL');
  const [ticketUnitType, setTicketUnitType] = useState('ALL');
  const [ticketPeriod, setTicketPeriod] = useState('ALL');

  const [assetType, setAssetType] = useState('ALL');
  const [assetStatus, setAssetStatus] = useState('ALL');
  const [assetUnitType, setAssetUnitType] = useState('ALL');

  const [dechargeStatus, setDechargeStatus] = useState('ALL');
  const [dechargeType, setDechargeType] = useState('ALL');

  const [stockLowOnly, setStockLowOnly] = useState(false);

  // States
  const [stats, setStats] = useState<any>(null);
  const [dechargesCount, setDechargesCount] = useState<number>(0);
  const [exporting, setExporting] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      const [statsRes, dechargesRes] = await Promise.all([
        getDashboardStatsAction(),
        getDechargesAction(),
      ]);
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (dechargesRes.success && dechargesRes.data) {
        setDechargesCount(dechargesRes.data.length);
      }
    }
    loadStats();
  }, []);

  const handleExportTickets = (format: 'xlsx' | 'csv') => {
    setExporting(`tickets-${format}`);
    const url = `/api/export/tickets?format=${format}&status=${ticketStatus}&unitType=${ticketUnitType}&period=${ticketPeriod}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 1500);
  };

  const handleExportAssets = (format: 'xlsx' | 'csv' = 'xlsx') => {
    setExporting(`assets-${format}`);
    const url = `/api/export/assets?format=${format}&status=${assetStatus}&unitType=${assetUnitType}&type=${assetType}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 1500);
  };

  const handleExportDecharges = () => {
    setExporting('decharges');
    const url = `/api/export/decharges?status=${dechargeStatus}&dischargeType=${dechargeType}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 1500);
  };

  const handleExportStock = () => {
    setExporting('stock');
    const url = `/api/export/stock?lowStockOnly=${stockLowOnly}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 1500);
  };

  const handleExecutivePdf = (inline: boolean = false) => {
    setExporting(inline ? 'exec-inline' : 'exec-dl');
    const url = `/api/export/executive-pdf${inline ? '?inline=true' : ''}`;
    window.open(url, '_blank');
    setTimeout(() => setExporting(null), 1500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-navy-900 via-navy-850 to-indigo-950/40 p-6 md:p-8 rounded-3xl border border-navy-800/90 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <FileSpreadsheet className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">مركز التقارير وتصدير البيانات</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                  PRO EXPORTS
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium max-w-2xl leading-relaxed">
                توليد وتصدير تقارير تنفيذية عالية الاحترافية بصيغ Excel متعددة الجداول مع مؤشرات الأداء (KPIs)،
                سجلات الجرد، محاضر العهدة، وملفات PDF رسمية جاهزة للاجتماعات الإدارية.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleExecutivePdf(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-xs shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <Sparkles className="w-4 h-4 text-sky-200" />
            <span>معاينة التقرير التنفيذي الشامل PDF</span>
          </button>
        </div>
      </div>

      {/* Live KPIs Top Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats?.totalTickets || '—'}</div>
            <div className="text-[10px] font-bold text-slate-400">إجمالي التدخلات</div>
          </div>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-emerald-400">{stats ? `${stats.resolutionRate}%` : '—'}</div>
            <div className="text-[10px] font-bold text-slate-400">نسبة الإنجاز</div>
          </div>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Laptop className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats?.assetStats?.total || '—'}</div>
            <div className="text-[10px] font-bold text-slate-400">عتاد الحظيرة</div>
          </div>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{dechargesCount}</div>
            <div className="text-[10px] font-bold text-slate-400">سندات العهدة</div>
          </div>
        </div>

        <div className="bg-navy-900/70 border border-navy-800 rounded-2xl p-4 flex items-center gap-3 col-span-2 md:col-span-1">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Boxes className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-white">{stats?.stockStats?.total || '—'}</div>
            <div className="text-[10px] font-bold text-slate-400">قطع الغيار</div>
          </div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* 1. Tickets Export Card */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-sky-500/30 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                Multi-Sheet Excel
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">تقرير تذاكر وتدخلات الصيانة</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                تصدير جدول مفصل بكل التدخلات، التقني المكلف، مدة الإنجاز، مع ورقة مؤشرات أداء تفاعلية.
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-2 pt-2 border-t border-navy-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>تصفية بالحالة:</span>
                <select
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="IN_PROGRESS">قيد المعالجة</option>
                  <option value="RESOLVED">تم الحل</option>
                  <option value="CLOSED">مغلقة نهائياً</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>تصفية بالموقع:</span>
                <select
                  value={ticketUnitType}
                  onChange={(e) => setTicketUnitType(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">جميع الهياكل (الكل)</option>
                  <option value="FILIALE">المديريات الجهوية</option>
                  <option value="CIC">المديريات الولائية</option>
                  <option value="UPC">الوحدات الإنتاجية</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>الفترة الزمنية:</span>
                <select
                  value={ticketPeriod}
                  onChange={(e) => setTicketPeriod(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">كل الفترات</option>
                  <option value="month">هذا الشهر فقط</option>
                  <option value="quarter">هذا الربع (3 أشهر)</option>
                  <option value="year">هذه السنة الحالية</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-navy-800">
            <button
              onClick={() => handleExportTickets('xlsx')}
              disabled={exporting === 'tickets-xlsx'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting === 'tickets-xlsx' ? 'جاري التصدير...' : 'تصدير Excel (.xlsx)'}</span>
            </button>
            <button
              onClick={() => handleExportTickets('csv')}
              disabled={exporting === 'tickets-csv'}
              className="px-3 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 font-bold text-xs transition-all"
              title="تصدير بصيغة CSV"
            >
              CSV
            </button>
          </div>
        </div>

        {/* 2. Assets Inventory Export Card */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-indigo-500/30 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                Parc & Fleet Audit
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">سجل جرد العتاد المعلوماتي</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                سجل جرد شامل لجميع الأجهزة، السيرفرات، الشبكات، أرقام السلسلة S/N، وحالة الضمان مع إحصائيات الجاهزية.
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-2 pt-2 border-t border-navy-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>تصفية بالنوع:</span>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">جميع الأنواع</option>
                  <option value="DESKTOP">حواسيب مكتبية</option>
                  <option value="LAPTOP">حواسيب محمولة</option>
                  <option value="SERVER">سيرفرات</option>
                  <option value="PRINTER">طابعات</option>
                  <option value="SWITCH_ROUTER">شبكات وتوجيه</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>تصفية بالحالة:</span>
                <select
                  value={assetStatus}
                  onChange={(e) => setAssetStatus(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="OPERATIONAL">جاهز ويعمل</option>
                  <option value="DEFECTIVE">معطل</option>
                  <option value="UNDER_MAINTENANCE">قيد الصيانة</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>تصفية بالهيكل:</span>
                <select
                  value={assetUnitType}
                  onChange={(e) => setAssetUnitType(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">جميع الهياكل</option>
                  <option value="FILIALE">المديريات الجهوية</option>
                  <option value="CIC">المديريات الولائية</option>
                  <option value="UPC">الوحدات الإنتاجية</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-navy-800">
            <button
              onClick={() => handleExportAssets('xlsx')}
              disabled={exporting === 'assets-xlsx'}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting === 'assets-xlsx' ? 'جاري التصدير...' : 'تصدير جرد العتاد (.xlsx)'}</span>
            </button>
            <button
              onClick={() => handleExportAssets('csv')}
              disabled={exporting === 'assets-csv'}
              className="px-3 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-navy-750 text-slate-300 font-bold text-xs transition-all"
              title="تصدير بصيغة CSV"
            >
              CSV
            </button>
          </div>
        </div>

        {/* 3. Décharges Export Card */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-amber-500/30 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                سندات العهدة
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">سجل أذونات وتفريغ العتاد</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                تصدير كافة سندات التسليم والعهدة مع تفاصيل المستفيدين، العتاد المسلم، ومواعيد الإرجاع.
              </p>
            </div>

            {/* Filters */}
            <div className="space-y-2 pt-2 border-t border-navy-800/80">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>حالة السند:</span>
                <select
                  value={dechargeStatus}
                  onChange={(e) => setDechargeStatus(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">الكل (سارية + مسترجعة)</option>
                  <option value="ACTIVE">سارية قيد الاستعمال</option>
                  <option value="RETURNED">مسترجعة بالكامل</option>
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>نوع التخصيص:</span>
                <select
                  value={dechargeType}
                  onChange={(e) => setDechargeType(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-navy-850 border border-navy-750 text-xs font-bold text-slate-200 outline-none"
                >
                  <option value="ALL">كل الأنواع</option>
                  <option value="PERMANENT">تخصيص نهائي دائم</option>
                  <option value="TEMPORARY">إعارة مؤقتة</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800">
            <button
              onClick={handleExportDecharges}
              disabled={exporting === 'decharges'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-xs shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting === 'decharges' ? 'جاري التصدير...' : 'تصدير سجل سندات العهدة Excel'}</span>
            </button>
          </div>
        </div>

        {/* 4. Stock & Spare Parts Export Card */}
        <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-5 hover:border-emerald-500/30 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Stock & Valuation
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">مخزون قطع الغيار والمستهلكات</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                جرد الكميات المتوفرة، التقييم المالي الإجمالي، وتنبيهات القطع والمستهلكات النافدة.
              </p>
            </div>

            {/* Filter */}
            <div className="pt-2 border-t border-navy-800/80">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer p-2 rounded-xl bg-navy-850/60 border border-navy-750">
                <input
                  type="checkbox"
                  checked={stockLowOnly}
                  onChange={(e) => setStockLowOnly(e.target.checked)}
                  className="rounded bg-navy-900 border-navy-700 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="font-bold">تصدير فقط القطع ذات المخزون الحرج أو النافد</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-navy-800">
            <button
              onClick={handleExportStock}
              disabled={exporting === 'stock'}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exporting === 'stock' ? 'جاري التصدير...' : 'تصدير جرد المخزون Excel'}</span>
            </button>
          </div>
        </div>

        {/* 5. Official Executive PDF Report Card */}
        <div className="bg-gradient-to-br from-navy-900 via-navy-850 to-purple-950/40 border border-purple-800/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-5 hover:border-purple-500/40 transition-all md:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider">
                Document Officiel DSI (PDF)
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-white">التقرير التنفيذي الشامل لحوكمة وأداء مصلحة الإعلام الآلي</h3>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                وثيقة تدقيق رسمية مصممة بأعلى معايير الإدارة، جاهزة للطباعة والتوقيع موجهة للمديرية العامة.
                تتضمن مؤشرات الأداء الاستراتيجية (MTTR، معدل التغطية والجاهزية، توزيع التدخلات حسب الفروع، وخانات التأشير والتوقيع).
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-purple-900/40 text-center">
              <div className="bg-navy-900/60 p-2 rounded-xl border border-navy-800">
                <div className="text-xs font-bold text-slate-400">تنسيق التقرير</div>
                <div className="text-xs font-extrabold text-white mt-0.5">A4 Haute Qualité</div>
              </div>
              <div className="bg-navy-900/60 p-2 rounded-xl border border-navy-800">
                <div className="text-xs font-bold text-slate-400">المصادقة</div>
                <div className="text-xs font-extrabold text-purple-400 mt-0.5">تأشيرة DSI</div>
              </div>
              <div className="bg-navy-900/60 p-2 rounded-xl border border-navy-800">
                <div className="text-xs font-bold text-slate-400">تحديث البيانات</div>
                <div className="text-xs font-extrabold text-emerald-400 mt-0.5">لحظي ومباشر</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-purple-900/40">
            <button
              onClick={() => handleExecutivePdf(true)}
              disabled={exporting === 'exec-inline'}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg shadow-purple-600/25 transition-all disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              <span>{exporting === 'exec-inline' ? 'جاري المعاينة...' : 'معاينة مباشرة في المتصفح'}</span>
            </button>
            <button
              onClick={() => handleExecutivePdf(false)}
              disabled={exporting === 'exec-dl'}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-navy-850 hover:bg-navy-800 border border-purple-800/80 text-purple-300 font-extrabold text-xs transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>تحميل التقرير PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
