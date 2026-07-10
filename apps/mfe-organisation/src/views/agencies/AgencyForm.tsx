/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Clock, Globe, MapPin, Phone, Mail, Percent, Crosshair } from 'lucide-react';
import { Portal } from '@/components/Portal';
import { LogoUpload } from '@/components/LogoUpload';
import { CM_PHONE_HINT, isValidCmMobile, normalizeCmPhone } from '@pwa-easy-rental/shared-services';

export const AgencyForm = ({ editingAgency, initialData, onSubmit, onClose, modalLoading, formError, t }: any) => {
  const [formData, setFormData] = useState(initialData);
  const [startHour, setStartHour] = useState('08:00');
  const [endHour, setEndHour] = useState('18:00');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      ...initialData,
      phone: normalizeCmPhone(String(initialData?.phone ?? '')),
    });
    if (initialData.workingHours && initialData.workingHours.includes('-')) {
      const [start, end] = initialData.workingHours.split('-');
      setStartHour(start);
      setEndHour(end);
    }
  }, [initialData]);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phone = normalizeCmPhone(formData.phone ?? '');
    if (!isValidCmMobile(phone)) {
      setPhoneError(t.agencies?.modal?.phoneInvalid ?? CM_PHONE_HINT);
      return;
    }
    setPhoneError(null);
    const finalWorkingHours = formData.is24Hours ? '00:00-23:59' : `${startHour}-${endHour}`;
    onSubmit({ ...formData, phone, workingHours: finalWorkingHours });
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
        
        <form onSubmit={handleLocalSubmit} className="relative w-full max-w-4xl bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] md:max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div className="text-left">
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none">
                {editingAgency ? t.agencies.modal.titleEdit : t.agencies.modal.titleAdd}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1.5 italic">{t.sidebar.systemSubtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={22}/></button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10 text-left">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
                <div className="lg:col-span-1">
                    <LogoUpload value={formData.logoUrl} onUploadSuccess={(url) => setFormData({ ...formData, logoUrl: url })} t={t} />
                </div>
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                    <FormInput label={t.agencies.modal.name} value={formData.name} onChange={(v: any) => setFormData({...formData, name: v})} required placeholder={t.agencies.modal.namePlaceholder} />
                    <FormInput label={t.agencies.modal.city} value={formData.city} onChange={(v: any) => setFormData({...formData, city: v})} required placeholder={t.agencies.modal.cityPlaceholder} />
                    <FormInput label={t.agencies.modal.email} type="email" value={formData.email} onChange={(v: any) => setFormData({...formData, email: v})} required icon={<Mail size={14}/>} />
                    <FormInput
                      label={t.agencies.modal.phone}
                      value={formData.phone}
                      onChange={(v: string) => {
                        setPhoneError(null);
                        setFormData({ ...formData, phone: normalizeCmPhone(v) });
                      }}
                      required
                      icon={<Phone size={14} />}
                      inputMode="numeric"
                      maxLength={9}
                      placeholder="678123456"
                      hint={t.agencies?.modal?.phoneHint ?? CM_PHONE_HINT}
                      error={phoneError}
                    />
                </div>
            </div>

            <section className="space-y-6">
                <h4 className="text-[10px] font-black text-[#0528d6] dark:text-blue-400 uppercase italic border-b dark:border-slate-800 pb-2 flex items-center gap-2 tracking-widest"><Globe size={14}/> {t.onboarding.step2Title}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <FormInput label={t.agencies.modal.address} value={formData.address} onChange={(v: any) => setFormData({...formData, address: v})} required icon={<MapPin size={14}/>} placeholder={t.agencies.modal.addressPlaceholder} />
                    </div>
                    <FormInput label={t.agencies.modal.deposit} type="number" value={formData.depositPercentage} onChange={(v: any) => setFormData({...formData, depositPercentage: v})} icon={<Percent size={14}/>} />
                    <FormInput label="Rayon Geofencing (KM)" type="number" value={formData.geofenceRadius} onChange={(v: any) => setFormData({...formData, geofenceRadius: v})} icon={<Crosshair size={14}/>} />
                </div>
            </section>

            <section className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-6 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h4 className="text-[10px] font-black text-slate-800 dark:text-white uppercase italic flex items-center gap-2 tracking-widest"><Clock size={16}/> {t.sidebar.status}</h4>
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.is24Hours} onChange={e => setFormData({...formData, is24Hours: e.target.checked})} className="size-5 rounded-lg border-slate-300 text-[#0528d6] focus:ring-[#0528d6]" />
                        <span className="text-[10px] font-black uppercase text-slate-500 group-hover:text-[#0528d6] transition-colors italic">{t.agencies.modal.hours24}</span>
                    </label>
                </div>
                <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-500 ${formData.is24Hours ? 'opacity-20 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <FormInput label="Heure d'ouverture" type="time" value={startHour} onChange={(v:any) => setStartHour(v)} />
                    <FormInput label="Heure de fermeture" type="time" value={endHour} onChange={(v:any) => setEndHour(v)} />
                </div>
            </section>
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-4">
            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
                {formError}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase italic hover:text-red-500 transition-colors">{t.agencies.modal.cancel}</button>
            <button disabled={modalLoading} className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest">
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : t.agencies.modal.submit}
            </button>
            </div>
          </div>
        </form>
      </div>
    </Portal>
  );
};

const FormInput = ({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  icon,
  placeholder,
  maxLength,
  inputMode,
  hint,
  error,
}: any) => {
  const isEmail = type === 'email';
  return (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase italic ml-1 tracking-widest">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors">{icon}</div>}
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${icon ? 'pl-11' : 'px-4'} p-3.5 bg-slate-50 dark:bg-slate-900 border-2 rounded-2xl font-bold text-sm outline-none dark:text-white transition-all shadow-inner ${
          error ? 'border-red-300 focus:border-red-500' : 'border-slate-100 dark:border-slate-800 focus:border-[#0528d6]'
        } ${isEmail ? 'normal-case' : 'italic uppercase'}`}
      />
    </div>
    {hint && !error && (
      <p className="text-[9px] font-bold text-slate-400 italic ml-1">{hint}</p>
    )}
    {error && (
      <p className="text-[9px] font-bold text-red-500 italic ml-1">{error}</p>
    )}
  </div>
  );
};