import type { Metadata } from 'next';
import './globals.css';
import ClientProviders from '../components/ClientProviders';

export const metadata: Metadata = {
  title: 'Easy Rental — Vehicle rental platform',
  description: 'Rent vehicles across agencies in Cameroon. Browse catalog, book online, manage fleet.',
  keywords: ['vehicle rental', 'location voiture', 'Cameroon', 'Easy Rental'],
  openGraph: {
    title: 'Easy Rental',
    description: 'Vehicle rental platform for organizations, agencies and clients',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="bg-white dark:bg-[#0f1323] transition-colors duration-300 overflow-y-auto">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
