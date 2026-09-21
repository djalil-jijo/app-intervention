'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, AlertCircle, Wrench, Clock, X, ExternalLink } from 'lucide-react';
import { getNotificationsAction, NotificationItem } from '@/app/actions/notifications';
import Link from 'next/link';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotificationsAction();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all flex items-center justify-center"
        title="التنبيهات والإشعارات الذكية"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse border-2 border-navy-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 w-80 sm:w-96 bg-navy-900 border border-navy-750 rounded-2xl shadow-2xl z-50 overflow-hidden text-right">
          <div className="p-4 border-b border-navy-800 flex items-center justify-between bg-navy-950/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">التنبيهات الذكية</span>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-bold">
                {unreadCount} تنبيه
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-[380px] overflow-y-auto divide-y divide-navy-800/60">
            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs font-medium">
                جاري فحص التنبيهات...
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                ✨ لا توجد تنبيهات عاجلة، كل الأنظمة تعمل بصورة طبيعية!
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  href={notif.link}
                  onClick={() => setIsOpen(false)}
                  className={`p-3.5 flex items-start gap-3 hover:bg-navy-850/80 transition-colors block ${
                    notif.severity === 'error'
                      ? 'bg-rose-500/5'
                      : notif.severity === 'warning'
                      ? 'bg-amber-500/5'
                      : 'bg-sky-500/5'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.severity === 'error'
                        ? 'bg-rose-500/20 text-rose-400'
                        : notif.severity === 'warning'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-sky-500/20 text-sky-400'
                    }`}
                  >
                    {notif.type === 'CRITICAL_TICKET' && <AlertCircle className="w-4 h-4" />}
                    {notif.type === 'LOW_STOCK' && <AlertTriangle className="w-4 h-4" />}
                    {notif.type === 'OVERDUE_MAINTENANCE' && <Wrench className="w-4 h-4" />}
                    {notif.type === 'UNASSIGNED_TICKET' && <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{notif.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {new Date(notif.createdAt).toLocaleTimeString('ar-DZ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
