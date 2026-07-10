import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AdminApiProvider } from '../components/AdminApiProvider';

export const metadata: Metadata = {
  title: 'Easy Rental — Console Admin',
  description: 'Gestion plateforme : organisations et plans d\'abonnement',
};

export const viewport: Viewport = {
  themeColor: '#0528d6',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen bg-[#f4f7fe] dark:bg-[#0f1323] m-0 p-0 font-sans">
        <AdminApiProvider>
          <main>{children}</main>
        </AdminApiProvider>
      </body>
    </html>
  );
}
