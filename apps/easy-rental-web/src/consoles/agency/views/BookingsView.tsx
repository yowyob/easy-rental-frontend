/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Loader2, Clock, CheckCircle2, Search, Filter } from 'lucide-react';
import { rentalService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { BookingCard } from './bookings/BookingCard';

export const BookingsView = ({ userData, t, staffPermissions }: any) => {
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const res = await rentalService.getAgencyRentals(userData.agencyId);
      if (res.ok) setRentals(res.data || []);
    } finally { setLoading(false); }
  }, [userData?.agencyId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = rentals.filter(r => 
    `${r.clientName} ${r.licencePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.table.title} value={rentals.filter(r => r.status !== 'COMPLETED').length} icon={<Calendar />} />
        <StatCard label={t.kpi.active} value={rentals.filter(r => r.status === 'ONGOING').length} icon={<Clock className="text-[#0528d6]"/>} />
        <StatCard label={t.table.colRev} value={`${rentals.reduce((acc, r) => acc + (r.amountPaid || 0), 0).toLocaleString()} XAF`} icon={<CheckCircle2 className="text-green-500"/>} />
      </div>

      <div className="bg-white dark:bg-[#1a1d2d] p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
            <input 
                placeholder={t.header.search} 
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        <button className="px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-[#0528d6] transition-all flex items-center justify-center gap-2 italic">
            <Filter size={16}/> {t.table.filter}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filtered.length === 0 ? (
          <div className="col-span-full p-20 bg-white dark:bg-[#1a1d2d] rounded-[3rem] text-center border-2 border-dashed border-slate-100 dark:border-slate-800 shadow-inner">
             <Calendar className="size-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
             <p className="text-slate-400 font-black uppercase italic tracking-widest">{t.table.sub}</p>
          </div>
        ) : (
          filtered.map(rental => (
            <BookingCard 
              key={rental.id} 
              rental={rental} 
              userData={userData}
              staffPermissions={staffPermissions}
              t={t}
              onView={() => {}} // Implémenter selon besoin
            />
          ))
        )}
      </div>
    </div>
  );
};