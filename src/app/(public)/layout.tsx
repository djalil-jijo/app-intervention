import { Navbar } from '@/components/ui/Navbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-navy-800/60 py-6 text-center text-xs text-slate-500 bg-navy-950/80 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} IT-Tasker Enterprise · Système d&apos;assistance &amp; d&apos;intervention informatique multi-sites.</p>
      </footer>
    </div>
  );
}
