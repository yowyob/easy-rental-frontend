/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Loader2, ChevronLeft, ChevronRight, Banknote, ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import { transactionService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { TransactionDetailsModal } from './transactions/TransactionDetailsModal';

const ITEMS_PER_PAGE = 8;

export const TransactionsView = ({ userData, t }: { userData: any, t: any }) => {
  const[transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'RENTAL_PAYMENT' | 'REFUND'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const res = await transactionService.getAgencyTransactions(userData.agencyId);
      if (res.ok) setTransactions(res.data ||[]);
    } finally { setLoading(false); }
  }, [userData?.agencyId]);

  useEffect(() => { loadData(); },[loadData]);

  const filtered = useMemo(() => transactions.filter(tr => {
    const matchSearch = `${tr.reference} ${tr.description}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'ALL' || tr.type === filterType;
    return matchSearch && matchType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, searchTerm, filterType]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const totalIncome = transactions.filter(tr => tr.type === 'RENTAL_PAYMENT').reduce((acc, tr) => acc + Math.abs(tr.amount || 0), 0);
  const totalRefund = transactions.filter(tr => tr.type !== 'RENTAL_PAYMENT').reduce((acc, tr) => acc + Math.abs(tr.amount || 0), 0);

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.transactions.agencyTitle} value={transactions.length} icon={<Banknote />} />
        <StatCard label={t.transactions.rentalIncome} value={`${totalIncome.toLocaleString()} XAF`} icon={<ArrowUpRight className="text-green-500"/>} />
        <StatCard label={t.transactions.refunds} value={`${totalRefund.toLocaleString()} XAF`} icon={<ArrowDownRight className="text-red-500" />} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full md:w-auto">
            {[
              { id: 'ALL', label: t.transactions.tabAll },
              { id: 'RENTAL_PAYMENT', label: t.transactions.tabIncome },
              { id: 'REFUND', label: t.transactions.tabRefunds }
            ].map(tab => (
              <button key={tab.id} onClick={() => { setFilterType(tab.id as any); setCurrentPage(1); }} 
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black  italic transition-all ${filterType === tab.id ? 'bg-white dark:bg-slate-800 text-[#0528d6] shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
              </button>
            ))}
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input placeholder={t.transactions.searchPlaceholder} className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-black italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white" 
                 value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} />
        </div>
      </div>

      <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {paginated.length === 0 ? (
          <div className="p-20 text-center">
             <FileText className="mx-auto text-slate-200 mb-4" size={48} />
             <p className="text-slate-400 font-black uppercase italic tracking-widest">{t.transactions.noData}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginated.map(tx => {
              const isIncome = tx.type === 'RENTAL_PAYMENT';
              const absAmount = Math.abs(tx.amount || 0);

              return (
                <div key={tx.id} onClick={() => setSelectedTx(tx.id)} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-5 min-w-0">
                    <div className={`size-12 rounded-2xl flex items-center justify-center shrink-0 ${isIncome ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {isIncome ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-slate-900 dark:text-white  italic tracking-tighter truncate max-w-xs md:max-w-md">{tx.description}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] font-bold text-slate-400  tracking-widest shrink-0">{new Date(tx.date).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-mono text-slate-500 truncate">{tx.reference}</span>
                        {tx.method && <span className="px-2 py-0.5 bg-blue-50 text-[#0528d6] rounded text-[8px] font-black  shrink-0">{tx.method}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`text-lg font-black italic tracking-tighter ${isIncome ? 'text-green-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{absAmount.toLocaleString()} XAF
                    </p>
                    <p className={`text-[8px] font-black  tracking-widest mt-1 ${tx.status === 'COMPLETED' || tx.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'}`}>{tx.status}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 shadow-sm transition-all"><ChevronLeft size={18}/></button>
          <span className="text-[10px] font-black text-slate-500 uppercase italic px-4 tracking-widest">{t.common.page} {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 shadow-sm transition-all"><ChevronRight size={18}/></button>
        </div>
      )}

      {selectedTx && <TransactionDetailsModal transactionId={selectedTx} onClose={() => setSelectedTx(null)} t={t} />}
    </div>
  );
};