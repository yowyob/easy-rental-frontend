/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Wind,
  Usb,
  Bluetooth,
  MapPin,
  Briefcase,
  Loader2,
  Settings,
  HardDrive,
  Building2,
  Store,
  Phone,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Fuel,
  Palette,
  Users,
  ListChecks,
  Info,
  UserCheck,
  CalendarRange,
  ChevronRight,
  Gauge,
} from 'lucide-react';
import { vehicleService, agencyService, orgService, formatXaf, vehicleStatusLabel } from '@pwa-easy-rental/shared-services';
import { BookingWizardModal } from './booking/BookingWizardModal';
import MyCalendar from '@/consoles/client/components/MyCalendar';

const FALLBACK_IMAGE = '/client/vehicle-placeholder.svg';

export const VehicleDetailsView = ({ vehicleId, onBack, userData, lang = 'FR' }: any) => {
  const [details, setDetails] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);
  const [org, setOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [rentalType, setRentalType] = useState<'DAILY' | 'HOURLY'>('DAILY');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchFullDetails = async () => {
      const res = await vehicleService.getVehicleDetails(vehicleId);
      if (res.ok) {
        setDetails(res.data);
        const agRes = await agencyService.getAgencyDetails(res.data.vehicle.agencyId);
        if (agRes.ok) {
          setAgency(agRes.data);
          const orgRes = await orgService.getOrgDetails(agRes.data.organizationId);
          if (orgRes.ok) setOrg(orgRes.data);
        }
      }
      setLoading(false);
    };
    fetchFullDetails();
  }, [vehicleId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-10" />
      </div>
    );
  }

  if (!details?.vehicle) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-slate-500">Véhicule introuvable.</p>
        <button type="button" onClick={onBack} className="text-[#0528d6] font-semibold text-sm">
          Retour au catalogue
        </button>
      </div>
    );
  }

  const { vehicle, pricing, rating, reviews, isDriverBookingRequired, schedule } = details;
  const images: string[] = vehicle.images?.length ? vehicle.images : [FALLBACK_IMAGE];
  const year = vehicle.yearProduction ? new Date(vehicle.yearProduction).getFullYear() : '—';

  return (
    <div className="animate-in fade-in duration-300 pb-12 text-left space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0528d6] transition-colors"
      >
        <ChevronLeft size={18} />
        Retour au catalogue
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Galerie + infos partenaire */}
        <div className="lg:col-span-7 space-y-5">
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <img
              src={images[activeImage] ?? FALLBACK_IMAGE}
              alt={`${vehicle.brand} ${vehicle.model}`}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
            <span className="absolute top-4 left-4 px-3 py-1 bg-white/95 dark:bg-slate-900/95 rounded-lg text-xs font-bold text-[#0528d6]">
              {vehicleStatusLabel(vehicle.statut, lang)}
            </span>
            {rating != null && (
              <span className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 dark:bg-slate-900/95 rounded-lg flex items-center gap-1.5 text-sm font-bold">
                <Star size={14} className="text-orange-500 fill-orange-500" />
                {Number(rating).toFixed(1)}
                <span className="text-xs font-medium text-slate-500">({reviews?.length ?? 0})</span>
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === i ? 'border-[#0528d6]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }} />
                </button>
              ))}
            </div>
          )}

          <div className="bg-white dark:bg-[#1a1d2d] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex gap-4 items-center">
            <div className="size-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
              {org?.logoUrl ? (
                <img src={org.logoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="text-[#0528d6]" size={28} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-[#0528d6] uppercase tracking-wide">Opérateur</p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate">{org?.name ?? '—'}</h4>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Store size={12} /> {agency?.name}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {agency?.city}</span>
                {agency?.phone && <span className="flex items-center gap-1"><Phone size={12} /> {agency.phone}</span>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SpecPanel title="Performances" icon={<HardDrive size={16} />}>
              <SpecRow label="Moteur" value={vehicle.engineDetails?.type} />
              <SpecRow label="Puissance" value={vehicle.engineDetails?.horsepower ? `${vehicle.engineDetails.horsepower} ch` : undefined} />
              <SpecRow label="Cylindrée" value={vehicle.engineDetails?.capacity ? `${vehicle.engineDetails.capacity} L` : undefined} />
              <SpecRow label="Conso ville" value={vehicle.fuelEfficiency?.city} icon={<Fuel size={12} />} />
              <SpecRow label="Conso route" value={vehicle.fuelEfficiency?.highway} />
            </SpecPanel>

            <SpecPanel title="Confort" icon={<ListChecks size={16} />}>
              <div className="grid grid-cols-2 gap-2">
                <FeatureChip label="Climatisation" on={vehicle.functionalities?.air_condition} icon={<Wind size={12} />} />
                <FeatureChip label="GPS" on={vehicle.functionalities?.gps} icon={<MapPin size={12} />} />
                <FeatureChip label="Bluetooth" on={vehicle.functionalities?.bluetooth} icon={<Bluetooth size={12} />} />
                <FeatureChip label="USB" on={vehicle.functionalities?.usb_input} icon={<Usb size={12} />} />
                <FeatureChip label="Bagages" on={vehicle.functionalities?.luggage} icon={<Briefcase size={12} />} />
                <FeatureChip label="Ordinateur" on={vehicle.functionalities?.onboard_computer} icon={<Settings size={12} />} />
              </div>
            </SpecPanel>

            <SpecPanel title="Administratif" icon={<ShieldCheck size={16} />}>
              <SpecRow label="Transmission" value={vehicle.transmission} icon={<Gauge size={12} />} />
              <SpecRow label="Immatriculation" value={vehicle.licencePlate} />
              <SpecRow label="VIN" value={vehicle.vinNumber} />
              <SpecRow label="Couleur" value={vehicle.color} icon={<Palette size={12} />} />
              <SpecRow label="Places" value={vehicle.places ? `${vehicle.places} sièges` : undefined} icon={<Users size={12} />} />
              <SpecRow label="Kilométrage" value={vehicle.kilometrage != null ? `${vehicle.kilometrage} km` : undefined} />
            </SpecPanel>

            <SpecPanel title="Avis clients" icon={<MessageSquare size={16} />}>
              {reviews?.length > 0 ? (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {reviews.map((r: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">{r.authorName}</span>
                        <span className="text-orange-500 text-[10px]">{'★'.repeat(r.rating ?? 0)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">Aucun avis pour le moment</p>
              )}
            </SpecPanel>
          </div>
        </div>

        {/* Réservation */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
          <div className="bg-white dark:bg-[#1a1d2d] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {vehicle.brand} <span className="text-[#0528d6]">{vehicle.model}</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">Millésime {year} · {vehicle.licencePlate}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRentalType('DAILY')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  rentalType === 'DAILY' ? 'border-[#0528d6] bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><CalendarRange size={12} /> Par jour</p>
                <p className="text-lg font-bold text-[#0528d6]">{formatXaf(pricing?.pricePerDay)} <span className="text-xs font-medium">XAF</span></p>
              </button>
              <button
                type="button"
                onClick={() => setRentalType('HOURLY')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  rentalType === 'HOURLY' ? 'border-[#0528d6] bg-blue-50/50 dark:bg-blue-950/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <p className="text-[10px] text-slate-500 flex items-center gap-1 mb-1"><Clock size={12} /> Par heure</p>
                <p className="text-lg font-bold text-[#0528d6]">{formatXaf(pricing?.pricePerHour)} <span className="text-xs font-medium">XAF</span></p>
              </button>
            </div>

            {isDriverBookingRequired && (
              <div className="p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl flex gap-3">
                <UserCheck size={20} className="text-orange-600 shrink-0" />
                <p className="text-xs text-orange-800 dark:text-orange-300">
                  Chauffeur obligatoire pour ce véhicule.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowWizard(true)}
              className="w-full py-4 bg-[#0528d6] text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Réserver <ChevronRight size={18} />
            </button>
          </div>

          <div className="bg-white dark:bg-[#1a1d2d] rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-500 mb-3">Disponibilités</p>
            <MyCalendar schedules={schedule ?? []} selectedDates={selectedDates} onDatesChange={setSelectedDates} />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-2xl text-white">
            <ShieldCheck size={24} className="text-blue-400 shrink-0" />
            <p className="text-xs text-slate-300">Assurance partenaire incluse · assistance technique 24h/24</p>
          </div>
        </div>
      </div>

      {showWizard && (
        <BookingWizardModal
          vehicle={vehicle}
          agency={agency}
          userData={userData}
          isDriverRequired={isDriverBookingRequired}
          initialRentalType={rentalType}
          schedule={schedule ?? []}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

const SpecPanel = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-[#1a1d2d] rounded-2xl p-5 border border-slate-200 dark:border-slate-800">
    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
      <span className="text-[#0528d6]">{icon}</span>
      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h4>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const SpecRow = ({ label, value, icon }: { label: string; value?: string; icon?: React.ReactNode }) => (
  <div className="flex justify-between items-center text-xs gap-2">
    <span className="text-slate-500 flex items-center gap-1">{icon}{label}</span>
    <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">{value || '—'}</span>
  </div>
);

const FeatureChip = ({ label, on, icon }: { label: string; on?: boolean; icon: React.ReactNode }) => (
  <div className={`flex items-center gap-2 text-[10px] font-medium ${on ? 'text-slate-800 dark:text-slate-200' : 'text-slate-300'}`}>
    <span className={`size-7 rounded-lg flex items-center justify-center ${on ? 'bg-blue-50 text-[#0528d6]' : 'bg-slate-100 text-slate-400'}`}>{icon}</span>
    {label}
    {on && <CheckCircle2 size={10} className="text-green-500 ml-auto" />}
  </div>
);
