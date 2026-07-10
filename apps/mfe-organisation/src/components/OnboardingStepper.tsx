/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { 
  Loader2, ArrowRight, CheckCircle2, Building2, MapPin, 
  ShieldCheck, Globe, ChevronLeft, Sparkles, AlignLeft,
  Mail, Phone, Clock, Hash, LogOut
} from 'lucide-react';
import { orgService } from '@pwa-easy-rental/shared-services';
import { StepperInput } from './StepperInput';
import { StepperArea } from './StepperArea';
import { LogoUpload } from './LogoUpload';

export const OnboardingStepper = ({ orgId, initialName, initialOrg, onComplete, onLogout, t }: any) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: initialOrg?.name || initialName || '',
    description: initialOrg?.description || '',
    address: initialOrg?.address || '',
    city: initialOrg?.city || '',
    postalCode: initialOrg?.postalCode || '',
    region: initialOrg?.region || '',
    phone: initialOrg?.phone || '',
    email: initialOrg?.email || '',
    website: initialOrg?.website || '',
    timezone: initialOrg?.timezone || 'Africa/Douala',
    logoUrl: initialOrg?.logoUrl || '',
    registrationNumber: initialOrg?.registrationNumber || '',
    taxNumber: initialOrg?.taxNumber || '',
    isDriverBookingRequired: Boolean(initialOrg?.isDriverBookingRequired),
  });

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const isStepValid = () => {
    const isFull = (v: string) => v && v.trim() !== '' && v !== 'string';
    if (step === 1) return isFull(formData.name) && isFull(formData.description) && isFull(formData.website);
    if (step === 2) return isFull(formData.city) && isFull(formData.region) && isFull(formData.address) && isFull(formData.phone) && isFull(formData.email);
    if (step === 3) return isFull(formData.registrationNumber) && isFull(formData.taxNumber) && isFull(formData.postalCode);
    return false;
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = orgId
        ? await orgService.updateOrg(orgId, { ...formData })
        : await orgService.completeOnboarding({ ...formData });
      if (res.ok) {
        onComplete();
        return;
      }
      const apiMessage = (res.data as { message?: string })?.message;
      const normalizedMessage = apiMessage?.includes('KERNEL_TIMEOUT')
        ? 'Connexion au kernel trop lente. Réessayez dans quelques secondes ou reconnectez-vous.'
        : apiMessage;
      setError(normalizedMessage || 'Impossible de finaliser l\'onboarding. Vérifiez vos informations.');
    } catch {
      setError('Erreur réseau ou serveur indisponible.');
    } finally {
      setLoading(false);
    }
  };

  const stepsInfo = [
    { title: t.onboarding.step1Title, icon: <Building2 size={20}/> },
    { title: t.onboarding.step2Title, icon: <Globe size={20}/> },
    { title: t.onboarding.step3Title, icon: <ShieldCheck size={20}/> }
  ];

  return (
    <div className="max-w-5xl w-full flex flex-col items-center animate-in fade-in duration-700 px-2">
      <div className="w-full mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#0528d6] rounded-full text-[10px] font-black uppercase tracking-widest border dark:border-blue-900/30 mb-4 italic">
          <Sparkles size={14} /> {t.onboarding.step} {step} {t.onboarding.of} 3
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">{t.onboarding.mainTitle} <span className="text-[#0528d6]">{t.onboarding.accentTitle}</span></h1>
      </div>

      <div className="w-full bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl border border-white dark:border-slate-800 overflow-hidden grid lg:grid-cols-12 min-h-[600px]">
        {/* Progress Sidebar */}
        <div className="lg:col-span-4 bg-slate-50 dark:bg-[#080b14] border-r dark:border-slate-800 p-8 flex flex-col">
            <div className="flex flex-col gap-8">
                {stepsInfo.map((info, i) => (
                    <div key={i} className={`flex items-center gap-4 transition-all duration-500 ${step === i+1 ? 'translate-x-2' : 'opacity-30'}`}>
                        <div className={`size-12 rounded-2xl flex items-center justify-center shadow-lg transition-all ${step === i+1 ? 'bg-[#0528d6] text-white scale-110 shadow-blue-600/20' : step > i+1 ? 'bg-green-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                            {step > i+1 ? <CheckCircle2 size={24} /> : info.icon}
                        </div>
                        <div className="flex flex-col text-left leading-none">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest italic mb-1">Phase 0{i+1}</span>
                            <span className="text-sm font-black uppercase italic text-slate-900 dark:text-white">{info.title}</span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-auto pt-8 border-t dark:border-slate-800">
               <button onClick={onLogout} className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all font-black text-[10px] uppercase italic tracking-widest">
                 <LogOut size={16} /> {t.sidebar.logout}
               </button>
            </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 p-6 md:p-12 flex flex-col text-left">
            <div className="flex-1">
                {step === 1 && (
                  <div className="space-y-6 animate-in slide-in-from-right-4">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter">{t.onboarding.form.who}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <LogoUpload value={formData.logoUrl} onUploadSuccess={(url) => setFormData({ ...formData, logoUrl: url })} t={t} />
                          <div className="md:col-span-2 space-y-6">
                              <StepperInput label={t.onboarding.form.orgName} name="name" value={formData.name} onChange={handleChange} icon={Building2} />
                              <StepperInput label={t.onboarding.form.website} name="website" placeholder="https://..." value={formData.website} onChange={handleChange} icon={Globe} />
                          </div>
                      </div>
                      <StepperArea label={t.onboarding.form.vision} name="description" value={formData.description} onChange={handleChange} icon={AlignLeft} />
                  </div>
                )}

                {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter">{t.onboarding.form.where}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <StepperInput label={t.onboarding.form.city} name="city" value={formData.city} onChange={handleChange} />
                        <StepperInput label={t.onboarding.form.region} name="region" value={formData.region} onChange={handleChange} />
                    </div>
                    <StepperInput label={t.onboarding.form.address} name="address" value={formData.address} onChange={handleChange} icon={MapPin} />
                    <div className="grid grid-cols-2 gap-4">
                        <StepperInput
                          label={t.onboarding.form.phone}
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          icon={Phone}
                          placeholder="678123456"
                          pattern="^[0-9]{9}$"
                          title="Exactement 9 chiffres (ex: 678123456)"
                          inputMode="numeric"
                          maxLength={9}
                        />
                        <StepperInput label={t.onboarding.form.email} name="email" type="email" value={formData.email} onChange={handleChange} icon={Mail} />
                    </div>
                </div>
                )}

                {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase italic tracking-tighter">{t.onboarding.form.legal}</h2>
                    <StepperInput
                      label={t.onboarding.form.rccm}
                      name="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={handleChange}
                      icon={Hash}
                      placeholder="RC/DLA/2020/B/1234"
                      pattern="^RC/[A-Z]{2,3}/[0-9]{4}/[A-Z]/[0-9]+$"
                      title="Format RCCM : RC/DLA/2020/B/1234"
                    />
                    <StepperInput
                      label={t.onboarding.form.niu}
                      name="taxNumber"
                      value={formData.taxNumber}
                      onChange={handleChange}
                      icon={ShieldCheck}
                      placeholder="M000123456789A"
                      pattern="^[MP][0-9]{12}[A-Z]$"
                      title="Format NIU : M ou P + 12 chiffres + 1 lettre (ex: M000123456789A)"
                      maxLength={14}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <StepperInput label={t.onboarding.form.timezone} name="timezone" value={formData.timezone} onChange={handleChange} icon={Clock} />
                        <StepperInput label={t.onboarding.form.zip} name="postalCode" value={formData.postalCode} onChange={handleChange} />
                    </div>
                </div>
                )}
            </div>

            <div className="mt-8 flex flex-col gap-4 pt-8 border-t dark:border-slate-800">
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl">
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-between">
                {step > 1 ? (
                <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-slate-400 font-black uppercase text-[10px] hover:text-[#0528d6] transition-all italic tracking-widest"><ChevronLeft size={16} /> {t.onboarding.btns.prev}</button>
                ) : <div />}
                <button onClick={step < 3 ? () => setStep(step + 1) : handleFinalSubmit} disabled={loading || !isStepValid()} className={`px-10 py-4 ${step < 3 ? 'bg-[#0528d6]' : 'bg-green-600'} text-white rounded-2xl font-black uppercase text-xs shadow-xl flex items-center gap-3 transition-all hover:scale-[1.02] disabled:opacity-30 italic tracking-widest`}>
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <>{step < 3 ? t.onboarding.btns.next : t.onboarding.btns.finish} <ArrowRight size={18} /></>}
                </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};