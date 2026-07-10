/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Calendar, ShieldCheck, Zap, CreditCard, Loader2, CheckCircle2, User, Car, ArrowRight, Star } from 'lucide-react';
import { driverService, vehicleService } from '@pwa-easy-rental/shared-services';

export const BookingView = ({ vehicleId, onBack, onSuccess }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [dates, setDates] = useState({ start: '', end: '' });
  
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      const res = await vehicleService.getVehicleDetails(vehicleId);
      if (res.ok) setData(res.data);
      setLoading(false);
    };
    fetchInfo();
  }, [vehicleId]);

  useEffect(() => {
    if (step === 2 && data?.vehicle?.agencyId && dates.start && dates.end) {
      const fetchDrivers = async () => {
        setLoadingDrivers(true);
        try {
          const res = await (driverService as any).getAvailableDrivers(
            data.vehicle.agencyId, 
            new Date(dates.start).toISOString(), 
            new Date(dates.end).toISOString()
          );
          if (res.ok) setAvailableDrivers(res.data || []);
        } finally {
          setLoadingDrivers(false);
        }
      };
      fetchDrivers();
    }
  }, [step, data?.vehicle?.agencyId, dates]);

  const pricing = useMemo(() => {
    if (!data?.pricing || !dates.start || !dates.end) return { days: 0, vehicleTotal: 0, driverTotal: 0, total: 0 };
    
    const diff = new Date(dates.end).getTime() - new Date(dates.start).getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    
    const vehicleTotal = days > 0 ? days * data.pricing.pricePerDay : 0;
    const driverTotal = (days > 0 && selectedDriver?.pricing?.pricePerDay) ? days * selectedDriver.pricing.pricePerDay : 0;
    
    return { 
      days: days > 0 ? days : 0, 
      vehicleTotal, 
      driverTotal,
      total: vehicleTotal + driverTotal 
    };
  }, [data, dates, selectedDriver]);

  const handleFinalConfirm = async () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep(4);
    }, 2000);
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#f4f7fe] dark:bg-[#0f1323]">
      <Loader2 className="animate-spin text-[#0528d6]" size={48} />
    </div>
  );

  const v = data.vehicle;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-20 px-6 text-left">
      
      <div className="sticky top-20 z-[40] -mx-6 px-6 py-5 bg-[#f4f7fe]/95 dark:bg-[#0f1323]/95 backdrop-blur-md mb-10 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={step === 4 ? onSuccess : step > 1 ? () => setStep(step - 1) : onBack} 
          className="flex items-center gap-2 text-[10px] font-bold text-slate-400  hover:text-[#0528d6] transition-all italic"
        >
          <ArrowLeft size={14} /> {step === 4 ? "Terminer" : step > 1 ? "Étape précédente" : "Annuler"}
        </button>
        <div className="flex gap-2">
           {[1, 2, 3].map(i => (
             <div key={i} className={`h-1 w-8 rounded-full transition-all ${step >= i ? 'bg-[#0528d6]' : 'bg-slate-200 dark:bg-slate-800'}`} />
           ))}
        </div>
      </div>

      <div className="mt-24">
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter  text-slate-900 dark:text-white leading-none">Période de location</h2>
              <p className="text-slate-400 text-[10px] font-bold  tracking-widest italic">Étape 01 : Dates et véhicule</p>
            </div>
            
            <div className="grid lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                      <div className="size-24 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
                        {v.images?.[0] ? <img src={v.images[0]} className="w-full h-full object-contain" /> : <Car size={32} className="text-slate-200" />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white  italic leading-none">{v.brand} {v.model}</h3>
                        <p className="text-[10px] font-bold text-slate-400  mt-2 italic">{data.pricing?.pricePerDay?.toLocaleString()} XAF / jour</p>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-[#1a1d2d] p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    <h4 className="text-[10px] font-black  text-[#0528d6] italic tracking-widest flex items-center gap-2"><Calendar size={14}/> Dates souhaitées</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-400  ml-1 italic">Date de début</label>
                          <input type="date" value={dates.start} onChange={e => setDates({...dates, start: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-[#0528d6] dark:text-white" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-400  ml-1 italic">Date de fin</label>
                          <input type="date" value={dates.end} onChange={e => setDates({...dates, end: e.target.value})} className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold outline-none focus:border-[#0528d6] dark:text-white" />
                        </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                   <div className="bg-[#0528d6] text-white p-8 rounded-[2.5rem] shadow-xl space-y-6 relative overflow-hidden h-full flex flex-col justify-center">
                      <ShieldCheck className="absolute -bottom-6 -right-6 opacity-10" size={150} />
                      <h4 className="text-[10px] font-bold  tracking-[0.2em] opacity-60">Estimation temporaire</h4>
                      <div className="space-y-4 relative z-10">
                          <div className="flex justify-between text-sm font-bold italic opacity-80"><span>Durée</span><span>{pricing.days} jours</span></div>
                          <div className="flex justify-between text-sm font-bold italic opacity-80"><span>Véhicule</span><span>{pricing.vehicleTotal.toLocaleString()} XAF</span></div>
                          <div className="pt-6 mt-4 border-t border-white/10 flex justify-between items-end">
                            <div className="flex flex-col">
                              <span className="text-[9px]  opacity-60 leading-none mb-1">Total à ce stade</span>
                              <span className="text-3xl font-black italic tracking-tighter">{pricing.vehicleTotal.toLocaleString()} XAF</span>
                            </div>
                            <Zap size={24} className="text-orange-400" />
                          </div>
                      </div>
                   </div>
                </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={pricing.days <= 0}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black  italic shadow-2xl hover:bg-[#0528d6] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-30"
            >
              Étape suivante : Service Chauffeur <ArrowRight size={18}/>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter  text-slate-900 dark:text-white leading-none">Service Chauffeur</h2>
              <p className="text-slate-400 text-[10px] font-bold  tracking-widest italic">Étape 02 : Assistance et conduite</p>
            </div>

            {loadingDrivers ? (
              <div className="py-20 flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-[#0528d6]" size={40} />
                <p className="text-[10px] font-black  text-slate-400 italic">Vérification des disponibilités...</p>
              </div>
            ) : (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div 
                    onClick={() => setSelectedDriver(null)}
                    className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-4 ${!selectedDriver ? 'bg-blue-50 border-[#0528d6] dark:bg-blue-900/20' : 'bg-white dark:bg-[#1a1d2d] border-slate-100 dark:border-slate-800'}`}
                  >
                    <div className="size-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300"><User size={32}/></div>
                    <div className="text-center">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Sans chauffeur</p>
                      <p className="text-[10px] text-slate-400  font-black italic mt-1">Conduite autonome</p>
                    </div>
                  </div>

                  {availableDrivers.map(driver => (
                    <div 
                      key={driver.id}
                      onClick={() => setSelectedDriver(driver)}
                      className={`group cursor-pointer p-6 rounded-[2rem] border-2 transition-all flex items-start gap-4 text-left ${selectedDriver?.id === driver.id ? 'bg-blue-50 border-[#0528d6] dark:bg-blue-900/20' : 'bg-white dark:bg-[#1a1d2d] border-slate-100 dark:border-slate-800'}`}
                    >
                      <div className="size-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                        {driver.profilUrl ? <img src={driver.profilUrl} className="w-full h-full object-cover" /> : <User size={24} className="m-auto mt-4 text-slate-300"/>}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm  italic">{driver.firstname}</h4>
                          <div className="flex items-center gap-1 text-orange-500 font-black text-[10px] bg-white px-1.5 py-0.5 rounded-md shadow-sm"><Star size={10} fill="currentColor"/> 5.0</div>
                        </div>
                        <p className="text-[10px] font-bold text-[#0528d6]  italic mt-1">+{driver.pricing?.pricePerDay?.toLocaleString()} XAF / jour</p>
                        <div className="mt-3 px-3 py-1 bg-green-50 text-green-600 text-[8px] font-black  rounded-lg w-fit">Disponible</div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black  italic shadow-2xl hover:bg-[#0528d6] hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  Continuer vers le règlement <ArrowRight size={18}/>
                </button>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 max-w-xl mx-auto text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-black italic tracking-tighter  text-slate-900 dark:text-white leading-none">Sécurisation</h2>
              <p className="text-slate-400 text-[10px] font-bold  tracking-widest italic">Étape 03 : Confirmation finale</p>
            </div>

            <div className="bg-white dark:bg-[#1a1d2d] p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-8 text-left">
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 border-2 border-[#0528d6] rounded-3xl">
                      <div className="flex items-center gap-4"><div className="size-12 bg-[#F76513] rounded-2xl flex items-center justify-center font-black text-white italic text-[10px]">MoMo</div><span className="text-sm font-black  italic">Mobile Money</span></div>
                      <div className="size-6 rounded-full bg-[#0528d6] flex items-center justify-center shadow-lg"><CheckCircle2 size={14} className="text-white" strokeWidth={3}/></div>
                   </div>
                   <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent rounded-3xl opacity-30 grayscale cursor-not-allowed">
                      <div className="flex items-center gap-4"><CreditCard size={24}/><span className="text-sm font-black  italic">Carte de Crédit</span></div>
                   </div>
                </div>

                <div className="bg-[#0528d6] p-8 rounded-[2rem] text-white space-y-4">
                   <p className="text-[10px] font-bold  tracking-widest opacity-60 italic">Récapitulatif final financier</p>
                   <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold opacity-80 italic"><span>Location ({pricing.days}j)</span><span>{pricing.vehicleTotal.toLocaleString()} XAF</span></div>
                      {selectedDriver && <div className="flex justify-between text-xs font-bold opacity-80 italic"><span>Chauffeur</span><span>{pricing.driverTotal.toLocaleString()} XAF</span></div>}
                      <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                         <span className="text-sm font-black  italic tracking-tighter">Montant total</span>
                         <span className="text-2xl font-black italic">{pricing.total.toLocaleString()} XAF</span>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={handleFinalConfirm}
                  disabled={submitting}
                  className="w-full py-5 bg-[#0528d6] text-white rounded-[2rem] font-black  italic shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="animate-spin" size={24}/> : "Confirmer et Payer"}
                </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="py-20 text-center space-y-10 animate-in zoom-in">
            <div className="size-32 bg-green-50 rounded-[3rem] flex items-center justify-center mx-auto text-green-500 shadow-inner border-2 border-green-100 relative">
              <div className="absolute inset-0 bg-green-400/20 rounded-[3rem] animate-ping" />
              <CheckCircle2 size={64} strokeWidth={3} className="relative z-10" />
            </div>
            <div className="space-y-3">
                <h2 className="text-4xl font-black italic tracking-tighter  text-slate-900 dark:text-white leading-none">Demande validée</h2>
                <p className="text-slate-400 text-sm font-medium max-w-sm mx-auto italic leading-relaxed">
                  L&apos;agence a reçu votre demande de réservation. Un agent de liaison vous contactera sur votre numéro enregistré pour les étapes finales.
                </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto pt-6">
                <button onClick={onSuccess} className="flex-1 py-4 bg-[#0528d6] text-white rounded-2xl font-black  italic shadow-xl shadow-blue-600/20 hover:scale-105 transition-all">Suivre mes contrats</button>
                <button onClick={onBack} className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 rounded-2xl font-black  italic text-xs">Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};