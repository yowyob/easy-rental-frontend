'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Construction, ArrowLeft } from 'lucide-react';

export default function ComingSoonContent() {
  const params = useSearchParams();
  const title = params.get('title') || 'Page en cours de développement';

  return (
    <main className="min-h-[50vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-lg text-center">
        <div className="mx-auto mb-5 size-14 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center">
          <Construction size={28} />
        </div>
        <h1 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-3">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Cette page sera disponible dans une prochaine version d&apos;Easy Rental.
        </p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0528d6] text-white text-xs font-black uppercase">
          <ArrowLeft size={14} /> Accueil
        </Link>
      </div>
    </main>
  );
}
