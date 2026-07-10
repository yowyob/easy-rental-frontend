import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Easy Rental — Vehicle rental platform',
  description: 'Rent vehicles across agencies in Cameroon. Browse catalog, book online, manage fleet.',
  keywords: ['vehicle rental', 'location voiture', 'Cameroon', 'Easy Rental'],
  manifest: '/manifest.json',
  openGraph: {
    title: 'Easy Rental',
    description: 'Vehicle rental platform for organizations, agencies and clients',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-[#0f1323] transition-colors duration-300 m-0 p-0">
        {children}
      </body>
    </html>
  );
}
