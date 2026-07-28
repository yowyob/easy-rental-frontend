/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Search, Loader2, Plus, Activity, CheckCircle2, AlertCircle, Check, History } from 'lucide-react';
import { rentalService, vehicleService, orgService } from '@pwa-easy-rental/shared-services';
import { StatCard } from '../components/StatCard';
import { BookingCard } from './bookings/BookingCard';
import { BookingFormModal } from './bookings/BookingFormModal';
import { RentalDetailsModal } from './rentals/RentalDetailsModal';
import { hasPermission } from '../utils/permissions';
import { Portal } from '../components/Portal';

export const ReservationsView = ({ userData, t, staffPermissions }: any) => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [listTab, setListTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [orgInfo, setOrgInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [activeModal, setActiveModal] = useState<'FORM' | 'DETAILS' | 'CONFIRM' | null>(null);
  const [selectedRentalId, setSelectedRentalId] = useState<string | null>(null);
  const [inspectionRentalId, setInspectionRentalId] = useState<string | null>(null);
  const [resources, setResources] = useState({ vehicles: [] as any, drivers: [] as any});
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // État pour la popup de confirmation personnalisée
  const [confirmConfig, setConfirmConfig] = useState<{ rental: any; title: string; message: string } | null>(null);

  const loadData = useCallback(async () => {
    if (!userData?.agencyId) return;
    setLoading(true);
    try {
      const [res, histRes, orgRes] = await Promise.all([
        rentalService.getAgencyReservations(userData.agencyId),
        rentalService.getAgencyReservationHistory(userData.agencyId),
        orgService.getOrgDetails(userData.organizationId)
      ]);
      if (res.ok) {
        setReservations((res.data || []).filter((r: any) => ['PENDING', 'RESERVED', 'PAID'].includes(r.status)));
      }
      if (histRes.ok) setHistory(histRes.data || []);
      if (orgRes.ok) setOrgInfo(orgRes.data);
    } finally { setLoading(false); }
  }, [userData]);

  useEffect(() => { loadData(); }, [loadData]);

  // --- LOGIQUE DE DÉMARRAGE (CASCADE API) ---
  const executeStartSequence = async (rental: any) => {
    const remaining = rental.totalAmount - rental.amountPaid;
    const isFullPaid = rental.status === 'PAID';

    setActionLoading(rental.id);
    setActiveModal(null); // Ferme la popup de confirmation
    
    try {
      // 1. Enregistrement du solde Cash si nécessaire → atteindre le statut PAID
      if (!isFullPaid && remaining > 0) {
        const payRes = await rentalService.payRental(rental.id, { amount: remaining, method: 'CASH' });
        if (!payRes.ok) throw new Error(payRes.data?.message);
      }

      // 2. R2 : plus de démarrage direct — on ouvre le dossier sur l'onglet Inspection
      // pour que l'agent réalise le check-in (photos + checklist) avant la remise des clés.
      await loadData();
      setInspectionRentalId(rental.id);
    } catch (e: any) {
      alert(e.message || t.reservations.errorProcess);
    } finally {
      setActionLoading(null);
      setConfirmConfig(null);
    }
  };

  // --- OUVERTURE DE LA CONFIRMATION ---
  const handleStartRequest = (rental: any) => {
    const isFullPaid = rental.status === 'PAID';
    const remaining = rental.totalAmount - rental.amountPaid;

    setConfirmConfig({
        rental,
        title: t.reservations.confirmStartTitle,
        message: isFullPaid 
            ? t.reservations.confirmHandover 
            : t.reservations.confirmCashDesc.replace('{{amount}}', remaining.toLocaleString())
    });
    setActiveModal('CONFIRM');
  };

  const handleConfirmDeposit = async (rental: any) => {
    const deposit = Math.ceil(Number(rental.totalAmount ?? 0) * 0.6);
    setActionLoading(rental.id);
    try {
      const payRes = await rentalService.payRental(rental.id, { amount: deposit, method: 'CASH' });
      if (!payRes.ok) throw new Error(payRes.data?.message || 'Encaissement impossible.');
      await loadData();
    } catch (e: any) {
      alert(e.message || t.reservations?.errorProcess);
    } finally {
      setActionLoading(null);
    }
  };

  const sourceList = listTab === 'ACTIVE' ? reservations : history;
  const filtered = sourceList.filter((r) => {
    const term = searchTerm.toLowerCase();
    const name = String(r.clientName ?? '').toLowerCase();
    const plate = String(r.licencePlate ?? '').toLowerCase();
    return name.includes(term) || plate.includes(term);
  });

  if (loading && reservations.length === 0 && history.length === 0) return <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#080b14]"><Loader2 className="animate-spin text-[#0528d6] size-12" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 text-left relative">
      
      {/* OVERLAY CHARGEMENT CASCADE */}
      {actionLoading && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
              <div className="bg-white dark:bg-[#1a1d2d] p-10 rounded-[3rem] shadow-2xl text-center border border-white/20">
                  <Loader2 className="animate-spin text-[#0528d6] size-14 mx-auto mb-6" />
                  <h3 className="font-black uppercase italic text-slate-800 dark:text-white tracking-widest leading-none">{t.reservations.processing}</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-bold mt-3 italic">{t.reservations.stepPay} & {t.reservations.stepStart}</p>
              </div>
          </div>
      )}

      {/* KPI SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label={t.sidebar.reservations} value={reservations.length} icon={<Calendar className="text-[#0528d6]"/>} />
        <StatCard label={t.rentals.confirmedLabel} value={reservations.filter(r => r.status === 'RESERVED').length} icon={<Activity className="text-orange-500"/>} />
        <StatCard label={t.sidebar.status} value={reservations.filter(r => r.status === 'PAID').length} icon={<CheckCircle2 className="text-green-500"/>} />
      </div>

      {/* TABS + SEARCH */}
      <div className="bg-white dark:bg-[#1a1d2d] p-4 md:p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setListTab('ACTIVE')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all ${listTab === 'ACTIVE' ? 'bg-white dark:bg-slate-800 text-[#0528d6] shadow-md' : 'text-slate-400'}`}
            >
              {t.reservations?.tabActive ?? 'En cours'} ({reservations.length})
            </button>
            <button
              type="button"
              onClick={() => setListTab('HISTORY')}
              className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase italic transition-all flex items-center justify-center gap-2 ${listTab === 'HISTORY' ? 'bg-white dark:bg-slate-800 text-[#0528d6] shadow-md' : 'text-slate-400'}`}
            >
              <History size={14} /> {t.reservations?.tabHistory ?? 'Historique'} ({history.length})
            </button>
          </div>
          <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full text-left">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input placeholder={t.header.search} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-black italic outline-none focus:ring-2 focus:ring-[#0528d6]/20 dark:text-white transition-all shadow-inner uppercase tracking-tighter" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {hasPermission(userData, staffPermissions, 'rental:create') && listTab === 'ACTIVE' && (
            <button onClick={() => { setFormError(null); setActiveModal('FORM'); }} className="w-full md:w-auto px-8 py-3.5 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 italic tracking-widest">
                <Plus size={16}/> {t.reservations.create}
            </button>
          )}
          </div>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {filtered.map(r => (
          <BookingCard 
            key={r.id} 
            rental={r} 
            userData={userData} 
            t={t}
            variant={listTab === 'HISTORY' ? 'history' : 'active'}
            staffPermissions={staffPermissions}
            onView={() => setSelectedRentalId(r.id)}
            onStart={listTab === 'ACTIVE' && r.status !== 'PENDING' ? () => handleStartRequest(r) : undefined}
            onConfirmDeposit={listTab === 'ACTIVE' && r.status === 'PENDING' ? () => handleConfirmDeposit(r) : undefined}
          />
        ))}
        {filtered.length === 0 && !loading && (
          <p className="col-span-full text-center text-[11px] font-bold text-slate-400 uppercase italic py-12">
            {listTab === 'HISTORY'
              ? (t.reservations?.historyEmpty ?? 'Aucune réservation passée pour le moment.')
              : sourceList.length > 0
                ? 'Aucun dossier ne correspond à la recherche.'
                : (t.reservations?.empty ?? 'Aucune réservation pour le moment.')}
          </p>
        )}
      </div>

      {/* MODAL FORMULAIRE */}
      {activeModal === 'FORM' && (
        <BookingFormModal 
          mode="RESERVATION" 
          t={t} 
          vehicles={resources.vehicles}
          agencyId={userData.agencyId}
          isDriverRequired={true} 
          onClose={() => { setActiveModal(null); setFormError(null); }} 
          onSubmit={async (d: any) => {
            setFormLoading(true);
            setFormError(null);
            try {
              const payload = {
                ...d,
                startDate: new Date(d.startDate).toISOString(),
                endDate: new Date(d.endDate).toISOString(),
                driverId: d.driverId || null,
              };
              const res = await rentalService.createAgencyRental(userData.agencyId, payload);
              if (!res.ok) {
                setFormError(res.data?.message || t.reservations?.errorProcess || 'Création impossible.');
                return;
              }

              setActiveModal(null);
              await loadData();
            } catch {
              setFormError(t.reservations?.errorProcess || 'Erreur de connexion au serveur.');
            } finally {
              setFormLoading(false);
            }
          }}
          loading={formLoading}
          submitError={formError}
        />
      )}

      {/* MODAL CONFIRMATION PERSONNALISÉ */}
      {activeModal === 'CONFIRM' && confirmConfig && (
          <ConfirmationModal 
            title={confirmConfig.title}
            message={confirmConfig.message}
            onConfirm={() => executeStartSequence(confirmConfig.rental)}
            onCancel={() => { setActiveModal(null); setConfirmConfig(null); }}
            t={t}
          />
      )}

      {selectedRentalId && <RentalDetailsModal t={t} rentalId={selectedRentalId} onClose={() => setSelectedRentalId(null)} onValidated={loadData} />}
      {inspectionRentalId && (
        <RentalDetailsModal
          t={t}
          rentalId={inspectionRentalId}
          initialTab="INSPECTION"
          onClose={() => setInspectionRentalId(null)}
          onValidated={loadData}
        />
      )}
    </div>
  );
};

// --- SOUS-COMPOSANT : MODAL DE CONFIRMATION ---
const ConfirmationModal = ({ title, message, onConfirm, onCancel, t }: any) => (
    <Portal>
        <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onCancel} />
            <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in text-center p-10">
                <div className="size-20 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] flex items-center justify-center text-[#0528d6] mx-auto mb-6 shadow-inner">
                    <AlertCircle size={40} />
                </div>
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-4 leading-tight">{title}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 italic mb-10 leading-relaxed uppercase">{message}</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={onConfirm}
                        className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest"
                    >
                        <Check size={18}/> {t.common.confirm}
                    </button>
                    <button 
                        onClick={onCancel}
                        className="w-full py-4 text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase italic tracking-widest hover:text-red-500 transition-colors"
                    >
                        {t.common.cancel}
                    </button>
                </div>
            </div>
        </div>
    </Portal>
);