import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IT-Tasker | Enterprise IT Support & Intervention System',
  description: "Système de gestion des tickets et fiches d'intervention IT multi-sites pour entreprise.",
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'IT-ERP',
  },
};

export const viewport: Viewport = {
  themeColor: '#020617',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-navy-950 text-slate-100 min-h-screen antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
