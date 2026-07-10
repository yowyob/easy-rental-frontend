import ClientProviders from '@/landing/components/ClientProviders';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
