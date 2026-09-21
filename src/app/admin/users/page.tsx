'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getAdminUsersAction,
  createAdminUserAction,
  toggleAdminUserStatusAction,
  deleteAdminUserAction,
} from '@/app/actions/users';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Shield,
  Key,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  Mail,
  User,
  Lock,
} from 'lucide-react';

const roleLabels: Record<string, { label: string; bg: string; text: string }> = {
  SUPER_ADMIN: { label: 'مدير نظام عام (Super Admin)', bg: 'bg-rose-500/20 border-rose-500/30', text: 'text-rose-300' },
  ADMIN: { label: 'مدير مصلحة (Admin)', bg: 'bg-indigo-500/20 border-indigo-500/30', text: 'text-indigo-300' },
  TECHNICIAN_LEAD: { label: 'رئيس فرقة تقنية (Lead)', bg: 'bg-sky-500/20 border-sky-500/30', text: 'text-sky-300' },
  VIEWER: { label: 'مشاهد فقط (Viewer)', bg: 'bg-slate-500/20 border-slate-500/30', text: 'text-slate-300' },
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsersAction();
      if (res.success && res.data) setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await createAdminUserAction(formData as any);
      if (res.success) {
        setIsModalOpen(false);
        setFormData({
          username: '',
          fullName: '',
          email: '',
          password: '',
          role: 'ADMIN',
        });
        fetchUsers();
      } else {
        setError(res.error || 'فشل إضافة المستخدم');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, current: boolean) => {
    await toggleAdminUserStatusAction(id, !current);
    fetchUsers();
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
      await deleteAdminUserAction(id);
      fetchUsers();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-navy-900/60 p-6 rounded-3xl border border-navy-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">إدارة المستخدمين والصلاحيات</h1>
              <p className="text-xs text-purple-400 font-bold uppercase tracking-wider">
                Admin Users & Role-Based Access Control
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-400 font-medium mr-12">
            التحكم في حسابات مسؤولي المنصة، تحديد الأدوار، وإدارة صلاحيات الوصول إلى لوحات التحكم والتقارير.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold text-xs shadow-lg shadow-purple-500/20 hover:opacity-90 transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم جديد</span>
          </button>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2.5 rounded-xl bg-navy-850 border border-navy-750 text-slate-300 hover:text-white hover:border-sky-500/40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-navy-900/80 border border-navy-800 rounded-3xl p-6 shadow-xl">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">جاري تحميل قائمة المستخدمين...</div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="font-bold">لا يوجد مستخدمين مسجلين في جدول الأدمن حالياً.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold hover:bg-purple-500/30 transition-all"
            >
              إنشاء أول حساب مستخدم
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="py-3 px-4 text-right">الاسم الكامل</th>
                  <th className="py-3 px-4 text-right">اسم المستخدم</th>
                  <th className="py-3 px-4 text-right">البريد الإلكتروني</th>
                  <th className="py-3 px-4 text-right">الدور / الصلاحية</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">تاريخ الإنشاء</th>
                  <th className="py-3 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60 text-xs font-medium text-slate-300">
                {users.map((user) => {
                  const roleConfig = roleLabels[user.role] || roleLabels.ADMIN;
                  return (
                    <tr key={user.id} className="hover:bg-navy-850/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-navy-800 border border-navy-700 flex items-center justify-center text-purple-400">
                          <User className="w-4 h-4" />
                        </div>
                        <span>{user.fullName}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-purple-300 dir-ltr text-right">
                        @{user.username}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {user.email}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold border ${roleConfig.bg} ${roleConfig.text}`}
                        >
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.active)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-all ${
                            user.active
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          {user.active ? (
                            <>
                              <CheckCircle className="w-3 h-3" /> نشط
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> معطل
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {new Date(user.createdAt).toLocaleDateString('ar-DZ')}
                      </td>
                      <td className="py-3.5 px-4 text-left">
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-900 border border-navy-750 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-right">
            <div className="flex items-center justify-between border-b border-navy-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                إضافة مستخدم مسؤول جديد
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-bold text-slate-300">
              <div>
                <label className="block mb-1 text-slate-400">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عبد القادر عثماني"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-slate-400">اسم المستخدم (Login) *</label>
                  <input
                    type="text"
                    required
                    placeholder="a.osmani"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-purple-500 outline-none dir-ltr"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-400">الدور / الصلاحية</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white focus:border-purple-500 outline-none"
                  >
                    <option value="SUPER_ADMIN">مدير نظام عام (Super Admin)</option>
                    <option value="ADMIN">مدير مصلحة (Admin)</option>
                    <option value="TECHNICIAN_LEAD">رئيس فرقة تقنية (Lead)</option>
                    <option value="VIEWER">مشاهد فقط (Viewer)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-slate-400">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  placeholder="a.osmani@entreprise.dz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-purple-500 outline-none dir-ltr"
                />
              </div>

              <div>
                <label className="block mb-1 text-slate-400">كلمة المرور *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-850 border border-navy-750 text-white placeholder-slate-500 focus:border-purple-500 outline-none dir-ltr"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-navy-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-800 text-slate-400 hover:text-white font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-extrabold shadow-lg shadow-purple-500/20 disabled:opacity-50"
                >
                  {submitting ? 'جاري الإنشاء...' : 'إنشاء المستخدم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
