/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Bell, Loader2, Calendar, CreditCard, ChevronRight, X, MapPin, Car, Phone, Mail, Shield, UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr as frLocale, enUS } from 'date-fns/locale';
import { rentalService, markFirstUsageDone } from '@pwa-easy-rental/shared-services';
import { ReviewModal } from './ReviewModal';
import { useClientI18n } from '../hooks/useClientI18n';


export const MyBookingsView = ({ userData, onNavigateToCatalog, lang = 'FR' }: { userData: any; onNavigateToCatalog?: () => void; lang?: 'FR' | 'EN' }) => {
  const t = useClientI18n(lang);
  const dateLocale = lang === 'EN' ? enUS : frLocale;
  const [rentals, setRentals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<any>(null);

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
      console.error("Erreur détail trajet:", error);
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
      <p className="text-sm font-bold italic text-slateate-400 tracking-widest">Chargement de vos trajets...</p>
    </div>
  );

  return (
    <div className="w-full mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-4 text-left">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-[900] tracking-tighter text-[#0528d6]">{t.trips.title}</h2>
          <p className="text-slate-400 text-xs font-medium mt-1">{t.trips.subtitle}</p>
        </div>
        <div className="relative size-11 bg-white shadow-sm border border-slate-100 text-[#0528d6] rounded-2xl flex items-center justify-center">
          <Bell size={18}/>
        </div>
      </div>

      <div className={`grid gap-6 transition-all duration-500 ${selectedRental ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>

        {/* LISTE DES TRAJETS */}
        <div className={`${selectedRental ? 'lg:col-span-5 space-y-4' : 'space-y-6'}`}>
          {rentals.length > 0 ? (
            rentals.map((rental) => (
              <div
                key={rental.id}
                className={`group bg-white dark:bg-[#1a1d2d] rounded-[2rem] p-6 border transition-all border-l-8 ${
                  selectedRental?.rental?.id === rental.id
                    ? 'border-[#0528d6] border-l-[#0528d6] shadow-lg ring-2 ring-[#0528d6]/10'
                    : 'border-slate-100 border-l-[#0528d6] dark:border-slate-800 shadow-sm hover:shadow-md'
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  {/* Infos Principales */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full border ${getStatusStyle(rental.status)}`}>
                        {rental.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 tracking-tighter">
                        Réf: {rental.id.slice(0, 8)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">{t.trips.dates}</p>
                          <p className="text-sm font-bold text-slate-700">
                            Du {format(new Date(rental.startDate), 'dd MMM yyyy', { locale: dateLocale })}
                          </p>
                          <p className="text-xs text-slate-500">
                            au {format(new Date(rental.endDate), 'dd MMM yyyy', { locale: dateLocale })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="size-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#0528d6] shrink-0">
                          <CreditCard size={18} />
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold">{t.trips.payment}</p>
                          <p className="text-sm font-black text-slate-800">
                            {rental.totalAmount.toLocaleString()} XAF
                          </p>
                          <p className={`text-[10px] font-bold ${rental.amountPaid >= rental.totalAmount ? 'text-green-500' : 'text-orange-500'}`}>
                            {rental.amountPaid >= rental.totalAmount ? t.trips.paid : `${t.trips.remaining}: ${(rental.totalAmount - rental.amountPaid).toLocaleString()} XAF`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col justify-center items-center md:items-end gap-3 shrink-0">
                    <button
                      onClick={() => handleViewDetails(rental)}
                      className="w-full md:w-auto bg-[#0528d6] text-white px-6 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                    >
                      {t.trips.details} <ChevronRight size={16} />
                    </button>
                    {rental.status === 'COMPLETED' && rental.vehicleId && rental.driverId && (
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await rentalService.getRentalDetails(rental.id);
                          if (res.ok && res.data) setReviewTarget(res.data);
                        }}
                        className="w-full md:w-auto border-2 border-[#0528d6] text-[#0528d6] px-6 py-2.5 rounded-2xl text-xs font-black uppercase"
                      >
                        {t.trips.rate}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
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
                <p className="text-[10px] font-black tracking-widest text-slate-400">Chargement des détails...</p>
              </div>
            ) : (
              <TripDetailPanel data={selectedRental} onClose={() => setSelectedRental(null)} />
            )}
          </div>
        )}
      </div>

      {reviewTarget && (
        <ReviewModal
          rental={reviewTarget.rental}
          vehicle={reviewTarget.vehicle}
          driver={reviewTarget.driver}
          authorName={userData?.fullname}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// PANNEAU DE DÉTAIL DU TRAJET
// ─────────────────────────────────────────────
const TripDetailPanel = ({ data, onClose }: { data: any; onClose: () => void }) => {
  const { rental, vehicle, driver, agency } = data;

  const formatDate = (dateStr: string) => {
    try { return format(new Date(dateStr), "dd MMMM yyyy", { locale: fr }); }
    catch { return "—"; }
  };

  const remaining = (rental?.totalAmount || 0) - (rental?.amountPaid || 0);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden overflow-y-auto max-h-[85vh] custom-scrollbar">
      
      {/* Header image véhicule */}
      <div className="relative h-56 bg-slate-900">
        {vehicle?.images?.[0] ? (
          <img src={vehicle.images[0]} className="w-full h-full object-cover opacity-70" alt="Véhicule" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={80} className="text-slate-700 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 size-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <X size={20} />
        </button>

        <div className="absolute bottom-6 left-6">
          <span className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-lg tracking-wider">
            {vehicle?.brand || 'Véhicule'} {vehicle?.model || ''}
          </span>
          <h3 className="text-3xl font-black text-white mt-2 tracking-tighter italic">
            {vehicle?.licencePlate || `Réf. ${rental?.id?.slice(0,8)}`}
          </h3>
          {vehicle?.color && (
            <p className="text-sm text-white/60 font-medium">
              {vehicle.color}{vehicle?.yearProduction ? ` • ${vehicle.yearProduction.slice(0,4)}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="p-8 space-y-8">

        {/* Statut & Finances */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="col-span-2 p-5 bg-slate-900 rounded-[1.5rem] text-white">
            <div className="flex justify-between items-center mb-3">
              <CreditCard size={18} className="text-blue-400" />
              <span className="px-3 py-1 rounded-full text-[9px] font-black tracking-widest bg-blue-500/20 text-blue-400">
                {rental?.status}
              </span>
            </div>
            <p className="text-[10px] font-bold text-white/40 tracking-widest">Solde restant</p>
            <p className="text-3xl font-black italic">{remaining.toLocaleString()} <span className="text-xs italic opacity-50">XAF</span></p>
            <div className="mt-3 pt-3 border-t border-white/10 flex justify-between text-[10px] font-bold opacity-60">
              <span>TOTAL: {rental?.totalAmount?.toLocaleString()}</span>
              <span>PAYÉ: {rental?.amountPaid?.toLocaleString()}</span>
            </div>
          </div>
          <div className="p-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] flex flex-col justify-center">
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-1">Kilométrage</p>
            <p className="text-2xl font-black text-slate-900 italic">{vehicle?.kilometrage || '—'} <span className="text-xs">km</span></p>
            {vehicle?.places && <p className="text-[10px] text-slate-500 font-bold mt-1">{vehicle.places} sièges</p>}
          </div>
        </div>

        {/* Dates & Agence */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3">PLANNING</p>
            <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
              <div className="relative">
                <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white border-4 border-blue-600" />
                <p className="text-[9px] font-black text-slate-400 tracking-widest">Départ</p>
                <p className="text-sm font-black text-slate-900">{formatDate(rental?.startDate)}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-[31px] top-0 size-4 rounded-full bg-white border-4 border-slate-200" />
                <p className="text-[9px] font-black text-slate-400 tracking-widest">Retour</p>
                <p className="text-sm font-black text-slate-900">{formatDate(rental?.endDate)}</p>
              </div>
            </div>
          </div>

          {agency && (
            <div>
              <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3">AGENCE DE RETRAIT</p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm font-black text-slate-900 mb-1">{agency?.name}</p>
                <p className="text-xs text-slate-500 mb-3 flex items-center gap-1">
                  <MapPin size={12} /> {agency?.address}, {agency?.city}
                </p>
                <div className="flex gap-2">
                  {agency?.phone && (
                    <a href={`tel:${agency.phone}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors">
                      <Phone size={14} />
                    </a>
                  )}
                  {agency?.email && (
                    <a href={`mailto:${agency.email}`} className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 hover:text-blue-600 transition-colors">
                      <Mail size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chauffeur */}
        {driver && (
          <div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3">CHAUFFEUR ASSIGNÉ</p>
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                {driver?.profilUrl ? (
                  <img src={driver.profilUrl} className="w-full h-full object-cover" alt="Chauffeur" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Shield size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{driver?.firstname} {driver?.lastname}</p>
                {driver?.tel && (
                  <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                    <Phone size={11}/> {driver.tel}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Équipements véhicule */}
        {vehicle?.functionalities && (
          <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3 flex items-center gap-2">
              <Car size={12}/> ÉQUIPEMENTS & CONFORT
            </p>
            <div className="flex flex-wrap gap-2">
              {vehicle.functionalities.air_condition && <FeatureBadge label="Climatisation" />}
              {vehicle.functionalities.bluetooth && <FeatureBadge label="Bluetooth" />}
              {vehicle.functionalities.gps && <FeatureBadge label="GPS" />}
              {vehicle.functionalities.usb_input && <FeatureBadge label="USB" />}
              {vehicle.functionalities.luggage && <FeatureBadge label="Bagages" />}
              {vehicle.functionalities.onboard_computer && <FeatureBadge label="Ordinateur de bord" />}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200/50 grid grid-cols-2 gap-3">
              {vehicle.transmission && (
                <div>
                  <p className="text-[8px] font-black text-slate-400 tracking-widest">Transmission</p>
                  <p className="text-xs font-bold text-slate-700">{vehicle.transmission}</p>
                </div>
              )}
              {vehicle.places && (
                <div>
                  <p className="text-[8px] font-black text-slate-400 tracking-widest">Sièges</p>
                  <p className="text-xs font-bold text-slate-700">{vehicle.places} places</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Client walk-in */}
        {rental?.clientName && !rental?.clientId && (
          <div>
            <p className="text-[9px] font-black text-slate-400 tracking-widest mb-3">CLIENT</p>
            <div className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="size-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                <UserIcon size={20}/>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">{rental.clientName}</p>
                {rental.clientPhone && <p className="text-[10px] text-slate-500 font-bold">{rental.clientPhone}</p>}
              </div>
            </div>
          </div>
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