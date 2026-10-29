import './globals.css';
import { ReactNode } from 'react';
import { Kanit } from 'next/font/google';
import ClientLayout from './components/ClientLayout';

const kanit = Kanit({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['thai', 'latin'],
  display: 'swap',
  variable: '--font-kanit',
});

export const metadata = {
  title: 'RecycleSmart - ระบบแยกขยะอัจฉริยะ',
  description: 'KKU Green University - ระบบวิเคราะห์การแยกขยะและสะสมแต้มอัจฉริยะ',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th" className={`${kanit.variable} ${kanit.className}`}>
      <head>
        <link rel="preconnect" href="https://unpkg.com" />
        <link rel="dns-prefetch" href="https://unpkg.com" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      </head>
      <body className="bg-slate-50/80 flex flex-col md:flex-row h-screen overflow-hidden text-slate-800 font-sans selection:bg-emerald-200 antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}