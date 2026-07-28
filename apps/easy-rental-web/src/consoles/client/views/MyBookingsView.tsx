/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Bell, Loader2, Calendar, CreditCard, ChevronRight, X, MapPin, Car, Phone, Mail, Shield, UserIcon, Store } from 'lucide-react';
import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';
import { rentalService, markFirstUsageDone, resolveMediaDisplayUrl } from '@pwa-easy-rental/shared-services';
import { ReviewModal } from './ReviewModal';
import { useClientI18n } from '../hooks/useClientI18n';

const VEHICLE_FALLBACK = '/client/vehicle-placeholder.svg';

export const MyBookingsView = ({ userData, onNavigateToCatalog, lang = 'FR' }: { userData: any; onNavigateToCatalog?: () => void; lang?: 'FR' | 'EN' }) => {
  const t = useClientI18n(lang);
  const dateLocale = lang === 'EN' ? enUS : frLocale;
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  const [signalingId, setSignalingId] = useState<string | null>(null);

  const refreshRentals = async () => {
    const data = await rentalService.getClientRentalsHistory();
    if (data.ok) setRentals(data.data || []);
  };

  const handleSignalEnd = async (rentalId: string) => {
    setSignalingId(rentalId);
    try {
      const res = await rentalService.signalEndR2(rentalId);
      if (res.ok) {
        await refreshRentals();
      } else {
        alert((res.data as any)?.message || 'Signalement impossible.');
      }
    } finally {
      setSignalingId(null);
    }
  };

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const data = await rentalService.getClientRentalsHistory();
        if (data.ok) {
          const list = data.data || [];
          setRentals(list);
          if (list.some((r: any) => r.status === 'COMPLETED')) {
            markFirstUsageDone();
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération des locations", error);
        setLoading(false);
      }
    };
    fetchRentals();
  }, [userData]);

  const handleViewDetails = async (rental: any) => {
    setLoadingDetail(true);
    try {
      const res = await rentalService.getRentalDetails(rental.id);
      if (res.ok && res.data) {
        setSelectedRental(res.data);
      } else {
        setSelectedRental({ rental, vehicle: null, driver: null, agency: null });
      }
    } catch (error) {
      console.error('Erreur détail location:', error);
      setSelectedRental({ rental, vehicle: null, driver: null, agency: null });
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusStyle = (status: any) => {
    switch (status) {
      case 'PENDING':      return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'ONGOING':      return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'COMPLETED':    return 'bg-green-50 text-green-600 border-green-100';
      case 'CANCELLED':    return 'bg-red-50 text-red-600 border-red-100';
      case 'UNDER_REVIEW': return 'bg-purple-50 text-purple-600 border-purple-100';
      default:             return 'bg-slate-50 text-slate-600';
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-[#0528d6] size-12" />
      <p className="text-sm font-bold italic text-slate-400 tracking-widest">Chargement de vos locations...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 text-left">

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter text-slate-900 dark:text-white">{t.trips.title}</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">{t.trips.subtitle}</p>
        </div>
        <div className="relative size-11 bg-white shadow-sm border border-slate-100 text-[#0528d6] rounded-2xl flex items-center justify-center">
          <Bell size={18}/>
        </div>
      </div>

      <div className={`grid gap-6 transition-all duration-500 ${selectedRental ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>

        {/* LISTE DES LOCATIONS — style aligné sur NotificationCard (rectangulaire) */}
        <div className={`${selectedRental ? 'lg:col-span-5 space-y-3' : 'space-y-3'}`}>
          {rentals.length > 0 ? (
            rentals.map((rental) => {
              const isSelected = selectedRental?.rental?.id === rental.id;
              const isPaid = rental.amountPaid >= rental.totalAmount;
              return (
                <button
                  type="button"
                  key={rental.id}
                  onClick={() => handleViewDetails(rental)}
                  className={`w-full text-left group bg-white dark:bg-[#1a1d2d] rounded-2xl p-5 border transition-all ${
                    isSelected
                      ? 'border-[#0528d6] shadow-md ring-2 ring-[#0528d6]/10'
                      : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#0528d6]/40 hover:shadow-md'
                  }`}
                >
                  {/* Ligne 1 : statut + référence + date affichage */}
                  <div className="flex items-start justify-between mb-3 gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`size-2 rounded-full shrink-0 ${isPaid ? 'bg-green-500' : 'bg-[#0528d6]'}`} />
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${getStatusStyle(rental.status)}`}>
                        {rental.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-tighter truncate">
                        REF · {rental.id.slice(0, 8).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium tracking-wider shrink-0">
                      {format(new Date(rental.startDate), 'dd/MM/yyyy', { locale: dateLocale })}
                    </span>
                  </div>

                  {/* Ligne 2 : dates & paiement en résumé texte */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Calendar size={14} className="text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.trips.dates}</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                          {format(new Date(rental.startDate), 'dd MMM', { locale: dateLocale })}
                          {' → '}
                          {format(new Date(rental.endDate), 'dd MMM yyyy', { locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CreditCard size={14} className="text-[#0528d6] mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.trips.payment}</p>
                        <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">
                          {Number(rental.totalAmount ?? 0).toLocaleString()} XAF
                        </p>
                        <p className={`text-[10px] font-bold ${isPaid ? 'text-green-500' : 'text-orange-500'}`}>
                          {isPaid
                            ? t.trips.paid
                            : `${t.trips.remaining}: ${(Number(rental.totalAmount ?? 0) - Number(rental.amountPaid ?? 0)).toLocaleString()} XAF`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ligne 3 : actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-[#0528d6] uppercase tracking-widest inline-flex items-center gap-1">
                      {t.trips.details} <ChevronRight size={12} />
                    </span>
                    {rental.status === 'ONGOING' && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => { e.stopPropagation(); handleSignalEnd(rental.id); }}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleSignalEnd(rental.id); } }}
                        className="text-[10px] font-black text-purple-600 border border-purple-300 px-3 py-1 rounded-full hover:bg-purple-600 hover:text-white transition-colors uppercase tracking-widest cursor-pointer inline-flex items-center gap-1"
                      >
                        {signalingId === rental.id ? <Loader2 size={11} className="animate-spin" /> : null}
                        Signaler le retour
                      </span>
                    )}
                    {rental.status === 'COMPLETED' && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={async (e) => {
                          e.stopPropagation();
                          const res = await rentalService.getRentalDetails(rental.id);
                          if (res.ok && res.data) setReviewTarget(res.data);
                        }}
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter') {
                            e.stopPropagation();
                            const res = await rentalService.getRentalDetails(rental.id);
                            if (res.ok && res.data) setReviewTarget(res.data);
                          }
                        }}
                        className="text-[10px] font-black text-[#0528d6] border border-[#0528d6]/40 px-3 py-1 rounded-full hover:bg-[#0528d6] hover:text-white transition-colors uppercase tracking-widest cursor-pointer"
                      >
                        {t.trips.rate}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            /* Empty State */
            <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-12 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
              <div className="size-20 bg-orange-50 text-orange-600 rounded-[2.5rem] flex items-center justify-center shadow-inner mx-auto mb-2">
                <Clock size={48} className="animate-pulse" />
              </div>
              <h4 className="text-2xl font-black text-slate-800 mb-2 italic tracking-tighter">{t.trips.emptyTitle}</h4>
              <p className="text-slate-400 text-sm font-medium italic leading-relaxed max-w-sm mx-auto">
                {t.trips.emptyDesc}
              </p>
              <button
                type="button"
                onClick={onNavigateToCatalog}
                className="mt-8 bg-[#0528d6] text-white px-8 py-4 rounded-3xl font-black text-sm tracking-widest hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                {t.trips.rentCta}
              </button>
            </div>
          )}
        </div>

        {/* PANNEAU DÉTAIL */}
        {selectedRental && (
          <div className="lg:col-span-7 animate-in slide-in-from-right-4 duration-500">
            {loadingDetail ? (
              <div className="bg-white rounded-[2.5rem] h-[500px] flex flex-col items-center justify-center border border-slate-100 shadow-xl">
                <Loader2 className="animate-spin text-[#0528d6] mb-4" size={30} />
                <p className="text-[10px] font-black tracking-widest text-slate-400">{t.trips.loading}</p>
              </div>
            ) : (
              <TripDetailPanel data={selectedRental} onClose={() => setSelectedRental(null)} t={t} dateLocale={dateLocale} />
            )}
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          rental={reviewTarget.rental}
          vehicle={reviewTarget.vehicle}
          driver={reviewTarget.driver}
          agency={reviewTarget.agency}
          authorName={userData?.fullname}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => { setReviewTarget(null); refreshRentals(); }}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PANNEAU DE DÉTAIL — 4 blocs : a) véhicule b) financier c) planning d) agence
// ─────────────────────────────────────────────
const TripDetailPanel = ({ data, onClose, t, dateLocale }: { data: any; onClose: () => void; t: any; dateLocale: any }) => {
  const { rental, vehicle, driver, agency } = data;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try { return format(new Date(dateStr), 'dd MMMM yyyy', { locale: dateLocale }); }
    catch { return '—'; }
  };

  const remaining = (rental?.totalAmount || 0) - (rental?.amountPaid || 0);
  const isPaid = remaining <= 0;

  let durationDays: number | null = null;
  if (rental?.startDate && rental?.endDate) {
    try {
      const diffMs = new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime();
      durationDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } catch {
      durationDays = null;
    }
  }

  const vehicleImage = vehicle?.images?.[0] ? resolveMediaDisplayUrl(vehicle.images[0]) : VEHICLE_FALLBACK;

  return (
    <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden overflow-y-auto max-h-[85vh] custom-scrollbar">

      {/* ─── BLOC (a) EN-TÊTE VÉHICULE — tout regroupé ─── */}
      <div className="relative h-64 bg-slate-900">
        <img
          src={vehicleImage}
          className="w-full h-full object-cover opacity-70"
          alt={`${vehicle?.brand ?? ''} ${vehicle?.model ?? ''}`}
          onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_FALLBACK; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 size-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex justify-between items-end gap-4">
            <div className="min-w-0">
              <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg tracking-wider">
                {vehicle?.brand || 'Véhicule'} {vehicle?.model || ''}
              </span>
              <h3 className="text-3xl font-black text-white mt-2 tracking-tighter italic truncate">
                {vehicle?.licencePlate || `Réf. ${rental?.id?.slice(0, 8)}`}
              </h3>
              <p className="text-sm text-white/60 font-medium">
                {vehicle?.color || '—'}
                {vehicle?.yearProduction ? ` • ${String(vehicle.yearProduction).slice(0, 4)}` : ''}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{t.trips.reference}</p>
              <p className="text-xs font-bold text-white tracking-widest">{rental?.id?.slice(0, 8)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bandeau infos véhicule — extension du bloc (a) : specs + équipements */}
      <div className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
        <div className="px-6 py-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Statut</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{rental?.status ?? '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.trips.seats}</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{vehicle?.places ? `${vehicle.places} sièges` : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.trips.mileage}</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{vehicle?.kilometrage ? `${vehicle.kilometrage} km` : '—'}</p>
          </div>
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Transmission</p>
            <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{vehicle?.transmission || '—'}</p>
          </div>
        </div>
        {vehicle?.functionalities && (
          <div className="px-6 pb-4 pt-1">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <Car size={11}/> Équipements & confort
            </p>
            <div className="flex flex-wrap gap-2">
              {vehicle.functionalities.air_condition && <FeatureBadge label="Climatisation" />}
              {vehicle.functionalities.bluetooth && <FeatureBadge label="Bluetooth" />}
              {vehicle.functionalities.gps && <FeatureBadge label="GPS" />}
              {vehicle.functionalities.usb_input && <FeatureBadge label="USB" />}
              {vehicle.functionalities.luggage && <FeatureBadge label="Bagages" />}
              {vehicle.functionalities.onboard_computer && <FeatureBadge label="Ordinateur de bord" />}
            </div>
          </div>
        )}
      </div>

      <div className="p-8 space-y-8">

        {/* ─── BLOC (b) FINANCIER ─── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={14} className="text-[#0528d6]" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.trips.financialSummary}</h4>
          </div>
          <div className="p-5 bg-slate-900 rounded-2xl text-white">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t.trips.remainingBalance}</span>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${isPaid ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-400'}`}>
                {isPaid ? t.trips.paid : rental?.status}
              </span>
            </div>
            <p className="text-3xl font-black italic">
              {remaining.toLocaleString()} <span className="text-xs italic opacity-50">XAF</span>
            </p>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[10px] font-bold opacity-60">
              <span>{t.trips.total.toUpperCase()}: {Number(rental?.totalAmount ?? 0).toLocaleString()}</span>
              <span>{t.trips.paidAmount.toUpperCase()}: {Number(rental?.amountPaid ?? 0).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* ─── BLOC (c) PLANNING ─── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={14} className="text-[#0528d6]" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.trips.planning}</h4>
            {durationDays !== null && (
              <span className="ml-auto text-[10px] font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                <Clock size={10} className="inline mr-1" /> {durationDays} {t.trips.days}
              </span>
            )}
          </div>
          <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-6">
            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white dark:bg-[#1a1d2d] border-4 border-blue-600" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.trips.departure}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{formatDate(rental?.startDate)}</p>
            </div>
            <div className="relative">
              <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white dark:bg-[#1a1d2d] border-4 border-slate-200 dark:border-slate-700" />
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.trips.return}</p>
              <p className="text-sm font-black text-slate-900 dark:text-white">{formatDate(rental?.endDate)}</p>
            </div>
          </div>
        </section>

        {/* ─── BLOC (d) AGENCE DE RETRAIT ─── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Store size={14} className="text-[#0528d6]" />
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.trips.pickupAgency}</h4>
          </div>
          {agency ? (
            <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{agency.name}</p>
              <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                <MapPin size={12} /> {[agency.address, agency.city].filter(Boolean).join(', ') || 'Adresse non renseignée'}
              </p>
              <div className="flex gap-2">
                {agency.phone && (
                  <a href={`tel:${agency.phone}`} className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors" title="Appeler">
                    <Phone size={14} />
                  </a>
                )}
                {agency.email && (
                  <a href={`mailto:${agency.email}`} className="p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors" title="Email">
                    <Mail size={14} />
                  </a>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Informations agence indisponibles.</p>
          )}
        </section>

        {/* Extras (chauffeur / walk-in) — hors des 4 blocs demandés */}
        {driver && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Shield size={14} className="text-[#0528d6]" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Chauffeur assigné</h4>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="size-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                {driver?.profilUrl ? (
                  <img src={resolveMediaDisplayUrl(driver.profilUrl)} className="w-full h-full object-cover" alt="Chauffeur" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{driver?.firstname} {driver?.lastname}</p>
                {driver?.tel && (
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Phone size={11}/> {driver.tel}
                  </p>
                )}
              </div>
            </div>
          </section>
        )}

        {rental?.clientName && !rental?.clientId && (
          <section>
            <div className="flex items-center gap-2 mb-3">
              <UserIcon size={14} className="text-[#0528d6]" />
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Client</h4>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm">
              <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <UserIcon size={20}/>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 dark:text-white">{rental.clientName}</p>
                {rental.clientPhone && <p className="text-[10px] text-slate-500 font-bold">{rental.clientPhone}</p>}
              </div>
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

const FeatureBadge = ({ label }: { label: string }) => (
  <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-[#0528d6] rounded-xl text-[10px] font-bold border border-blue-100">
    <div className="size-1 bg-[#0528d6] rounded-full" />
    {label}
  </span>
);

