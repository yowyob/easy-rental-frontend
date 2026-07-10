'use client';

import { AdminApiProvider } from '@/consoles/admin/components/AdminApiProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminApiProvider>
      <main className="min-h-screen bg-[#f4f7fe] dark:bg-[#0f1323]">{children}</main>
    </AdminApiProvider>
  );
}
