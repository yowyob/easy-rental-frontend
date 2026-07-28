/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, ClipboardCheck, Check, ChevronRight, Search } from 'lucide-react';
import { rentalService } from '@pwa-easy-rental/shared-services';
import { RentalDetailsModal } from './rentals/RentalDetailsModal';

/** Étapes du cycle et à partir de quel statut elles sont considérées faites. */
const STEPS = [
  { key: 'PAID', label: 'Payé' },
  { key: 'CHECKIN', label: 'Check-in' },
  { key: 'ONGOING', label: 'En cours' },
  { key: 'RETURN', label: 'Retour signalé' },
  { key: 'CHECKOUT', label: 'Check-out' },
  { key: 'SETTLED', label: 'Réglé' },
];

// Rang atteint par statut (index max de STEPS considéré "fait").
const RANK: Record<string, number> = {
  PENDING: -1,
  RESERVED: 0,   // payé partiellement — on considère "Payé" en cours
  PAID: 0,       // payé, check-in à faire
  ONGOING: 2,    // check-in fait + en cours
  UNDER_REVIEW: 3, // retour signalé (check-out à faire)
  COMPLETED: 5,  // tout fait
  CANCELLED: -1,
};

const statusLabel: Record<string, string> = {
  PENDING: 'En attente de paiement',
  RESERVED: 'Acompte payé',
  PAID: 'Payé — check-in à faire',
  ONGOING: 'En location',
  UNDER_REVIEW: 'Retour à inspecter / régler',
  COMPLETED: 'Clôturée',
  CANCELLED: 'Annulée',
};

const statusTone: Record<string, string> = {
  PAID: 'bg-blue-50 text-[#0528d6] border-blue-100',
  ONGOING: 'bg-green-50 text-green-600 border-green-100',
  UNDER_REVIEW: 'bg-amber-50 text-amber-600 border-amber-100',
  COMPLETED: 'bg-slate-50 text-slate-500 border-slate-100',
  RESERVED: 'bg-blue-50 text-[#0528d6] border-blue-100',
  PENDING: 'bg-slate-50 text-slate-400 border-slate-100',
  CANCELLED: 'bg-red-50 text-red-500 border-red-100',
};

export const InspectionsView = ({ userData, t }: { userData: any; t: any }) => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ACTIVE' | 'ALL'>('ACTIVE');

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const res = await rentalService.getAgencyRentals(userData.agencyId);
      if (res.ok) setRentals(res.data || []);
    } finally { setLoading(false); }
  }, [userData?.agencyId]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  const visible = rentals
    .filter((r) => (filter === 'ALL' ? true : ['PAID', 'ONGOING', 'UNDER_REVIEW'].includes(r.status)))
    .filter((r) => `${r.clientName ?? ''} ${r.id}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => (RANK[a.status] ?? 9) - (RANK[b.status] ?? 9));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="text-[#0528d6]" size={22} />
        <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">Inspections & cycle location</h2>
      </div>

      {/* Barre filtres */}
      <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-white dark:bg-[#1a1d2d] p-3 rounded-[2rem] border border-slate-200 dark:border-slate-800">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl">
          {[{ id: 'ACTIVE', label: 'En cours' }, { id: 'ALL', label: 'Toutes' }].map((tab) => (
            <button key={tab.id} onClick={() => setFilter(tab.id as any)}
              className={`px-5 py-2 rounded-xl text-[10px] font-black italic uppercase tracking-widest transition-all ${filter === tab.id ? 'bg-white dark:bg-slate-800 text-[#0528d6] shadow' : 'text-slate-400'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Client, dossier…"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#0528d6]/20" />
        </div>
      </div>

      {/* Liste des dossiers avec progression */}
      <div className="space-y-3">
        {visible.length === 0 && (
          <p className="text-center text-slate-400 italic py-12">Aucun dossier.</p>
        )}
        {visible.map((r) => {
          const rank = RANK[r.status] ?? -1;
          return (
            <button
              key={r.id}
              onClick={() => setSelectedId(r.id)}
              className="w-full text-left bg-white dark:bg-[#1a1d2d] rounded-[2rem] border border-slate-200 dark:border-slate-800 p-5 hover:border-[#0528d6]/40 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-black italic text-slate-900 dark:text-white truncate">{r.clientName || 'Walk-in comptoir'}</span>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${statusTone[r.status] || statusTone.PENDING}`}>
                      {statusLabel[r.status] || r.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1">
                    #{String(r.id).slice(0, 8).toUpperCase()} · {r.startDate ? new Date(r.startDate).toLocaleDateString() : ''}
                    {r.endDate ? ` → ${new Date(r.endDate).toLocaleDateString()}` : ''}
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-[#0528d6] shrink-0" />
              </div>

              {/* Stepper progression */}
              <div className="flex items-center">
                {STEPS.map((step, i) => {
                  const done = i <= rank;
                  const current = i === rank + 1 && r.status !== 'COMPLETED' && r.status !== 'CANCELLED';
                  return (
                    <React.Fragment key={step.key}>
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`size-7 rounded-full flex items-center justify-center text-[10px] font-black border-2 ${
                          done ? 'bg-[#0528d6] border-[#0528d6] text-white'
                          : current ? 'border-[#0528d6] text-[#0528d6] bg-white dark:bg-slate-900'
                          : 'border-slate-200 text-slate-300 bg-white dark:bg-slate-900'
                        }`}>
                          {done ? <Check size={13} /> : i + 1}
                        </div>
                        <span className={`text-[8px] font-black uppercase tracking-tight text-center leading-tight ${done ? 'text-[#0528d6]' : current ? 'text-[#0528d6]' : 'text-slate-300'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < STEPS.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 ${i < rank ? 'bg-[#0528d6]' : 'bg-slate-200 dark:bg-slate-800'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {selectedId && (
        <RentalDetailsModal
          t={t}
          rentalId={selectedId}
          initialTab="INSPECTION"
          onClose={() => setSelectedId(null)}
          onValidated={loadData}
        />
      )}
    </div>
  );
};
