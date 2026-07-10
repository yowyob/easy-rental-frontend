import { ServiceWorkerRegister } from '@/consoles/client/components/ServiceWorkerRegister';

export default function ClientConsoleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegister />
      <main>{children}</main>
    </>
  );
}
