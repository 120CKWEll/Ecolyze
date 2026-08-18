import './globals.css';
import { ReactNode } from 'react';
import ClientLayout from './components/ClientLayout'; // ดึง Layout ตัวใหม่มาใช้

export const metadata = {
  title: 'RecycleSmart - ระบบแยกขยะอัจฉริยะ',
  description: 'KKU Green University',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <head>
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gray-50 flex flex-col md:flex-row h-screen overflow-hidden text-gray-800 font-sans selection:bg-emerald-200">
        
        {/* ให้ ClientLayout จัดการเรื่องการซ่อน/แสดงเมนูให้ทั้งหมด */}
        <ClientLayout>
          {children}
        </ClientLayout>

      </body>
    </html>
  );
}