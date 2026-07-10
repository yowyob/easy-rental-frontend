/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Store, Plus, Search, Loader2, ChevronLeft, ChevronRight, LayoutGrid, ShieldCheck } from 'lucide-react';
import { agencyService, orgService, buildAgencyFormInitialData, normalizeCmPhone } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { AgencyCard } from './agencies/AgencyCard';
import { AgencyForm } from './agencies/AgencyForm';
import { AgencyDetailsModal } from './agencies/AgencyDetailsModal';
import { QuotaAlertModal } from '@/components/QuotaAlertModal';
import { isOrgGovernanceBlocked } from '../components/GovernanceBanner';

const ITEMS_PER_PAGE = 6;

export const AgenciesView = ({ orgData, setCurrentView, t }: any) => {
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeModal, setActiveModal] = useState<'FORM' | 'DETAILS' | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const governanceStatus = orgData?.governanceStatus ?? orgData?.governance_status;
  const governanceBlocked = isOrgGovernanceBlocked(orgData);
  const agencySaveFallback = selectedAgency
    ? 'Impossible de modifier l\'agence. Vérifiez vos informations.'
    : governanceStatus === 'PENDING_APPROVAL'
      ? 'Création impossible : votre organisation est en attente d\'approbation par la plateforme.'
      : 'Impossible de créer l\'agence. Vérifiez vos informations.';

  const loadData = useCallback(async () => {
    if (!orgData?.id) return;
    setLoading(true);
    try {
      const [agRes, subRes] = await Promise.all([
        agencyService.getAgencies(orgData.id),
        orgService.getSubscription(orgData.id)
      ]);
      if (agRes.ok) setAgencies(agRes.data || []);
      if (subRes.ok) setSubscription(subRes.data);
    } finally { setLoading(false); }
  }, [orgData?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const filtered = useMemo(() => agencies.filter(a => 
    `${a.name} ${a.city}`.toLowerCase().includes(searchTerm.toLowerCase())
  ), [agencies, searchTerm]);

  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const handleFormSubmit = async (finalData: any) => {
    setModalLoading(true);
    setFormError('');
    const payload = {
      ...finalData,
      email: finalData.email?.trim().toLowerCase(),
      phone: normalizeCmPhone(String(finalData.phone ?? '')),
    };
    try {
      const res = selectedAgency
        ? await agencyService.updateAgency(selectedAgency.id, payload)
        : await agencyService.createAgency(orgData.id, payload);
      if (res.ok) {
        setActiveModal(null);
        setFormError('');
        loadData();
        return;
      }
      const apiMessage = (res.data as { message?: string })?.message;
      setFormError(apiMessage || agencySaveFallback);
    } catch {
      setFormError('Erreur réseau ou serveur indisponible.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleAddClick = () => {
    if (governanceBlocked) {
      setFormError(agencySaveFallback);
      return;
    }
    if (agencies.length >= (subscription?.maxAgencies || 1)) setShowQuotaModal(true);
    else { setSelectedAgency(null); setFormError(''); setActiveModal('FORM'); }
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-[#0528d6] size-10" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.agencies.statsPoints} value={agencies.length} icon={<Store />} />
        <StatCard label={t.agencies.statsZone} value={new Set(agencies.map(a => a.city)).size} icon={<LayoutGrid className="text-orange-500" />} />
        <StatCard label={t.agencies.statsFleet} value={agencies.reduce((acc, a) => acc + (Number(a.totalVehicles) || 0), 0)} icon={<ShieldCheck className="text-green-500" />} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1a1d2d] p-4 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0528d6]" size={18} />
          <input 
            placeholder={t.agencies.searchPlaceholder} 
            className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-xl text-sm font-black italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 transition-all dark:text-white" 
            value={searchTerm} 
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} 
          />
        </div>
        <button
          onClick={handleAddClick}
          disabled={governanceBlocked}
          title={governanceBlocked ? agencySaveFallback : undefined}
          className="w-full md:w-auto px-6 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all italic disabled:opacity-50 disabled:hover:scale-100"
        >
          <Plus size={18} /> {t.agencies.addBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginated.map(agency => (
          <AgencyCard key={agency.id} agency={agency} 
                     onView={(id: string) => { setSelectedAgency(id); setActiveModal('DETAILS'); }}
                     onEdit={(a: any) => { setSelectedAgency(a); setFormError(''); setActiveModal('FORM'); }} 
                     onDelete={async (id: string) => { if(confirm(t.agencies.deleteConfirm)) { await agencyService.deleteAgency(id); loadData(); } }} 
                     t={t}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-8">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronLeft/></button>
          <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-widest px-4">
            {t.common.page} {currentPage} / {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="size-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all"><ChevronRight/></button>
        </div>
      )}

      {activeModal === 'DETAILS' && <AgencyDetailsModal agencyId={selectedAgency} onClose={() => setActiveModal(null)} t={t} />}
      {activeModal === 'FORM' && (
        <AgencyForm 
                    key={selectedAgency?.id ?? 'new'}
                    t={t}
                    editingAgency={selectedAgency} 
                    initialData={buildAgencyFormInitialData(selectedAgency)}
                    onClose={() => { setActiveModal(null); setFormError(''); }} 
                    onSubmit={handleFormSubmit} 
                    modalLoading={modalLoading}
                    formError={formError} />
      )}
      {showQuotaModal && <QuotaAlertModal t={t} limit={subscription?.maxAgencies} type={t.agencies.quotaType} onClose={() => setShowQuotaModal(false)} onUpgrade={() => setCurrentView('SUBSCRIPTION')} />}
    </div>
  );
};