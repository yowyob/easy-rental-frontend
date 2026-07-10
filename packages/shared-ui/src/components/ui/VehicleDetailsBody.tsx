/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import {
  Calendar,
  Star,
  MessageSquare,
  Clock,
  Settings,
  HardDrive,
  Wind,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Users,
  Palette,
} from 'lucide-react';
import {
  DEFAULT_VEHICLE_FUNCTIONALITIES,
  formatScheduleDate,
  resolveMediaDisplayUrl,
} from '@pwa-easy-rental/shared-services';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';

const formatPrice = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString() : '—';
};

const display = (value: unknown, suffix = '') => {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${suffix}`;
};

export interface VehicleDetailsBodyProps {
  details: any;
  t?: any;
}

const scheduleStatusLabel = (status: string | undefined, t?: any) => {
  const key = (status ?? '').toUpperCase();
  if (key === 'RENTED') return t?.resDetails?.rentedSlot ?? 'Réservation / location';
  if (key === 'MAINTENANCE') return t?.resDetails?.maintenanceSlot ?? 'Maintenance';
  if (key === 'UNAVAILABLE') return t?.resDetails?.unavailableLabel ?? 'Indisponible';
  return status || '—';
};

export const VehicleDetailsBody = ({ details, t }: VehicleDetailsBodyProps) => {
  const vehicle = details?.vehicle ?? {};
  const pricing = details?.pricing;
  const schedule = details?.schedule ?? [];
  const reviews = details?.reviews ?? [];
  const functionalities = {
    ...DEFAULT_VEHICLE_FUNCTIONALITIES,
    ...(vehicle.functionalities ?? {}),
  };

  const yearLabel = vehicle.yearProduction
    ? new Date(vehicle.yearProduction).getFullYear()
    : '—';

  const insuranceExpiry = vehicle.insuranceDetails?.expiry
    ? new Date(vehicle.insuranceDetails.expiry).toLocaleDateString()
    : '—';

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="aspect-video lg:aspect-square rounded-[2rem] overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner bg-slate-100">
            <img
              src={resolveMediaDisplayUrl(vehicle.images?.[0] || FALLBACK_IMAGE)}
              className="w-full h-full object-cover"
              alt={`${vehicle.brand} ${vehicle.model}`}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">
                {t?.resDetails?.globalRating ?? 'Note globale'}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-orange-500">
                <Star size={16} fill="currentColor" />
                <span className="text-xl font-black italic">
                  {details.rating != null ? Number(details.rating).toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">
                {t?.resDetails?.customerReviews ?? 'Avis clients'}
              </p>
              <div className="flex items-center justify-center gap-1.5 text-[#0528d6]">
                <MessageSquare size={16} />
                <span className="text-xl font-black italic">{reviews.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionTitle icon={<DollarSign size={18} />} title={t?.driverStatus?.pricingSection ?? 'Grille tarifaire'} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <PriceCard label={t?.driverStatus?.pricePerHour ?? 'Prix / Heure'} value={pricing?.pricePerHour} />
              <PriceCard label={t?.driverStatus?.pricePerDay ?? 'Prix / Jour'} value={pricing?.pricePerDay} />
              <PriceCard label={t?.driverStatus?.pricePerMonth ?? 'Prix / Mois'} value={pricing?.pricePerMonth} />
            </div>
            {!pricing?.pricePerHour && !pricing?.pricePerDay && (
              <p className="mt-3 text-[10px] font-bold text-amber-600 uppercase italic">
                {t?.booking?.needPricing ?? 'Tarif non configuré — renseignez-le depuis la flotte.'}
              </p>
            )}
          </section>

          <section>
            <SectionTitle icon={<Settings size={18} />} title="Identité & châssis" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 min-w-0">
              <Field label="Marque" value={vehicle.brand} />
              <Field label="Modèle" value={vehicle.model} />
              <Field label="Immatriculation" value={vehicle.licencePlate} mono />
              <Field label="VIN" value={vehicle.vinNumber} mono fullWidth breakAll />
              <Field label="Année" value={yearLabel} />
              <Field label="Statut" value={vehicle.statut} />
              <Field label="Couleur" value={vehicle.color} icon={<Palette size={12} />} />
              <Field label="Places" value={display(vehicle.places)} icon={<Users size={12} />} />
              <Field label="Kilométrage" value={display(vehicle.kilometrage, ' km')} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<HardDrive size={18} />} title="Moteur & efficacité" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 min-w-0">
              <Field label="Type moteur" value={vehicle.engineDetails?.type} />
              <Field label="Puissance (HP)" value={display(vehicle.engineDetails?.horsepower, ' HP')} />
              <Field label="Cylindrée (L)" value={display(vehicle.engineDetails?.capacity, ' L')} />
              <Field label="Transmission" value={vehicle.transmission} />
              <Field label="Conso. ville" value={vehicle.fuelEfficiency?.city} />
              <Field label="Conso. route" value={vehicle.fuelEfficiency?.highway} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Wind size={18} />} title="Équipements & confort" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {Object.entries(functionalities).map(([key, val]) => (
                <div
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-[9px] font-black italic truncate ${
                    val
                      ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-slate-50 text-slate-400 border-slate-100 opacity-60 dark:bg-slate-900 dark:border-slate-800'
                  }`}
                >
                  <CheckCircle2 size={12} className="shrink-0" />
                  <span>{key.replace(/_/g, ' ')}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <SectionTitle icon={<ShieldCheck size={18} />} title="Assurance & conformité" />
          <div className="space-y-3 mt-4">
            <Field label="Assureur" value={vehicle.insuranceDetails?.provider} />
            <Field label="N° police" value={vehicle.insuranceDetails?.policy_number} mono />
            <Field label="Expiration" value={insuranceExpiry} />
            <Field
              label="Chauffeur obligatoire"
              value={details.isDriverBookingRequired ? 'Oui' : 'Non'}
            />
          </div>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
          <SectionTitle
            icon={<Calendar size={18} />}
            title={t?.resDetails?.planningTitle ?? 'Planning & réservations'}
          />
          <div className="space-y-3 mt-4">
            {schedule.length > 0 ? (
              schedule.map((s: any) => (
                <div
                  key={s.id}
                  className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <Clock size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-xs font-black uppercase italic text-slate-700 dark:text-white truncate">
                        {s.reason || scheduleStatusLabel(s.status, t)}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold italic">
                        {formatScheduleDate(s.startDate ?? s.start_date)} — {formatScheduleDate(s.endDate ?? s.end_date)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase px-2 py-1 bg-orange-50 text-orange-600 rounded-lg shrink-0">
                    {scheduleStatusLabel(s.status, t)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                {t?.resDetails?.noSchedule ?? 'Aucune réservation ni indisponibilité sur cette période'}
              </p>
            )}
          </div>
        </section>
      </div>

      <section>
        <SectionTitle
          icon={<MessageSquare size={18} />}
          title={t?.resDetails?.latestReviews ?? 'Derniers retours clients'}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {reviews.length > 0 ? (
            reviews.map((r: any) => (
              <div
                key={r.id}
                className="p-5 bg-slate-50 dark:bg-slate-900/30 rounded-[1.5rem] border border-slate-100 dark:border-slate-800"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-black uppercase italic text-[#0528d6]">
                    {r.authorName || 'Client'}
                  </span>
                  <div className="flex text-orange-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={10}
                        fill={i < (r.rating ?? 0) ? 'currentColor' : 'none'}
                        className={i < (r.rating ?? 0) ? '' : 'text-slate-200'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed">
                  &quot;{r.comment}&quot;
                </p>
                {r.createdAt && (
                  <p className="text-[8px] text-slate-400 mt-3 uppercase font-black italic">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="col-span-full py-8 text-center text-slate-400 text-xs italic font-bold uppercase">
              {t?.resDetails?.emptyReviews ?? 'Aucun avis pour le moment'}
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
    <span className="text-[#0528d6]">{icon}</span>
    <h5 className="text-sm font-black uppercase tracking-tighter italic text-slate-800 dark:text-white">
      {title}
    </h5>
  </div>
);

const Field = ({
  label,
  value,
  mono,
  icon,
  fullWidth,
  breakAll,
}: {
  label: string;
  value: unknown;
  mono?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  breakAll?: boolean;
}) => (
  <div className={`space-y-1 min-w-0 overflow-hidden ${fullWidth ? 'col-span-full' : ''}`}>
    <p className="text-[9px] font-black text-slate-400 italic tracking-widest flex items-center gap-1">
      {icon}
      {label}
    </p>
    <p
      className={`text-sm font-black text-slate-800 dark:text-white italic ${
        mono ? 'font-mono text-xs bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded' : ''
      } ${breakAll ? 'break-all leading-relaxed' : 'truncate'}`}
      title={value === null || value === undefined || value === '' ? undefined : String(value)}
    >
      {value === null || value === undefined || value === '' ? '—' : String(value)}
    </p>
  </div>
);

const PriceCard = ({ label, value }: { label: string; value: unknown }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{label}</p>
    <p className="text-lg font-black text-[#0528d6] dark:text-blue-400 italic">
      {formatPrice(value)} <span className="text-[10px]">XAF</span>
    </p>
  </div>
);
