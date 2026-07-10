/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, CalendarRange, AlertTriangle, Clock, Banknote } from 'lucide-react';
import { Portal } from '../../components/Portal';

const formatPrice = (value: unknown) => {
  if (value === null || value === undefined || value === '') return '';
  return String(value);
};

const buildFormState = (vehicle: any) => {
  const status = vehicle?.statut || 'AVAILABLE';
  return {
    globalStatus: status,
    pricePerHour: formatPrice(vehicle?.pricing?.pricePerHour),
    pricePerDay: formatPrice(vehicle?.pricing?.pricePerDay),
    pricePerMonth: formatPrice(vehicle?.pricing?.pricePerMonth),
    addSchedule: status === 'MAINTENANCE',
    schedule: {
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      status: 'MAINTENANCE',
      reason: '',
    },
  };
};

export const QuickStatusModal = ({ vehicle, onSubmit, onClose, modalLoading, error, t }: any) => {
  const [formData, setFormData] = useState(() => buildFormState(vehicle));

  useEffect(() => {
    setFormData(buildFormState(vehicle));
  }, [vehicle]);

  const pricesValid =
    formData.pricePerHour.trim() !== '' &&
    formData.pricePerDay.trim() !== '' &&
    Number(formData.pricePerHour) > 0 &&
    Number(formData.pricePerDay) > 0;

  const isMaintenance = formData.globalStatus === 'MAINTENANCE';

  const scheduleDatesValid =
    formData.schedule.reason.trim() !== '' &&
    new Date(formData.schedule.endDate) > new Date(formData.schedule.startDate);

  const scheduleValid = isMaintenance
    ? scheduleDatesValid
    : !formData.addSchedule || scheduleDatesValid;

  const formValid = (isMaintenance || pricesValid) && scheduleValid;

  const handleStatusChange = (status: string) => {
    setFormData({
      ...formData,
      globalStatus: status,
      addSchedule: status === 'MAINTENANCE',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formValid) return;
    onSubmit(vehicle.id, {
      globalStatus: formData.globalStatus,
      pricePerHour: Number(formData.pricePerHour),
      pricePerDay: Number(formData.pricePerDay),
      pricePerMonth: formData.pricePerMonth.trim() ? Number(formData.pricePerMonth) : undefined,
      addSchedule: isMaintenance || formData.addSchedule,
      skipPricing: isMaintenance,
      schedule: formData.schedule,
    });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />

        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 animate-in zoom-in"
        >
          <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-[#0528d6] text-white">
            <div>
              <h3 className="text-xl font-black italic tracking-tighter">
                {t?.vehicles?.quickStatusTitle || 'Tarifs & statut'}
              </h3>
              <p className="text-[10px] opacity-70 font-bold italic">
                {vehicle.brand} {vehicle.model}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
              <X size={20} />
            </button>
          </div>

          <div className="p-10 space-y-8">
            {error && (
              <p className="text-xs font-bold text-red-500 italic text-center">{error}</p>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 italic tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} /> {t?.vehicles?.statusLabel || 'Disponibilité'}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['AVAILABLE', 'MAINTENANCE'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleStatusChange(s)}
                    className={`p-4 rounded-2xl border-2 font-black text-xs italic transition-all ${
                      formData.globalStatus === s
                        ? 'bg-[#0528d6] border-[#0528d6] text-white shadow-lg'
                        : 'bg-slate-50 border-slate-100 text-slate-400'
                    }`}
                  >
                    {s === 'AVAILABLE' ? 'DISPONIBLE' : 'MAINTENANCE'}
                  </button>
                ))}
              </div>
            </div>

            {!isMaintenance && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                  <Clock size={14} /> {t?.vehicles?.priceHour || 'Prix / Heure'} *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.pricePerHour}
                  onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-sm text-[#0528d6]"
                  placeholder="ex: 5000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                  <Banknote size={14} /> {t?.vehicles?.priceDay || 'Prix / Jour'} *
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({ ...formData, pricePerDay: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-sm text-[#0528d6]"
                  placeholder="ex: 35000"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 italic flex items-center gap-2">
                  <Banknote size={14} /> {t?.vehicles?.priceMonth || 'Prix / Mois'}
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={formData.pricePerMonth}
                  onChange={(e) => setFormData({ ...formData, pricePerMonth: e.target.value })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-black text-sm text-[#0528d6]"
                  placeholder="ex: 450000"
                />
              </div>
            </div>
            )}

            {isMaintenance && (
              <p className="text-[10px] font-bold text-slate-400 italic text-center">
                Les tarifs enregistrés sont conservés — le véhicule n&apos;est pas louable pendant la maintenance.
              </p>
            )}

            <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
              {isMaintenance ? (
                <>
                  <label className="text-[10px] font-black text-orange-600 italic tracking-widest flex items-center gap-2">
                    <CalendarRange size={16} />{' '}
                    {t?.vehicles?.maintenanceDurationRequired || 'Durée de maintenance (obligatoire)'} *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 ml-1 italic">
                        {t?.vehicles?.startDate || 'Date de début'}
                      </span>
                      <input
                        type="datetime-local"
                        required
                        value={formData.schedule.startDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, startDate: e.target.value },
                          })
                        }
                        className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[8px] font-black text-slate-400 ml-1 italic">
                        {t?.vehicles?.endDate || 'Date de fin'}
                      </span>
                      <input
                        type="datetime-local"
                        required
                        value={formData.schedule.endDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, endDate: e.target.value },
                          })
                        }
                        className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                      />
                    </div>
                  </div>
                  <input
                    required
                    placeholder={t?.vehicles?.scheduleReason || 'Motif (ex: Révision, carrosserie...)'}
                    value={formData.schedule.reason}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        schedule: { ...formData.schedule, reason: e.target.value },
                      })
                    }
                    className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </>
              ) : (
                <>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.addSchedule}
                      onChange={(e) => setFormData({ ...formData, addSchedule: e.target.checked })}
                      className="size-5 rounded border-slate-300 text-[#0528d6] focus:ring-[#0528d6]"
                    />
                    <span className="text-[10px] font-black text-[#0528d6] italic tracking-widest flex items-center gap-2">
                      <CalendarRange size={16} /> {t?.vehicles?.planUnavailability || 'Planifier une indisponibilité'}
                    </span>
                  </label>
                  {formData.addSchedule && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 ml-1 italic">
                            {t?.vehicles?.startDate || 'Date de début'}
                          </span>
                          <input
                            type="datetime-local"
                            value={formData.schedule.startDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                schedule: { ...formData.schedule, startDate: e.target.value },
                              })
                            }
                            className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black text-slate-400 ml-1 italic">
                            {t?.vehicles?.endDate || 'Date de fin'}
                          </span>
                          <input
                            type="datetime-local"
                            value={formData.schedule.endDate}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                schedule: { ...formData.schedule, endDate: e.target.value },
                              })
                            }
                            className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                          />
                        </div>
                      </div>
                      <input
                        placeholder={t?.vehicles?.scheduleReason || 'Raison technique...'}
                        value={formData.schedule.reason}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            schedule: { ...formData.schedule, reason: e.target.value },
                          })
                        }
                        className="w-full p-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold"
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-slate-400 italic">
              {t?.common?.cancel || 'Annuler'}
            </button>
            <button
              disabled={modalLoading || !formValid}
              className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic disabled:opacity-50"
            >
              {modalLoading ? (
                <Loader2 className="animate-spin size-4" />
              ) : (
                t?.vehicles?.applyConfig || 'Enregistrer'
              )}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};
