import { Suspense } from 'react';
import ComingSoonContent from './ComingSoonContent';

export default function ComingSoonPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-400">Chargement…</div>}>
      <ComingSoonContent />
    </Suspense>
  );
}
