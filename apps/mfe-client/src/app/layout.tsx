import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'PWA Easy Rental',
  description: 'Location digitale sans frontières',
  manifest: '/client/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EasyRental',
  },
};

export const viewport: Viewport = {
  themeColor: '#0528d6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0f1323] transition-colors duration-300 m-0 p-0 font-sans">
        <ServiceWorkerRegister />
        <main>{children}</main>
      </body>
    </html>
  );
}