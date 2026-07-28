/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  X, User, Phone, Banknote, MapPin, Loader2, Clock, ShieldCheck, AlertTriangle, Car,
  ClipboardCheck, Gauge, KeyRound, LogOut,
} from 'lucide-react';
import { Portal } from '../../components/Portal';
import {
  rentalService, inspectionService, trackingService, resolveMediaDisplayUrl,
  type Inspection, type InspectionComparison, type TrackingSummary,
} from '@pwa-easy-rental/shared-services';
import { InspectionForm } from './inspection/InspectionForm';
import { CautionSettlementForm } from './inspection/CautionSettlementForm';
import { InspectionComparisonPanel } from './inspection/InspectionComparisonPanel';
import { RentalFinancialTimeline } from './inspection/RentalFinancialTimeline';

type Tab = 'DETAILS' | 'INSPECTION' | 'TRACKING' | 'CAUTION';

export const RentalDetailsModal = ({ rentalId, onClose, onValidated, t, initialTab }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [tab, setTab] = useState<Tab>(initialTab || 'DETAILS');
  const [submitting, setSubmitting] = useState(false);

  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [comparison, setComparison] = useState<InspectionComparison | null>(null);
  const [tracking, setTracking] = useState<TrackingSummary | null>(null);
  const [checkInMode, setCheckInMode] = useState(false);
  const [checkOutMode, setCheckOutMode] = useState(false);

  const loadDetails = useCallback(async () => {
    if (!rentalId) { setHasError(true); setLoading(false); return; }
    setLoading(true); setHasError(false);
    try {
      const res = await rentalService.getRentalDetails(rentalId);
      if (res.ok && res.data?.rental) setData(res.data);
      else setHasError(true);
    } catch { setHasError(true); } finally { setLoading(false); }
  }, [rentalId]);

  useEffect(() => { loadDetails(); }, [loadDetails]);

  const loadInspections = useCallback(async () => {
    const res = await inspectionService.listByRental(rentalId);
    if (res.ok && Array.isArray(res.data)) setInspections(res.data);
    const hasIn = (res.data || []).some((i: Inspection) => i.type === 'CHECK_IN');
    const hasOut = (res.data || []).some((i: Inspection) => i.type === 'CHECK_OUT');
    if (hasIn && hasOut) {
      const cmp = await inspectionService.compare(rentalId);
      if (cmp.ok) setComparison(cmp.data as InspectionComparison);
    }
  }, [rentalId]);

  const loadTracking = useCallback(async () => {
    const res = await trackingService.getSummary(rentalId);
    if (res.ok) setTracking(res.data as TrackingSummary);
  }, [rentalId]);

  useEffect(() => {
    if (tab === 'INSPECTION') loadInspections();
    if (tab === 'TRACKING') loadTracking();
  }, [tab, loadInspections, loadTracking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'ONGOING': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'COMPLETED': return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400';
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
    }
  };

  if (loading) return <Portal><div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md"><Loader2 className="animate-spin text-white size-12" /></div></Portal>;

  if (hasError || !data?.rental) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 text-left">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
          <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2rem] shadow-2xl p-8 border border-white/20 text-center">
            <div className="mx-auto mb-5 size-14 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center"><AlertTriangle size={28} /></div>
            <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">{t.common?.error || 'Une erreur est survenue'}</h3>
            <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">{t.common?.noData || 'Aucune donnée disponible'}</p>
            <button onClick={onClose} className="mt-6 px-6 py-3 rounded-2xl bg-[#0528d6] text-white text-xs font-black uppercase italic hover:bg-blue-700 transition-all">{t.common?.close || 'Fermer'}</button>
          </div>
        </div>
      </Portal>
    );
  }

  const { rental, vehicle, driver, agency } = data;
  const rentalRef = (rental.id || rentalId || '').substring(0, 8).toUpperCase();
  const vehicleImage = vehicle?.images?.[0] ? resolveMediaDisplayUrl(vehicle.images[0]) : null;
  const cautionHeld = Number(rental.cautionHeld ?? 0);

  const doCheckIn = async (payload: any) => {
    setSubmitting(true);
    try {
      const res = await rentalService.checkIn(rentalId, { startOdometer: payload.odometer, inspection: payload });
      if (res.ok) { setCheckInMode(false); await loadDetails(); await loadInspections(); onValidated?.(); }
      else alert(res.data?.message || 'Check-in impossible.');
    } finally { setSubmitting(false); }
  };

  const doCheckOut = async (payload: any) => {
    setSubmitting(true);
    try {
      const res = await rentalService.checkOut(rentalId, { endOdometer: payload.odometer, inspection: payload });
      if (res.ok) { setCheckOutMode(false); await loadDetails(); await loadInspections(); onValidated?.(); }
      else alert(res.data?.message || 'Check-out impossible.');
    } finally { setSubmitting(false); }
  };

  const doSignalEnd = async () => {
    setSubmitting(true);
    try {
      const res = await rentalService.signalEndR2(rentalId);
      if (res.ok) { await loadDetails(); onValidated?.(); }
      else alert(res.data?.message || 'Signalement impossible.');
    } finally { setSubmitting(false); }
  };

  const doSettle = async (damageCost: number, reason: string) => {
    setSubmitting(true);
    try {
      const res = await rentalService.settleReturn(rentalId, { damageCost, reason });
      if (res.ok) { await loadDetails(); onValidated?.(); }
      else alert(res.data?.message || 'Règlement impossible.');
    } finally { setSubmitting(false); }
  };

  const doCollectSupplement = async () => {
    const due = Number(data?.rental?.supplementDue ?? 0);
    if (due <= 0) return;
    setSubmitting(true);
    try {
      const res = await rentalService.collectSupplement(rentalId, due);
      if (res.ok) { await loadDetails(); onValidated?.(); }
      else alert(res.data?.message || 'Encaissement impossible.');
    } finally { setSubmitting(false); }
  };

  const TABS: { key: Tab; label: string; icon: any }[] = [
    { key: 'DETAILS', label: t.rentalDetails?.title || 'Détails', icon: <User size={14} /> },
    { key: 'INSPECTION', label: 'Inspection', icon: <ClipboardCheck size={14} /> },
    { key: 'TRACKING', label: 'Kilométrage', icon: <Gauge size={14} /> },
    { key: 'CAUTION', label: 'Caution', icon: <ShieldCheck size={14} /> },
  ];

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">

          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">#RT-{rentalRef}</h3>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(rental.status)}`}>{rental.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic flex items-center gap-2"><MapPin size={10} className="text-[#0528d6]" /> {agency?.name || '---'}</p>
            </div>
            <button onClick={onClose} className="size-11 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={22} /></button>
          </div>

          {/* Tabs */}
          <div className="px-6 md:px-10 pt-4 flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto">
            {TABS.map((tb) => (
              <button
                key={tb.key}
                onClick={() => setTab(tb.key)}
                className={`flex items-center gap-2 px-4 py-3 text-[11px] font-black uppercase italic tracking-widest border-b-2 whitespace-nowrap transition-all ${tab === tb.key ? 'border-[#0528d6] text-[#0528d6]' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                {tb.icon} {tb.label}
              </button>
            ))}
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
            {tab === 'DETAILS' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <section className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><User size={14} /> {t.rentalDetails?.customer || 'Client'}</h4>
                    <DataRow label={t.rentalDetails?.name || 'Nom'} value={rental.clientName} />
                    <DataRow label={t.rentalDetails?.contact || 'Contact'} value={rental.clientPhone} icon={<Phone size={10} />} />
                    <DataRow label="ID / CNI" value={rental.cniNumber || 'N/A'} mono />
                  </section>
                  <section className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-3">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><Clock size={14} /> {t.rentalDetails?.planning || 'Planning'}</h4>
                    <DataRow label={t.rentalDetails?.start || 'Début'} value={new Date(rental.startDate).toLocaleString()} />
                    <DataRow label={t.rentalDetails?.end || 'Fin'} value={new Date(rental.endDate).toLocaleString()} />
                    <DataRow label={t.rentalDetails?.type || 'Type'} value={rental.rentalType} />
                  </section>
                  <section className="p-6 bg-[#0528d6] rounded-[2rem] text-white shadow-xl space-y-3 relative overflow-hidden">
                    <Banknote size={90} className="absolute -bottom-5 -right-5 opacity-10 rotate-12" />
                    <h4 className="text-[11px] font-black uppercase italic border-b border-white/20 pb-2 flex items-center gap-2"><Banknote size={14} /> {t.rentalDetails?.finances || 'Finances'}</h4>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold opacity-60 uppercase">Location</span><span className="text-lg font-black">{Number(rental.rentalAmount ?? 0).toLocaleString()}</span></div>
                    <div className="flex justify-between items-center"><span className="text-[10px] font-bold opacity-60 uppercase">Caution</span><span className="text-lg font-black text-blue-200">{Number(rental.cautionAmount ?? 0).toLocaleString()}</span></div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/10"><span className="text-[10px] font-bold opacity-60 uppercase">Total dû</span><span className="text-lg font-black">{Number(rental.totalAmount ?? 0).toLocaleString()}</span></div>
                  </section>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                  <div className="size-24 rounded-[2rem] overflow-hidden shadow-lg shrink-0 border-2 border-white dark:border-slate-800 bg-slate-50">
                    {vehicleImage ? <img src={vehicleImage} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={36} /></div>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-[#0528d6] uppercase tracking-widest italic mb-1">{t.rentalDetails?.assignedVehicle || 'Véhicule'}</p>
                    <h4 className="text-xl font-black italic uppercase text-slate-800 dark:text-white leading-none">{vehicle ? `${vehicle.brand || '---'} ${vehicle.model || ''}`.trim() : 'Véhicule supprimé'}</h4>
                    <p className="mt-2 text-sm font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block uppercase">{vehicle?.licencePlate || '---'}</p>
                  </div>
                </div>
              </div>
            )}

            {tab === 'INSPECTION' && (
              <div className="space-y-6">
                {/* Actions selon statut */}
                {rental.status === 'PAID' && !checkInMode && (
                  <button onClick={() => setCheckInMode(true)} className="w-full py-4 rounded-2xl bg-[#0528d6] text-white text-xs font-black uppercase italic flex items-center justify-center gap-2">
                    <KeyRound size={16} /> Démarrer le check-in (remise des clés)
                  </button>
                )}
                {rental.status === 'ONGOING' && (
                  <button onClick={doSignalEnd} disabled={submitting} className="w-full py-4 rounded-2xl bg-purple-600 text-white text-xs font-black uppercase italic flex items-center justify-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Signaler le retour du véhicule
                  </button>
                )}
                {rental.status === 'UNDER_REVIEW' && !inspections.some((i) => i.type === 'CHECK_OUT') && !checkOutMode && (
                  <button onClick={() => setCheckOutMode(true)} className="w-full py-4 rounded-2xl bg-amber-600 text-white text-xs font-black uppercase italic flex items-center justify-center gap-2">
                    <ClipboardCheck size={16} /> Faire le check-out (inspection de retour)
                  </button>
                )}

                {checkInMode && <InspectionForm mode="CHECK_IN" submitting={submitting} onSubmit={doCheckIn} onCancel={() => setCheckInMode(false)} />}
                {checkOutMode && <InspectionForm mode="CHECK_OUT" submitting={submitting} onSubmit={doCheckOut} onCancel={() => setCheckOutMode(false)} />}

                {!checkInMode && !checkOutMode && (
                  <>
                    {comparison && (
                      <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <h4 className="text-[11px] font-black uppercase italic tracking-widest text-slate-500 mb-4">Comparaison départ / retour</h4>
                        <InspectionComparisonPanel comparison={comparison} />
                      </div>
                    )}
                    {inspections.length === 0 && (
                      <p className="text-sm italic text-slate-400 text-center py-6">Aucune inspection enregistrée pour le moment.</p>
                    )}
                    {inspections.map((insp) => (
                      <div key={insp.id} className="p-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black uppercase italic tracking-widest text-[#0528d6]">{insp.type === 'CHECK_IN' ? 'Départ (check-in)' : 'Retour (check-out)'}</span>
                          <span className="text-[10px] font-bold text-slate-400">{insp.odometer ?? '—'} km · {insp.fuelLevel ?? '—'}/8</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(insp.photoUrls || []).map((url, i) => (
                            <img key={i} src={resolveMediaDisplayUrl(url)} alt="" className="size-16 rounded-xl object-cover border border-slate-100" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}

            {tab === 'TRACKING' && (
              <div className="space-y-4">
                {!tracking && <p className="text-sm italic text-slate-400 text-center py-6">Chargement du tracking…</p>}
                {tracking && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-5 rounded-2xl bg-[#0528d6] text-white">
                        <div className="text-[10px] font-black uppercase italic tracking-widest opacity-70">Km parcourus</div>
                        <div className="text-2xl font-black italic">{tracking.trackedKm?.toFixed(1) ?? '0'} km</div>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Source</div>
                        <div className="text-2xl font-black italic text-slate-800 dark:text-white">{tracking.source === 'GPS' ? 'GPS' : 'Compteur'}</div>
                      </div>
                    </div>
                    <p className="text-[11px] italic text-slate-400">
                      {tracking.positions.length} position(s) enregistrée(s).
                      {tracking.source === 'ODOMETER' && ' Le client n\'a pas partagé sa position — kilométrage estimé au compteur.'}
                    </p>
                    <div className="rounded-2xl bg-slate-100 dark:bg-slate-800 h-48 flex items-center justify-center text-slate-400 text-xs italic">
                      Carte du trajet (positions GPS) — à venir
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'CAUTION' && (
              <div className="space-y-6">
                <RentalFinancialTimeline rental={rental} />

                {/* Créance : supplément dû par le client */}
                {Number(rental.supplementDue ?? 0) > 0 && (
                  <div className="p-5 rounded-[2rem] bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-black uppercase italic tracking-widest text-red-600">Supplément dû par le client</h4>
                        <p className="text-2xl font-black italic text-red-600 mt-1">{Number(rental.supplementDue).toLocaleString()} FCFA</p>
                        <p className="text-[10px] text-slate-500 italic mt-1">Les dommages ont dépassé la caution.</p>
                      </div>
                      <button
                        type="button"
                        onClick={doCollectSupplement}
                        disabled={submitting}
                        className="px-5 py-3 rounded-2xl bg-red-600 text-white text-xs font-black uppercase italic disabled:opacity-50 flex items-center gap-2"
                      >
                        {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
                        Encaisser
                      </button>
                    </div>
                  </div>
                )}

                {rental.status === 'UNDER_REVIEW' && inspections.some((i) => i.type === 'CHECK_OUT') && (
                  <div className="p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <h4 className="text-[11px] font-black uppercase italic tracking-widest text-slate-500 mb-4">Règlement de la caution</h4>
                    <CautionSettlementForm cautionHeld={cautionHeld} submitting={submitting} onSubmit={doSettle} />
                  </div>
                )}
                {rental.status === 'UNDER_REVIEW' && !inspections.some((i) => i.type === 'CHECK_OUT') && (
                  <p className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-[11px] font-black italic uppercase tracking-widest text-amber-700">
                    Effectuez d'abord le check-out (onglet Inspection) avant de régler la caution.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};

const DataRow = ({ label, value, icon, mono }: any) => (
  <div className="flex justify-between items-center gap-4">
    <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400 whitespace-nowrap">{label}</span>
    <div className="flex items-center gap-2 overflow-hidden">
      {icon && <span className="text-[#0528d6]">{icon}</span>}
      <span className={`text-sm font-black italic text-slate-800 dark:text-slate-100 truncate ${mono ? 'font-mono' : ''}`}>{value || '---'}</span>
    </div>
  </div>
);
