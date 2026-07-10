/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Zap, Activity } from 'lucide-react';
import { rentalService, agencyService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { BookingCard } from './bookings/BookingCard';
import { RentalDetailsModal } from './rentals/RentalDetailsModal';

export const ReservationsView = ({ orgData, t }: { orgData: any, t: any }) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('ALL');
  const [statusFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const [resRes, agRes] = await Promise.all([
        rentalService.getOrgReservations(orgData.id),
        agencyService.getAgencies(orgData.id)
      ]);
      if (resRes.ok) setReservations((resRes.data || []).filter((r: any) => ['PENDING', 'RESERVED', 'PAID'].includes(r.status)));
      if (agRes.ok) setAgencies(agRes.data || []);
    } finally { setLoading(false); }
  }, [orgData]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => {
    return reservations.filter(r => {
      const matchSearch = `${r.clientName} ${r.id}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAgency = selectedAgencyId === 'ALL' || r.agencyId === selectedAgencyId;
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchAgency && matchStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reservations, searchTerm, selectedAgencyId, statusFilter]);

  const cumulateReservationsAmount = () => {
    return reservations.reduce((sum, r) => sum + r.amountPaid, 0);
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.rentals.statReservations} value={reservations.length} icon={<Zap className="text-[#0528d6]"/>} />
        <StatCard label={t.rentals.statTotal} value={cumulateReservationsAmount() + " XAF"} icon={<Activity className="text-orange-500"/>} />
      </div>

      <div className="bg-white dark:bg-[#1a1d2d] p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full text-left">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input placeholder={t.rentals.searchPlaceholderReservations} className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm font-black italic border-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <select value={selectedAgencyId} onChange={e => setSelectedAgencyId(e.target.value)} className="w-full lg:w-48 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-black uppercase tracking-tighter border-none outline-none focus:ring-2 focus:ring-[#0528d6]/20">
                <option value="ALL">{t.rentals.allAgencies}</option>
                {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filtered.slice((currentPage-1)*6, currentPage*6).map(r => (
          <BookingCard key={r.id} rental={r} t={t}
            onView={() => setSelectedRentalId(r.id)}
          />
        ))}
      </div>

      {filtered.length > 6 && (
        <div className="flex justify-center items-center gap-4 pt-8">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronLeft/></button>
            <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest px-4">{t.common.page} {currentPage} / {Math.ceil(filtered.length / 6)}</span>
            <button disabled={filtered.length <= currentPage * 6} onClick={() => setCurrentPage(p => p + 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronRight/></button>
        </div>
      )}

      {selectedRentalId && <RentalDetailsModal rentalId={selectedRentalId} t={t} onClose={() => setSelectedRentalId(null)} />}
    </div>
  );
};