/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useMemo, useEffect } from 'react';
import {
  X, Loader2, User, Phone, Search, Car, CheckCircle2, Clock, Calculator, Shield, AlertCircle, Info,
} from 'lucide-react';
import {
  computeRentalQuote,
  driverService,
  getPricingRate,
  hasPricingForType,
  isValidCmMobile,
  normalizeCmPhone,
  resolveMediaDisplayUrl,
  resolvePricingRates,
  vehicleService,
  type RentalType,
} from '@pwa-easy-rental/shared-services';
import { DateTimePicker } from '@pwa-easy-rental/shared-ui';
import { Portal } from '../../components/Portal';
import { ResourceDetailsModal } from '../vehicles/ResourceDetailsModal';

const VEHICLE_FALLBACK =
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop';

interface BookingFormModalProps {
  mode: 'RESERVATION' | 'RENTAL';
  vehicles: any[];
  agencyId: string;
  isDriverRequired: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
  submitError?: string | null;
  t: any;
}

export const BookingFormModal = ({
  mode,
  vehicles,
  agencyId,
  isDriverRequired,
  onClose,
  onSubmit,
  loading,
  submitError,
  t,
}: BookingFormModalProps) => {
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    cniNumber: '',
    vehicleId: '',
    driverId: '',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    rentalType: 'DAILY' as RentalType,
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [fleetVehicles, setFleetVehicles] = useState<any[]>(vehicles ?? []);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesLoadError, setVehiclesLoadError] = useState<string | null>(null);
  const [detailVehicleId, setDetailVehicleId] = useState<string | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [driverConflictMsg, setDriverConflictMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!agencyId) return;
    let cancelled = false;
    const loadFleet = async () => {
      setVehiclesLoading(true);
      setVehiclesLoadError(null);
      const res = await vehicleService.getAvailableVehiclesByAgency(agencyId);
      if (cancelled) return;
      if (res.ok && Array.isArray(res.data)) {
        setFleetVehicles(res.data);
        if (res.data.length === 0) {
          setVehiclesLoadError(
            t.booking?.noVehiclesAvailable
              ?? 'Aucun véhicule disponible. Passez un véhicule en statut « Disponible » depuis la flotte.'
          );
        }
      } else {
        setFleetVehicles([]);
        setVehiclesLoadError(
          t.booking?.vehiclesLoadError ?? 'Impossible de charger les véhicules de l\'agence.'
        );
      }
      setVehiclesLoading(false);
    };
    loadFleet();
    return () => {
      cancelled = true;
    };
  }, [agencyId, t.booking?.noVehiclesAvailable, t.booking?.vehiclesLoadError]);

  useEffect(() => {
    if (!isDriverRequired || !agencyId) {
      setAvailableDrivers([]);
      return;
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end <= start) {
      setAvailableDrivers([]);
      return;
    }

    const loadDrivers = async () => {
      setDriversLoading(true);
      const res = await driverService.getAvailableDrivers(agencyId, form.startDate, form.endDate);
      if (res.ok) {
        const list = res.data || [];
        setAvailableDrivers(list);
        setForm((current) => {
          if (current.driverId && !list.some((d: any) => d.id === current.driverId)) {
            setDriverConflictMsg(t.booking?.driverUnavailable ?? 'Chauffeur indisponible sur cette période');
            return { ...current, driverId: '' };
          }
          setDriverConflictMsg(null);
          return current;
        });
      }
      setDriversLoading(false);
    };
    loadDrivers();
  }, [form.startDate, form.endDate, agencyId, isDriverRequired, t.booking?.driverUnavailable]);

  const selectedVehicle = fleetVehicles.find((v: any) => v.id === form.vehicleId);
  const selectedDriver = availableDrivers.find((d: any) => d.id === form.driverId);

  const quote = useMemo(() => {
    const vehiclePricing = resolvePricingRates(selectedVehicle?.pricing);
    if (!vehiclePricing && !selectedDriver?.pricing) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end <= start) return null;
    return computeRentalQuote(
      {
        startDate: start,
        endDate: end,
        rentalType: form.rentalType,
        vehiclePricing: vehiclePricing ?? { pricePerHour: 0, pricePerDay: 0, pricePerMonth: 0 },
        driverPricing: resolvePricingRates(selectedDriver?.pricing),
      },
      mode === 'RESERVATION'
    );
  }, [form, selectedVehicle, selectedDriver, mode]);

  const missingPrereqs = useMemo(() => {
    const items: { id: string; message: string }[] = [];
    const add = (id: string, message: string) => {
      if (!items.some((i) => i.id === id)) items.push({ id, message });
    };
    if (!form.vehicleId) add('vehicle', t.booking?.needVehicle ?? 'Sélectionnez un véhicule');
    else if (!hasPricingForType(selectedVehicle?.pricing, form.rentalType)) {
      add('vehicle-pricing', t.booking?.needPricing ?? 'Tarif véhicule non configuré');
    }
    if (!form.clientName?.trim()) add('client-name', t.booking?.needClientName ?? 'Nom client');
    if (!isValidCmMobile(form.clientPhone)) add('phone', t.booking?.needPhone ?? 'Téléphone invalide');
    if (isDriverRequired && !form.driverId) add('driver', t.booking?.needDriver ?? 'Chauffeur obligatoire');
    if (isDriverRequired && !driversLoading && availableDrivers.length === 0) {
      add('no-drivers', t.booking?.noDriversAvailable ?? 'Aucun chauffeur disponible sur cette période');
    }
    if (selectedDriver && !hasPricingForType(selectedDriver?.pricing, form.rentalType)) {
      add('driver-pricing', t.booking?.needDriverPricing ?? 'Tarif chauffeur non configuré');
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end <= start) add('dates', t.booking?.needDates ?? 'Dates invalides');
    if (quote && quote.baseAmount <= 0) add('zero-base', t.booking?.needZeroAmount ?? 'Montant de base invalide');
    return items;
  }, [form, selectedVehicle, selectedDriver, quote, isDriverRequired, driversLoading, availableDrivers.length, t]);

  const canSubmit = missingPrereqs.length === 0 && !loading;

  const filteredVehicles = useMemo(
    () =>
      fleetVehicles.filter((v: any) =>
        `${v.brand} ${v.model} ${v.licencePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [fleetVehicles, searchTerm]
  );

  const priceForType = (v: any) => {
    const rate = getPricingRate(v.pricing, form.rentalType);
    return rate != null ? rate.toLocaleString() : '—';
  };

  const rentalTypeLabel = (type: RentalType) => {
    if (type === 'HOURLY') return t.vehicles.modal.hourly;
    if (type === 'MONTHLY') return t.vehicles.modal.monthly ?? 'Par mois';
    return t.vehicles.modal.daily;
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({
              ...form,
              clientPhone: normalizeCmPhone(form.clientPhone),
              requestedDeposit: quote?.requestedDeposit ?? 0,
            });
          }}
          className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20 animate-in zoom-in"
        >
          <div
            className={`px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-white ${
              mode === 'RESERVATION' ? 'bg-[#0528d6]' : 'bg-blue-600'
            }`}
          >
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold uppercase italic tracking-tighter">
                {mode === 'RESERVATION' ? t.booking?.newReservation : t.booking?.newRental}
              </h3>
              <p className="text-[10px] opacity-70 font-bold uppercase italic tracking-widest hidden sm:block">
                {t.agencies.modal.autoCalc || 'Tarification dynamique'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-6 text-left">
            {submitError && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle size={14} /> {submitError}
                </p>
              </div>
            )}
            {missingPrereqs.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                  <AlertCircle size={14} /> {t.booking?.prerequisitesTitle}
                </p>
                <ul className="text-[10px] font-bold text-amber-800 dark:text-amber-300 space-y-1 list-disc pl-4">
                  {missingPrereqs.map((item) => (
                    <li key={item.id}>{item.message}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <section className="space-y-6">
                <h4 className="text-[11px] font-black text-[#0528d6] dark:text-blue-400 uppercase tracking-widest italic border-b dark:border-slate-800 pb-2 flex items-center gap-2">
                  <Car size={14} /> 1. {t.vehicles.title || 'Ressources'}
                </h4>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  {(['DAILY', 'HOURLY', 'MONTHLY'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, rentalType: type })}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase italic transition-all ${
                        form.rentalType === type ? 'bg-[#0528d6] text-white shadow-md' : 'text-slate-400'
                      }`}
                    >
                      {rentalTypeLabel(type)}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    placeholder={t.vehicles.searchPlaceholder}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold outline-none focus:border-[#0528d6] dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar min-h-[4rem]">
                  {vehiclesLoading ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[10px] font-bold text-slate-400 uppercase italic">
                      <Loader2 className="animate-spin size-4" />
                      {t.booking?.loadingVehicles ?? 'Chargement de la flotte…'}
                    </div>
                  ) : filteredVehicles.length === 0 ? (
                    <p className="py-6 px-4 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      {vehiclesLoadError
                        ?? t.booking?.noVehiclesAvailable
                        ?? 'Aucun véhicule disponible pour cette agence.'}
                    </p>
                  ) : (
                  filteredVehicles.map((v: any) => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between ${
                        form.vehicleId === v.id
                          ? 'border-[#0528d6] bg-blue-50/50 dark:bg-blue-900/20'
                          : 'border-slate-50 dark:border-slate-800'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, vehicleId: v.id })}
                        className="flex items-center gap-3 flex-1 text-left"
                      >
                        <div className="size-10 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                          <img
                            src={resolveMediaDisplayUrl(v.images?.[0] || VEHICLE_FALLBACK)}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase italic text-slate-700 dark:text-white">
                            {v.brand} {v.model}
                          </p>
                          <p className="text-[9px] font-mono text-slate-400 uppercase">{v.licencePlate}</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] font-black text-[#0528d6] dark:text-blue-400">
                          {priceForType(v)} XAF
                        </p>
                        <button
                          type="button"
                          onClick={() => setDetailVehicleId(v.id)}
                          className="p-1.5 text-slate-400 hover:text-[#0528d6]"
                          title={t.booking?.viewVehicleDetails}
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1 flex justify-between">
                    <span>{t.staff.profile.agency || 'Assignation Chauffeur'}</span>
                    {isDriverRequired && (
                      <span className="text-red-500 font-black">{t.kpi.action || 'OBLIGATOIRE'}</span>
                    )}
                  </label>
                  {driverConflictMsg && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl text-[10px] font-black text-orange-700 dark:text-orange-300 uppercase italic flex items-center gap-2">
                      <AlertCircle size={14} />
                      {driverConflictMsg}
                    </div>
                  )}
                  {driversLoading ? (
                    <div className="flex items-center gap-2 p-3 text-[10px] font-bold text-slate-400 uppercase italic">
                      <Loader2 className="animate-spin size-4" />
                      {t.booking?.loadingDrivers ?? 'Vérification des disponibilités…'}
                    </div>
                  ) : (
                    <>
                      {!driversLoading && isDriverRequired && availableDrivers.length === 0 && (
                        <p className="text-[10px] font-bold text-red-500 uppercase italic">
                          {t.booking?.noDriversAvailable ?? 'Aucun chauffeur disponible (réservation, maladie ou indisponibilité)'}
                        </p>
                      )}
                      <select
                        value={form.driverId}
                        onChange={(e) => {
                          setDriverConflictMsg(null);
                          setForm({ ...form, driverId: e.target.value });
                        }}
                        required={isDriverRequired}
                        className={`w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 rounded-xl font-bold text-sm outline-none dark:text-white ${
                          isDriverRequired && !form.driverId
                            ? 'border-red-200 dark:border-red-900'
                            : 'border-slate-100 dark:border-slate-800'
                        }`}
                      >
                        <option value="">{t.staff.modal.selectPlaceholder}</option>
                        {availableDrivers.map((d: any) => (
                          <option key={d.id} value={d.id}>
                            {d.firstname} {d.lastname}
                            {d.rating ? ` ★ ${d.rating.toFixed(1)}` : ''}
                            {!hasPricingForType(d.pricing, form.rentalType) ? ' — tarif manquant' : ''}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </section>

              <section className="space-y-6">
                <h4 className="text-[11px] font-black text-[#0528d6] dark:text-blue-400 uppercase tracking-widest italic border-b dark:border-slate-800 pb-2 flex items-center gap-2">
                  <User size={14} /> 2. {t.table.customer || 'Détails Dossier'}
                </h4>
                <div className="space-y-4">
                  <Input
                    label={t.agencies.modal.clientName || 'Nom Client'}
                    value={form.clientName}
                    onChange={(v: string) => setForm({ ...form, clientName: v })}
                    required
                    icon={<User size={14} />}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label={t.agencies.modal.phone}
                      value={form.clientPhone}
                      onChange={(v: string) => setForm({ ...form, clientPhone: normalizeCmPhone(v) })}
                      required
                      icon={<Phone size={14} />}
                      maxLength={9}
                      inputMode="numeric"
                      hint={!form.clientPhone || isValidCmMobile(form.clientPhone) ? undefined : t.booking?.needPhone}
                    />
                    <Input
                      label={t.onboarding.form.legal}
                      value={form.cniNumber}
                      onChange={(v: string) => setForm({ ...form, cniNumber: v.toUpperCase() })}
                      required
                      icon={<Shield size={14} />}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DateTimePicker
                      label={t.table.start}
                      value={form.startDate}
                      onChange={(v) => setForm({ ...form, startDate: v })}
                      required
                    />
                    <DateTimePicker
                      label={t.table.end}
                      value={form.endDate}
                      onChange={(v) => setForm({ ...form, endDate: v })}
                      required
                    />
                  </div>
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] space-y-4">
                    <div className="flex justify-between items-center text-slate-500">
                      <span className="text-[10px] font-black uppercase italic tracking-widest flex items-center gap-2">
                        <Clock size={12} /> {t.system.log || 'Durée'}
                      </span>
                      <span className="text-sm font-black italic">
                        {quote?.billedUnits ?? 0} {quote?.unitLabel ?? ''}
                      </span>
                    </div>
                    {quote && quote.savingsVsHourly > 0 && (
                      <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase italic">
                        {(t.booking?.savingsVsHourly ?? 'Économisez {amount} XAF vs tarif horaire').replace(
                          '{amount}',
                          quote.savingsVsHourly.toLocaleString()
                        )}
                      </p>
                    )}
                    {quote && (
                      <div className="text-[9px] font-bold text-slate-500 space-y-1 border-b border-slate-200 dark:border-slate-700 pb-3">
                        <div className="flex justify-between">
                          <span>{t.booking?.vehicleBase ?? 'Tarif véhicule'}</span>
                          <span>{quote.vehicleBaseAmount.toLocaleString()} XAF</span>
                        </div>
                        {quote.driverBaseAmount > 0 && (
                          <div className="flex justify-between">
                            <span>{t.booking?.driverBase ?? 'Tarif chauffeur'}</span>
                            <span>{quote.driverBaseAmount.toLocaleString()} XAF</span>
                          </div>
                        )}
                        <div className="flex justify-between font-black text-slate-600 dark:text-slate-300">
                          <span>{t.booking?.baseAmount}</span>
                          <span>{quote.baseAmount.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.booking?.commission}</span>
                          <span>{quote.commission.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t.booking?.deposit}</span>
                          <span>{quote.deposit.toLocaleString()} XAF</span>
                        </div>
                        <div className="flex justify-between font-black text-slate-700 dark:text-slate-200">
                          <span>{t.booking?.total}</span>
                          <span>{quote.total.toLocaleString()} XAF</span>
                        </div>
                      </div>
                    )}
                    <div className="flex justify-between items-center p-4 bg-[#0528d6] rounded-2xl text-white shadow-xl shadow-blue-600/20">
                      <div>
                        <p className="text-[9px] font-bold uppercase opacity-80 italic">
                          {t.table.paid || 'Acompte'} ({mode === 'RESERVATION' ? '60%' : '100%'})
                        </p>
                        <p className="text-2xl font-black italic leading-none mt-1">
                          {(quote?.requestedDeposit ?? 0).toLocaleString()} XAF
                        </p>
                      </div>
                      <Calculator size={28} className="opacity-30" />
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-4 px-8 text-sm font-black text-slate-400 uppercase italic hover:text-red-500"
            >
              {t.agencies.modal.cancel}
            </button>
            <button
              disabled={!canSubmit}
              className="w-full sm:w-auto py-4 px-10 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl flex items-center justify-center gap-3 italic tracking-widest disabled:opacity-30"
            >
              {loading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                <>
                  <CheckCircle2 size={18} /> {t.agencies.modal.submit}{' '}
                  {(quote?.requestedDeposit ?? 0).toLocaleString()} XAF
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {detailVehicleId && (
        <ResourceDetailsModal
          resourceId={detailVehicleId}
          type="VEHICLE"
          onClose={() => setDetailVehicleId(null)}
          t={t}
        />
      )}
    </Portal>
  );
};

const Input = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  icon,
  maxLength,
  inputMode,
  hint,
}: any) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1">{label}</label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6]">
          {icon}
        </div>
      )}
      <input
        type={type}
        required={required}
        value={value}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-11' : 'px-4'} p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] dark:text-white`}
      />
    </div>
    {hint && <p className="text-[9px] font-bold text-red-500 ml-1">{hint}</p>}
  </div>
);
