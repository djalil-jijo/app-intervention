'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Ticket, Laptop, Boxes, BookOpen, Users, ArrowRight, X, Command, FileSignature } from 'lucide-react';
import { globalSearchAction, GlobalSearchResult } from '@/app/actions/search';

export const GlobalSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const res = await globalSearchAction(query);
          if (res.success && res.data) setResults(res.data);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (link: string) => {
    setIsOpen(false);
    router.push(link);
  };

  const typeIcons: Record<string, any> = {
    TICKET: Ticket,
    ASSET: Laptop,
    STOCK: Boxes,
    KNOWLEDGE: BookOpen,
    TECHNICIAN: Users,
    DECHARGE: FileSignature,
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    TICKET: { label: 'تذكرة', color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
    ASSET: { label: 'عتاد', color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
    STOCK: { label: 'مخزون', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    KNOWLEDGE: { label: 'معارف', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    TECHNICIAN: { label: 'تقني', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
    DECHARGE: { label: 'وصل تسليم', color: 'text-sky-300 bg-sky-500/15 border-sky-500/30' },
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-navy-900/90 border border-navy-800 text-slate-400 hover:text-slate-200 hover:border-sky-500/40 text-xs transition-all shadow-inner group"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
          <span>بحث سريع...</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded bg-navy-800 border border-navy-700 text-[10px] text-slate-400 font-mono font-bold">
          Ctrl+K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-right flex flex-col max-h-[75vh]">
            {/* Input Header */}
            <div className="p-4 border-b border-navy-800 flex items-center gap-3 bg-navy-950/50">
              <Search className="w-5 h-5 text-sky-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث برقم التذكرة، كود العتاد، قطعة الغيار، المشكل التقني أو التقني..."
                className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-bold"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-slate-500 hover:text-slate-300">
                  <X className="w-4 h-4" />
                </button>
              )}
              <kbd className="px-2 py-0.5 rounded-lg bg-navy-850 border border-navy-750 text-[10px] text-slate-400 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results list */}
            <div className="flex-1 overflow-y-auto p-3 divide-y divide-navy-800/40">
              {loading ? (
                <div className="py-12 text-center text-slate-500 text-xs font-medium">
                  جاري البحث في قاعدة البيانات...
                </div>
              ) : query.trim().length < 2 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-1">
                  <p className="font-bold">اكتب حرفين على الأقل للبدء في البحث الموحد</p>
                  <p className="text-slate-500 text-[11px]">
                    يبحث تلقائياً عبر: التذاكر، العتاد، المخزون، قاعدة المعارف والتقنيين
                  </p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  لا توجد نتائج مطابقة لـ &quot;<span className="text-sky-400">{query}</span>&quot;
                </div>
              ) : (
                results.map((res) => {
                  const Icon = typeIcons[res.type] || Ticket;
                  const typeMeta = typeLabels[res.type] || { label: res.type, color: 'text-slate-400' };

                  return (
                    <button
                      key={res.id}
                      onClick={() => handleSelect(res.link)}
                      className="w-full text-right p-3 rounded-2xl hover:bg-navy-850/80 transition-all flex items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-700 flex items-center justify-center shrink-0 group-hover:border-sky-500/30">
                          <Icon className="w-4.5 h-4.5 text-sky-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-white truncate group-hover:text-sky-300 transition-colors">
                            {res.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{res.subtitle}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border ${typeMeta.color}`}
                        >
                          {typeMeta.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 rotate-180 transition-all" />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
