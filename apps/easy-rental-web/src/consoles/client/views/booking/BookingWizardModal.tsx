/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Car,
  Phone,
  Clock,
  Calculator,
  User,
  MapPin,
  Mail,
  Store,
  Gift,
} from 'lucide-react';
import {
  rentalService,
  driverService,
  loyaltyService,
  normalizeCmPhone,
  isValidCmMobile,
  CM_PHONE_HINT,
  rentalPeriodOverlapsSchedule,
  resolveMediaDisplayUrl,
  computeRentalQuote,
  resolvePricingRates,
  hasPricingForType,
  getPricingRate,
  type RentalType,
} from '@pwa-easy-rental/shared-services';
import { DateTimePicker } from '@pwa-easy-rental/shared-ui';
import { Portal } from '../../components/Portal';

const VEHICLE_FALLBACK = '/client/vehicle-placeholder.svg';

type Phase = 'form' | 'success';

export const BookingWizardModal = ({
  vehicle,
  agency,
  userData,
  isDriverRequired,
  initialRentalType,
  schedule = [],
  onClose,
}: any) => {
  const localISO = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [phase, setPhase] = useState<Phase>('form');
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [initRes, setInitRes] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [outstandingDebt, setOutstandingDebt] = useState(0);
  const [pointsBalance, setPointsBalance] = useState(0);
  const [useRedeem, setUseRedeem] = useState(false);
  const [redeemPoints, setRedeemPoints] = useState(0);

  useEffect(() => {
    const clientId = userData?.id;
    const agencyId = vehicle?.agencyId;
    if (!clientId || !agencyId) return;
    let cancelled = false;
    rentalService.getClientDebtForAgency(clientId, agencyId).then((r: any) => {
      if (!cancelled && r.ok) setOutstandingDebt(r.debt || 0);
    });
    return () => { cancelled = true; };
  }, [userData?.id, vehicle?.agencyId]);

  useEffect(() => {
    const clientId = userData?.id;
    if (!clientId) return;
    let cancelled = false;
    loyaltyService.getBalance(clientId).then((r: any) => {
      if (!cancelled && r.ok && r.data) setPointsBalance(Number(r.data.balance) || 0);
    });
    return () => { cancelled = true; };
  }, [userData?.id]);

  const [form, setForm] = useState({
    vehicleId: vehicle.id,
    driverId: '',
    clientPhone: normalizeCmPhone(userData?.phone || ''),
    startDate: localISO(new Date(Date.now() + 60 * 60 * 1000)),
    endDate: localISO(new Date(Date.now() + 25 * 60 * 60 * 1000)),
    rentalType: (initialRentalType || 'DAILY') as RentalType,
  });

  const selectedDriver = drivers.find((d) => d.id === form.driverId);
  const contactAgency = initRes?.agency ?? agency;

  const quote = useMemo(() => {
    const vehiclePricing = resolvePricingRates(vehicle?.pricing);
    if (!vehiclePricing && !selectedDriver?.pricing) return null;
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end <= start) return null;
    // No quote / billing preview for a start date already in the past
    if (start.getTime() < Date.now() - 60_000) return null;
    if (rentalPeriodOverlapsSchedule(form.startDate, form.endDate, schedule)) return null;
    const depositPct = Number(agency?.depositPercentage);
    return computeRentalQuote(
      {
        startDate: start,
        endDate: end,
        rentalType: form.rentalType,
        vehiclePricing: vehiclePricing ?? { pricePerHour: 0, pricePerDay: 0, pricePerMonth: 0 },
        driverPricing: resolvePricingRates(selectedDriver?.pricing),
        cautionRate: Number.isFinite(depositPct) && depositPct > 0 ? depositPct / 100 : null,
      },
      true
    );
  }, [form, vehicle, selectedDriver, schedule, agency]);

  const missingPrereqs = useMemo(() => {
    const items: { id: string; message: string }[] = [];
    const add = (id: string, message: string) => {
      if (!items.some((i) => i.id === id)) items.push({ id, message });
    };
    if (!hasPricingForType(vehicle?.pricing, form.rentalType)) {
      add('vehicle-pricing', 'Tarif véhicule non configuré pour ce mode.');
    }
    if (!isValidCmMobile(form.clientPhone)) {
      add('phone', `Téléphone invalide. ${CM_PHONE_HINT}`);
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    const earliestAllowed = Date.now() - 60_000; // 1 min grace for form latency
    if (start.getTime() < earliestAllowed) {
      add('past', 'La date de départ ne peut pas être dans le passé.');
    }
    if (end <= start) add('dates', 'La date de retour doit être après le départ.');
    if (rentalPeriodOverlapsSchedule(form.startDate, form.endDate, schedule)) {
      add('schedule', 'Véhicule indisponible sur cette période.');
    }
    if (isDriverRequired && !form.driverId) {
      add('driver', 'Sélectionnez un chauffeur.');
    }
    if (isDriverRequired && !driversLoading && drivers.length === 0) {
      add('no-drivers', 'Aucun chauffeur disponible sur cette période.');
    }
    if (selectedDriver && !hasPricingForType(selectedDriver?.pricing, form.rentalType)) {
      add('driver-pricing', 'Tarif chauffeur non configuré.');
    }
    if (quote && quote.baseAmount <= 0) add('zero', 'Montant de base invalide.');
    return items;
  }, [form, vehicle, selectedDriver, quote, isDriverRequired, driversLoading, drivers.length]);

  const canSubmit = missingPrereqs.length === 0 && !loading;
  const estimatedDeposit = quote?.requestedDeposit ?? 0;

  useEffect(() => {
    if (!isDriverRequired || !vehicle.agencyId) {
      setDrivers([]);
      return;
    }
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);
    if (end <= start) {
      setDrivers([]);
      return;
    }
    const load = async () => {
      setDriversLoading(true);
      const res = await driverService.getAvailableDrivers(vehicle.agencyId, form.startDate, form.endDate);
      if (res.ok) {
        const list = res.data || [];
        setDrivers(list);
        if (form.driverId && !list.some((d: any) => d.id === form.driverId)) {
          setForm((prev) => ({ ...prev, driverId: '' }));
        }
      }
      setDriversLoading(false);
    };
    load();
  }, [form.startDate, form.endDate, vehicle.agencyId, form.driverId, isDriverRequired]);

  const handleReserve = async () => {
    setSubmitAttempted(true);
    if (!canSubmit) {
      setError(missingPrereqs[0]?.message ?? 'Vérifiez le formulaire.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const effectiveRedeem = useRedeem ? Math.max(0, Math.min(redeemPoints, pointsBalance)) : 0;
      const res = await rentalService.initiateRental({ ...form, redeemPoints: effectiveRedeem });
      if (res.ok && res.data?.isAllowed) {
        setInitRes(res.data);
        setPhase('success');
      } else {
        setError(res.data?.message || "Ce créneau n'est plus disponible.");
      }
    } catch {
      setError('Impossible d\'enregistrer la demande. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const rentalTypeLabel = (type: RentalType) => {
    if (type === 'HOURLY') return 'Par heure';
    if (type === 'MONTHLY') return 'Par mois';
    return 'Par jour';
  };

  const priceForVehicle = () => {
    const rate = getPricingRate(vehicle?.pricing, form.rentalType);
    return rate != null ? rate.toLocaleString('fr-FR') : '—';
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} aria-hidden />

        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[2rem] md:rounded-[2.5rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20">
          <div className="px-6 md:px-10 py-5 border-b flex justify-between items-center text-white bg-[#0528d6]">
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                {phase === 'form' ? 'Réserver ce véhicule' : 'Demande envoyée'}
              </h3>
              <p className="text-[10px] opacity-80 font-medium uppercase tracking-widest hidden sm:block">
                Devis indicatif · confirmation par l&apos;agence
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto flex-1 text-left space-y-4">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 rounded-2xl flex items-start gap-2 text-red-600 text-sm">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {phase === 'form' && (
              <>
                {submitAttempted && missingPrereqs.length > 0 && (
                  <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
                    <p className="text-[10px] font-bold uppercase text-amber-700 flex items-center gap-2 mb-2">
                      <AlertCircle size={14} /> À corriger
                    </p>
                    <ul className="text-xs text-amber-800 space-y-1 list-disc pl-4">
                      {missingPrereqs.map((item) => (
                        <li key={item.id}>{item.message}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {agency && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl text-sm">
                    <Store size={16} className="text-[#0528d6] shrink-0" />
                    <span>
                      Retrait chez <strong>{agency.name}</strong>
                      {agency.city ? ` · ${agency.city}` : ''}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <section className="space-y-5">
                    <h4 className="text-[11px] font-bold text-[#0528d6] uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                      <Car size={14} /> 1. Véhicule & options
                    </h4>

                    <div className="p-4 rounded-xl border-2 border-[#0528d6] bg-blue-50/40 flex items-center gap-4">
                      <div className="size-14 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                        <img
                          src={resolveMediaDisplayUrl(vehicle.images?.[0] || VEHICLE_FALLBACK)}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = VEHICLE_FALLBACK; }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-[10px] font-mono text-slate-500">{vehicle.licencePlate}</p>
                        <p className="text-sm font-bold text-[#0528d6] mt-1">{priceForVehicle()} XAF</p>
                      </div>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                      {(['DAILY', 'HOURLY', 'MONTHLY'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setForm({ ...form, rentalType: type })}
                          className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${
                            form.rentalType === type ? 'bg-[#0528d6] text-white' : 'text-slate-400'
                          }`}
                        >
                          {rentalTypeLabel(type)}
                        </button>
                      ))}
                    </div>

                    {isDriverRequired && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase flex justify-between">
                          <span className="flex items-center gap-1"><User size={12} /> Chauffeur</span>
                          <span className="text-red-500">Obligatoire</span>
                        </label>
                        {driversLoading ? (
                          <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
                            <Loader2 className="animate-spin size-4" /> Chargement…
                          </div>
                        ) : drivers.length === 0 ? (
                          <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-xl">
                            Aucun chauffeur disponible sur cette période. Modifiez vos dates ou contactez l&apos;agence.
                          </p>
                        ) : (
                          <select
                            value={form.driverId}
                            onChange={(e) => { setForm({ ...form, driverId: e.target.value }); setError(null); }}
                            className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-medium outline-none dark:text-white dark:bg-slate-900"
                          >
                            <option value="">Choisir un chauffeur</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.firstname} {d.lastname}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </section>

                  <section className="space-y-5">
                    <h4 className="text-[11px] font-bold text-[#0528d6] uppercase tracking-widest border-b pb-2 flex items-center gap-2">
                      <Phone size={14} /> 2. Votre trajet
                    </h4>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Votre téléphone</label>
                      <input
                        inputMode="numeric"
                        maxLength={9}
                        value={form.clientPhone}
                        onChange={(e) => { setForm({ ...form, clientPhone: normalizeCmPhone(e.target.value) }); setError(null); }}
                        placeholder="678123456"
                        className="w-full mt-1.5 p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm outline-none focus:border-[#0528d6] dark:text-white dark:bg-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <DateTimePicker label="Départ" value={form.startDate} onChange={(v) => { setForm({ ...form, startDate: v }); setError(null); }} required />
                      <DateTimePicker label="Retour" value={form.endDate} onChange={(v) => { setForm({ ...form, endDate: v }); setError(null); }} required />
                    </div>

                    {/* Indisponibilités du véhicule (déjà réservé / maintenance) */}
                    {(() => {
                      const blocks = (schedule || [])
                        .filter((b: any) => ['RENTED', 'MAINTENANCE', 'UNAVAILABLE', 'RESERVED'].includes(String(b.status ?? '').toUpperCase()))
                        .filter((b: any) => b.startDate && b.endDate && new Date(b.endDate).getTime() >= Date.now())
                        .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
                      if (blocks.length === 0) return null;
                      return (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30">
                          <p className="text-[10px] font-black uppercase italic tracking-widest text-amber-700 mb-2">
                            Véhicule indisponible sur ces périodes
                          </p>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto">
                            {blocks.map((b: any, i: number) => (
                              <div key={i} className="flex items-center justify-between text-[11px] font-bold text-amber-800 dark:text-amber-300">
                                <span>
                                  {new Date(b.startDate).toLocaleDateString('fr-FR')} → {new Date(b.endDate).toLocaleDateString('fr-FR')}
                                </span>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40">
                                  {String(b.status).toUpperCase() === 'MAINTENANCE' ? 'Maintenance' : 'Réservé'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="p-6 bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
                      {/* Tarifs indicatifs (toujours visibles) */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        {(['HOURLY', 'DAILY', 'MONTHLY'] as const).map((mode) => {
                          const r = getPricingRate(vehicle?.pricing, mode);
                          const lbl = mode === 'HOURLY' ? '/heure' : mode === 'DAILY' ? '/jour' : '/mois';
                          return (
                            <div key={mode} className={`p-2 rounded-xl border ${form.rentalType === mode ? 'border-[#0528d6] bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800'}`}>
                              <div className="text-[8px] font-black uppercase text-slate-400">{lbl}</div>
                              <div className="text-xs font-black text-slate-700 dark:text-slate-200">{r != null ? `${r.toLocaleString('fr-FR')}` : '—'}</div>
                            </div>
                          );
                        })}
                      </div>

                      {!quote || !quote.valid ? (
                        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 text-[11px] font-bold italic text-amber-700 text-center">
                          Choisissez une période valide (le retour doit être après le départ) pour voir le tarif.
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-slate-500 text-sm">
                            <span className="flex items-center gap-2 text-[10px] font-bold uppercase"><Clock size={12} /> Facturé</span>
                            <span className="font-bold">{quote.billedLabel}</span>
                          </div>

                          <div className="text-xs space-y-1.5 border-b border-slate-200 pb-3">
                            <div className="flex justify-between"><span>Tarif véhicule</span><span>{Math.round(quote.vehicleBaseAmount).toLocaleString('fr-FR')} XAF</span></div>
                            {quote.driverBaseAmount > 0 && (
                              <div className="flex justify-between"><span>Tarif chauffeur</span><span>{Math.round(quote.driverBaseAmount).toLocaleString('fr-FR')} XAF</span></div>
                            )}
                            <div className="flex justify-between text-slate-400"><span>Caution (restituée au retour)</span><span>{Math.round(quote.caution).toLocaleString('fr-FR')} XAF</span></div>
                            <div className="flex justify-between font-bold"><span>Total dossier</span><span>{Math.round(quote.total).toLocaleString('fr-FR')} XAF</span></div>
                          </div>

                          {pointsBalance > 0 && (
                            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 space-y-3">
                              <label className="flex items-center justify-between gap-3 cursor-pointer">
                                <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-700">
                                  <Gift size={14} /> Utiliser mes points (solde: {pointsBalance.toLocaleString('fr-FR')})
                                </span>
                                <input
                                  type="checkbox"
                                  checked={useRedeem}
                                  onChange={(e) => {
                                    setUseRedeem(e.target.checked);
                                    if (!e.target.checked) setRedeemPoints(0);
                                  }}
                                  className="size-4 accent-[#0528d6]"
                                />
                              </label>
                              {useRedeem && (
                                <div className="space-y-2">
                                  <input
                                    type="range"
                                    min={0}
                                    max={pointsBalance}
                                    value={redeemPoints}
                                    onChange={(e) => setRedeemPoints(Number(e.target.value))}
                                    className="w-full accent-[#0528d6]"
                                  />
                                  <div className="flex items-center justify-between text-[11px]">
                                    <input
                                      type="number"
                                      min={0}
                                      max={pointsBalance}
                                      value={redeemPoints}
                                      onChange={(e) => {
                                        const v = Number(e.target.value);
                                        setRedeemPoints(Number.isFinite(v) ? Math.max(0, Math.min(v, pointsBalance)) : 0);
                                      }}
                                      className="w-20 p-1.5 text-center bg-white dark:bg-slate-900 border border-amber-200 rounded-lg text-xs font-bold outline-none"
                                    />
                                    <span className="font-bold text-amber-700">
                                      Remise: {(redeemPoints * 10).toLocaleString('fr-FR')} XAF
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {outstandingDebt > 0 && (
                            <div className="flex justify-between items-center p-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600">
                              <span className="text-[10px] font-black uppercase italic tracking-widest">Dette antérieure à régler</span>
                              <span className="text-sm font-black italic">+ {Math.round(outstandingDebt).toLocaleString('fr-FR')} XAF</span>
                            </div>
                          )}

                          <div className="flex justify-between items-center p-4 bg-[#0528d6] rounded-2xl text-white">
                            <div>
                              <p className="text-[9px] font-bold uppercase opacity-80">
                                {outstandingDebt > 0 ? 'À régler en agence (acompte 60 % + dette)' : 'Acompte estimé (60 %) — à régler en agence'}
                              </p>
                              <p className="text-2xl font-bold mt-1">{Math.round(estimatedDeposit + outstandingDebt).toLocaleString('fr-FR')} XAF</p>
                            </div>
                            <Calculator size={28} className="opacity-30" />
                          </div>
                        </>
                      )}

                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        Le paiement en ligne arrive bientôt. Pour l&apos;instant, l&apos;agence vous contactera pour confirmer la réservation.
                      </p>
                    </div>
                  </section>
                </div>
              </>
            )}

            {phase === 'success' && (
              <div className="max-w-lg mx-auto space-y-6 py-4">
                <div className="text-center space-y-3">
                  <div className="size-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">Demande enregistrée</h3>
                  <p className="text-sm text-slate-500">
                    Votre réservation est en attente de confirmation. Contactez l&apos;agence pour valider le créneau
                    et régler l&apos;acompte de{' '}
                    <strong>{estimatedDeposit.toLocaleString('fr-FR')} XAF</strong>.
                  </p>
                  {Number(initRes?.loyaltyDiscount) > 0 && (
                    <p className="text-xs font-black text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 inline-flex items-center gap-2">
                      <Gift size={14} /> Remise fidélité: −{Number(initRes.loyaltyDiscount).toLocaleString('fr-FR')} XAF
                    </p>
                  )}
                </div>

                {contactAgency && (
                  <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                    <p className="text-[10px] font-bold text-[#0528d6] uppercase tracking-widest">Contacter l&apos;agence</p>
                    <p className="font-bold text-lg">{contactAgency.name}</p>
                    {(contactAgency.address || contactAgency.city) && (
                      <p className="text-sm text-slate-600 flex items-start gap-2">
                        <MapPin size={16} className="shrink-0 mt-0.5 text-[#0528d6]" />
                        {[contactAgency.address, contactAgency.city].filter(Boolean).join(', ')}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {contactAgency.phone && (
                        <a
                          href={`tel:${contactAgency.phone}`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-[#0528d6] text-white rounded-xl text-sm font-semibold"
                        >
                          <Phone size={16} /> Appeler
                        </a>
                      )}
                      {contactAgency.email && (
                        <a
                          href={`mailto:${contactAgency.email}?subject=Réservation Easy Rental`}
                          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200"
                        >
                          <Mail size={16} /> Envoyer un email
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <p className="text-xs text-center text-slate-400">
                  Retrouvez le suivi dans <strong>Mes réservations</strong>.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 md:px-10 py-6 border-t bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            {phase === 'form' ? (
              <>
                <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500 hover:text-red-500">
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={loading}
                  className="py-3 px-8 bg-[#0528d6] text-white rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin size-4" /> : <><CheckCircle2 size={18} /> Réserver</>}
                </button>
              </>
            ) : (
              <button type="button" onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-2xl font-semibold text-sm">
                Fermer
              </button>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};
