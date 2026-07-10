/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useEffect, useState } from 'react';
import { X, User, Phone, Banknote, MapPin, Loader2, Clock, ShieldCheck, History, AlertTriangle, Car, CheckCircle2 } from 'lucide-react';
import { Portal } from '../../components/Portal';
import { rentalService, resolveMediaDisplayUrl } from '@pwa-easy-rental/shared-services';

export const RentalDetailsModal = ({ rentalId, onClose, onValidated, t }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadDetails = async () => {
      if (!rentalId) {
        setData(null);
        setHasError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setHasError(false);
      setData(null);

      try {
        const res = await rentalService.getRentalDetails(rentalId);
        if (ignore) return;

        if (res.ok && res.data?.rental) {
          setData(res.data);
        } else {
          setHasError(true);
        }
      } catch {
        if (!ignore) setHasError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      ignore = true;
    };
  }, [rentalId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400';
      case 'ONGOING': return 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
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
            <div className="mx-auto mb-5 size-14 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">{t.common?.error || 'Une erreur est survenue'}</h3>
            <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              {t.common?.noData || 'Aucune donnée disponible'}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-400 italic">
              {t.rentalDetails?.missingVehicleHint || 'Le véhicule lié à ce dossier a peut-être été supprimé de la flotte.'}
            </p>
            <button onClick={onClose} className="mt-6 px-6 py-3 rounded-2xl bg-[#0528d6] text-white text-xs font-black uppercase italic hover:bg-blue-700 transition-all">
              {t.common?.close || 'Fermer'}
            </button>
          </div>
        </div>
      </Portal>
    );
  }

  const { rental, vehicle, driver, agency } = data;
  const rentalRef = (rental.id || rentalId || '').substring(0, 8).toUpperCase();
  const vehicleImage = vehicle?.images?.[0] ? resolveMediaDisplayUrl(vehicle.images[0]) : null;
  const remainingAmount = (rental.totalAmount || 0) - (rental.amountPaid || 0);

  const handleValidateReturn = async () => {
    setValidating(true);
    try {
      const res = await rentalService.validateReturn(rentalId);
      if (res.ok) {
        onValidated?.();
        onClose();
      }
    } finally {
      setValidating(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4 text-left">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose} />
        <div className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-6 md:px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <div className="flex flex-wrap items-center gap-4 mb-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">{t.rentalDetails.title} #RT-{rentalRef}</h3>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusColor(rental.status)}`}>{rental.status}</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic flex items-center gap-2"><MapPin size={10} className="text-[#0528d6]"/> {agency?.name || '---'} - {agency?.city || '---'}</p>
            </div>
            <button onClick={onClose} className="size-12 bg-white dark:bg-slate-800 flex items-center justify-center rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={24}/></button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="p-7 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><User size={14}/> {t.rentalDetails.customer}</h4>
                    <DataRow label={t.rentalDetails.name} value={rental.clientName} />
                    <DataRow label={t.rentalDetails.contact} value={rental.clientPhone} icon={<Phone size={10}/>} />
                    <DataRow label="ID / CNI" value={rental.cniNumber || 'N/A'} mono />
                </section>

                <section className="p-7 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                    <h4 className="text-[11px] font-black uppercase text-[#0528d6] italic border-b dark:border-slate-800 pb-2 flex items-center gap-2"><Clock size={14}/> {t.rentalDetails.planning}</h4>
                    <DataRow label={t.rentalDetails.start} value={new Date(rental.startDate).toLocaleString()} />
                    <DataRow label={t.rentalDetails.end} value={new Date(rental.endDate).toLocaleString()} />
                    <DataRow label={t.rentalDetails.type} value={rental.rentalType} />
                </section>

                <section className="p-7 bg-[#0528d6] rounded-[2.5rem] text-white shadow-xl space-y-4 relative overflow-hidden">
                    <Banknote size={100} className="absolute -bottom-5 -right-5 opacity-10 rotate-12"/>
                    <h4 className="text-[11px] font-black uppercase italic border-b border-white/20 pb-2 flex items-center gap-2"><Banknote size={14}/> {t.rentalDetails.finances}</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold opacity-60 uppercase">{t.rentalDetails.totalAmount}</span><span className="text-xl font-black">{rental.totalAmount?.toLocaleString()} {t.common.currency}</span></div>
                        <div className="flex justify-between items-center"><span className="text-[10px] font-bold opacity-60 uppercase">{t.rentalDetails.paidAmount}</span><span className="text-xl font-black text-green-400">{rental.amountPaid?.toLocaleString()} {t.common.currency}</span></div>
	                        <div className="flex justify-between items-center pt-2 border-t border-white/10"><span className="text-[10px] font-bold opacity-60 uppercase">{t.rentalDetails.remainingAmount}</span><span className="text-xl font-black text-orange-400">{remainingAmount.toLocaleString()} {t.common.currency}</span></div>
                    </div>
                </section>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8 group text-center sm:text-left">
	                    <div className="size-28 rounded-[2.5rem] overflow-hidden shadow-lg shrink-0 border-2 border-white dark:border-slate-800 bg-slate-50">
	                        {vehicleImage ? <img src={vehicleImage} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500" alt=""/> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Car size={40}/></div>}
	                    </div>
	                    <div>
	                        <p className="text-[10px] font-black text-[#0528d6] uppercase tracking-widest italic mb-1">{t.rentalDetails.assignedVehicle}</p>
	                        <h4 className="text-2xl font-black italic uppercase text-slate-800 dark:text-white leading-none">
                          {vehicle ? `${vehicle.brand || '---'} ${vehicle.model || ''}`.trim() : (t.rentalDetails?.vehicleRemoved || 'Véhicule supprimé')}
                        </h4>
	                        <p className="mt-3 text-sm font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg inline-block uppercase">{vehicle?.licencePlate || '---'}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                    <div className="size-28 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-800 overflow-hidden shadow-sm">
                        {driver?.profilUrl ? <img src={driver.profilUrl} className="w-full h-full object-cover" alt=""/> : <User size={48} className="text-slate-300"/>}
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-[#0528d6] uppercase tracking-widest italic mb-1">{t.rentalDetails.driver}</p>
                        {driver ? (
                            <>
                                <h4 className="text-2xl font-black italic uppercase text-slate-800 dark:text-white leading-none">{driver.firstname} {driver.lastname}</h4>
                                <p className="mt-3 text-sm font-bold text-slate-400 italic flex items-center justify-center sm:justify-start gap-2"><Phone size={12}/> {driver.tel}</p>
                            </>
                        ) : <p className="text-sm font-black text-slate-500 uppercase italic">{t.rentalDetails.noDriver}</p>}
                    </div>
                </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="size-14 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400"><History size={32}/></div>
                    <div className="text-center md:text-left">
                        <p className="text-sm font-black uppercase italic tracking-widest leading-none">{t.rentalDetails.sysLog}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-2">{t.rentalDetails.openedOn} {new Date(rental.createdAt).toLocaleString()} • {t.rentalDetails.lastActivity} {new Date(rental.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {rental.status === 'UNDER_REVIEW' && (
                    <button
                      type="button"
                      onClick={handleValidateReturn}
                      disabled={validating}
                      className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase italic disabled:opacity-50"
                    >
                      {validating ? <Loader2 className="animate-spin size-4" /> : <CheckCircle2 size={16} />}
                      {t.rentals?.validateReturn || 'Valider retour'}
                    </button>
                  )}
                  <div className="flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl">
                    <ShieldCheck className="text-green-500" size={20}/>
                    <span className="text-[10px] font-black uppercase italic text-green-500 tracking-tighter">{t.rentalDetails.certified}</span>
                  </div>
                </div>
            </div>
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
