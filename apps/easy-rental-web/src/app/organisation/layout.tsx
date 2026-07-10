import { ServiceWorkerRegister } from '@/consoles/organisation/components/ServiceWorkerRegister';

export default function OrganisationLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <main>{children}</main>
    </>
  );
}
