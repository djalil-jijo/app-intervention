'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/ui/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center p-4">
        {/* Background pattern overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950">
        {/* Background pattern overlay */}
        <div
          className="fixed inset-0 pointer-events-none opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(56,189,248,0.04) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div
          className="fixed top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)',
          }}
        />
        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 py-7">
          {children}
        </div>
      </main>
    </div>
  );
}
