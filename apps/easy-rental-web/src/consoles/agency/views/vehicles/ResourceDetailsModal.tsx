/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { driverService, vehicleService } from '@pwa-easy-rental/shared-services';
import { VehicleDetailsBody } from '@pwa-easy-rental/shared-ui';
import { X, Loader2, DollarSign, Calendar, Clock, MessageSquare, Star } from 'lucide-react';
import { formatScheduleDate } from '@pwa-easy-rental/shared-services';
import { Portal } from '../../components/Portal';

interface ResourceDetailsModalProps {
  resourceId: string;
  type: 'VEHICLE' | 'DRIVER';
  onClose: () => void;
  t: any;
}

export const ResourceDetailsModal = ({ resourceId, type, onClose, t }: ResourceDetailsModalProps) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      const res =
        type === 'VEHICLE'
          ? await vehicleService.getVehicleDetails(resourceId)
          : await driverService.getDriverDetails(resourceId);

      if (res.ok) setDetails(res.data);
      setLoading(false);
    };
    fetchDetails();
  }, [resourceId, type]);

  if (loading) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md">
          <Loader2 className="animate-spin text-white size-12" />
        </div>
      </Portal>
    );
  }

  if (!details) {
    return (
      <Portal>
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-3xl text-center">
            <p className="text-sm font-bold text-red-500 italic">Impossible de charger les détails.</p>
            <button type="button" onClick={onClose} className="mt-4 text-xs font-black text-slate-400 uppercase">
              Fermer
            </button>
          </div>
        </div>
      </Portal>
    );
  }

  const titleName =
    type === 'VEHICLE'
      ? `${details.vehicle?.brand ?? ''} ${details.vehicle?.model ?? ''}`.trim()
      : `${details.driver?.firstname ?? ''} ${details.driver?.lastname ?? ''}`.trim();

  const formatPrice = (value: unknown) => {
    if (value === null || value === undefined || value === '') return '—';
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : '—';
  };

  const driverPricing = details?.pricing ?? details?.driver?.pricing;

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />

        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">
          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {type === 'VEHICLE' ? t.resDetails?.title ?? 'Fiche véhicule' : t.resDetails?.title}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">{titleName}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar">
            {type === 'VEHICLE' ? (
              <VehicleDetailsBody details={details} t={t} />
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{t.resDetails.globalRating}</p>
                    <div className="flex items-center justify-center gap-1.5 text-orange-500">
                      <Star size={16} fill="currentColor" />
                      <span className="text-xl font-black italic">{details.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{t.resDetails.customerReviews}</p>
                    <div className="flex items-center justify-center gap-1.5 text-[#0528d6]">
                      <MessageSquare size={16} />
                      <span className="text-xl font-black italic">{details.reviews?.length || 0}</span>
                    </div>
                  </div>
                </div>
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-800 pb-2">
                    <DollarSign className="text-[#0528d6]" size={18} />
                    <h5 className="text-sm font-black uppercase tracking-tighter italic">{t.driverStatus.pricingSection}</h5>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{t.driverStatus.pricePerHour}</p>
                      <p className="text-lg font-black text-[#0528d6] italic">{formatPrice(driverPricing?.pricePerHour)} XAF</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{t.driverStatus.pricePerDay}</p>
                      <p className="text-lg font-black text-[#0528d6] italic">{formatPrice(driverPricing?.pricePerDay)} XAF</p>
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase mb-1 italic">{t.driverStatus.pricePerMonth}</p>
                      <p className="text-lg font-black text-[#0528d6] italic">{formatPrice(driverPricing?.pricePerMonth)} XAF</p>
                    </div>
                  </div>
                </section>
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-800 pb-2">
                    <Calendar className="text-[#0528d6]" size={18} />
                    <h5 className="text-sm font-black uppercase tracking-tighter italic">{t.resDetails.unavailablePlanning}</h5>
                  </div>
                  <div className="space-y-3">
                    {details.schedule?.length > 0 ? (
                      details.schedule.map((s: any) => (
                        <div key={s.id} className="p-5 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-3xl flex justify-between items-center">
                          <div className="flex items-start gap-4">
                            <div className="size-10 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center text-orange-600 shrink-0">
                              <Clock size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-700 dark:text-white uppercase italic">{s.reason || t.resDetails.unavailableLabel}</p>
                              <p className="text-[10px] text-slate-400 font-bold mt-0.5 italic">
                                {formatScheduleDate(s.startDate)} — {formatScheduleDate(s.endDate)}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 text-[8px] font-black uppercase rounded-lg">{s.status}</span>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                        <Calendar className="size-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-xs text-slate-400 italic font-bold uppercase tracking-widest">{t.resDetails.noSchedule}</p>
                      </div>
                    )}
                  </div>
                </section>
                <section>
                  <div className="flex items-center gap-3 mb-6 border-b dark:border-slate-800 pb-2">
                    <MessageSquare className="text-[#0528d6]" size={18} />
                    <h5 className="text-sm font-black uppercase tracking-tighter italic">{t.resDetails.latestReviews}</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.reviews?.length > 0 ? (
                      details.reviews.map((r: any) => (
                        <div key={r.id} className="p-6 bg-slate-50 dark:bg-slate-900/30 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-[10px] font-black uppercase italic text-[#0528d6]">{r.authorName}</span>
                            <div className="flex text-orange-500">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={10} fill={i < r.rating ? 'currentColor' : 'none'} className={i < r.rating ? '' : 'text-slate-200'} />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-3">&quot;{r.comment}&quot;</p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-8 text-center text-slate-400 text-xs italic font-bold uppercase tracking-widest">{t.resDetails.emptyReviews}</div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all italic tracking-widest"
            >
              {t.resDetails.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};
