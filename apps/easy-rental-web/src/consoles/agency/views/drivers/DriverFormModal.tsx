/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useMemo, useState } from 'react';
import { X, Loader2, User, Phone, Shield, FileText, DollarSign, Camera, Upload } from 'lucide-react';
import { normalizeCmPhone, isValidCmMobile } from '@pwa-easy-rental/shared-services';
import { DocumentUploadZone } from '@pwa-easy-rental/shared-ui';
import { Portal } from '../../components/Portal';

export const DriverFormModal = ({ editingDriver, onSubmit, onClose, modalLoading, error, t }: any) => {
  const isEdit = Boolean(editingDriver);

  const [form, setForm] = useState({
    firstname: editingDriver?.firstname || '',
    lastname: editingDriver?.lastname || '',
    tel: editingDriver?.tel || '',
    age: editingDriver?.age || '',
    gender: editingDriver?.gender ?? 0,
    cniNumber: editingDriver?.cniNumber || '',
    licenseNumber: editingDriver?.licenseNumber || '',
    licenseExpiry: editingDriver?.licenseExpiry || '',
    yearsExperience: editingDriver?.yearsExperience || '',
    pricePerHour: editingDriver?.pricing?.pricePerHour || '',
    pricePerDay: editingDriver?.pricing?.pricePerDay || '',
    pricePerMonth: editingDriver?.pricing?.pricePerMonth || '',
  });

  const [files, setFiles] = useState({
    profil: null as File | null,
    cni: null as File | null,
    license: null as File | null,
  });

  const profilPreviewUrl = useMemo(() => {
    if (files.profil) return URL.createObjectURL(files.profil);
    return editingDriver?.profilUrl || '';
  }, [files.profil, editingDriver?.profilUrl]);

  const phoneValid = !form.tel || isValidCmMobile(form.tel);

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneValid) return;
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      // En édition on n'envoie que les champs de prix modifiés (backend ignore pricing ici, endpoint dédié)
      if (isEdit && (k === 'pricePerHour' || k === 'pricePerDay' || k === 'pricePerMonth')) return;
      if (v !== '' && v !== null && v !== undefined) formData.append(k, v.toString());
    });
    if (form.tel) formData.set('tel', normalizeCmPhone(form.tel));
    if (!isEdit) {
      if (form.pricePerHour !== '') formData.append('pricePerHour', form.pricePerHour.toString());
      if (form.pricePerDay !== '') formData.append('pricePerDay', form.pricePerDay.toString());
      if (form.pricePerMonth !== '') formData.append('pricePerMonth', form.pricePerMonth.toString());
    }
    if (files.profil) formData.append('profil', files.profil);
    if (files.cni) formData.append('cni', files.cni);
    if (files.license) formData.append('license', files.license);
    onSubmit(formData);
  };

  const handleProfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFiles((p) => ({ ...p, profil: file }));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
        <form
          onSubmit={handleLocalSubmit}
          className="relative w-full max-w-2xl bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20 animate-in zoom-in"
        >
          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {editingDriver ? t.staff.modal.titleEdit : t.staff.addBtn}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 italic">
                {t.driverForm.docHint}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-8">
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 rounded-2xl text-red-600 dark:text-red-400 text-[10px] font-black uppercase italic tracking-widest">
                {error}
              </div>
            )}

            {/* BLOC PHOTO PROFIL — Haut du formulaire, preview visible */}
            <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
              <div className="relative shrink-0">
                <div className="size-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {profilPreviewUrl ? (
                    <img src={profilPreviewUrl} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <Camera size={38} className="text-slate-300" />
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 size-11 rounded-2xl bg-[#0528d6] text-white flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform">
                  <Upload size={16} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleProfilChange} />
                </label>
              </div>
              <div className="text-center sm:text-left space-y-1">
                <h4 className="text-sm font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                  {t.driverForm.photoProfil}
                </h4>
                <p className="text-[10px] font-bold uppercase italic tracking-widest text-slate-400">
                  {isEdit
                    ? (t.driverForm?.photoOptional || 'Laisser vide pour conserver la photo actuelle')
                    : (t.driverForm?.photoRequired || 'Photo obligatoire — JPG, PNG, WEBP (max 16 Mo)')}
                </p>
                {files.profil && (
                  <p className="text-[10px] font-black uppercase italic tracking-widest text-[#0528d6]">
                    {files.profil.name}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <Input label={t.auth.firstname} value={form.firstname} onChange={(v: string) => setForm({ ...form, firstname: v })} required icon={<User size={14} />} />
              <Input label={t.auth.lastname} value={form.lastname} onChange={(v: string) => setForm({ ...form, lastname: v })} required icon={<User size={14} />} />
              <Input
                label={t.agencies.modal.phone}
                type="tel"
                value={form.tel}
                onChange={(v: string) => setForm({ ...form, tel: normalizeCmPhone(v) })}
                required
                icon={<Phone size={14} />}
                maxLength={9}
                hint={!phoneValid ? t.booking?.needPhone : undefined}
              />
              <Input label={t.driverForm.cniNumber} value={form.cniNumber} onChange={(v: string) => setForm({ ...form, cniNumber: v.toUpperCase() })} required icon={<Shield size={14} />} />
              <Input label={t.driverForm.licenseNumber} value={form.licenseNumber} onChange={(v: string) => setForm({ ...form, licenseNumber: v.toUpperCase() })} required icon={<FileText size={14} />} />
              <Input label={t.driverForm.licenseExpiry} type="date" value={form.licenseExpiry} onChange={(v: string) => setForm({ ...form, licenseExpiry: v })} required />
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <Input label={t.driverForm.age} type="number" value={form.age} onChange={(v: string) => setForm({ ...form, age: v })} required />
                <Input label={t.driverForm.yearsExperience} type="number" value={form.yearsExperience} onChange={(v: string) => setForm({ ...form, yearsExperience: v })} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1 tracking-widest">{t.driverForm.gender}</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: parseInt(e.target.value) })}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] dark:text-white"
                >
                  <option value={0}>{t.driverForm.male}</option>
                  <option value={1}>{t.driverForm.female}</option>
                </select>
              </div>
            </div>

            {!isEdit && (
              <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-left">
                <h4 className="text-[10px] font-black uppercase text-[#0528d6] tracking-[0.2em] italic flex items-center gap-2">
                  <DollarSign size={14} /> {t.driverStatus.pricingSection}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest -mt-2">
                  {t.driverForm.pricingHint}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label={t.driverStatus.pricePerHour}
                    type="text"
                    inputMode="numeric"
                    value={form.pricePerHour}
                    onChange={(v: string) => setForm({ ...form, pricePerHour: v.replace(/[^\d]/g, '') })}
                    required
                  />
                  <Input
                    label={t.driverStatus.pricePerDay}
                    type="text"
                    inputMode="numeric"
                    value={form.pricePerDay}
                    onChange={(v: string) => setForm({ ...form, pricePerDay: v.replace(/[^\d]/g, '') })}
                    required
                  />
                  <Input
                    label={t.driverStatus.pricePerMonth}
                    type="text"
                    inputMode="numeric"
                    value={form.pricePerMonth}
                    onChange={(v: string) => setForm({ ...form, pricePerMonth: v.replace(/[^\d]/g, '') })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800 text-left">
              <h4 className="text-[10px] font-black uppercase text-[#0528d6] tracking-[0.2em] italic mb-2">
                {isEdit ? (t.driverForm?.scanDocsOptional || 'Documents (optionnels en édition)') : t.driverForm.scanDocs}
              </h4>
              <p className="text-[9px] font-bold text-slate-400 uppercase italic tracking-widest">
                JPG, PNG, WEBP ou PDF — max 16 Mo par document
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DocumentUploadZone label={t.driverForm.scanCni} onFile={(f) => setFiles((p) => ({ ...p, cni: f }))} />
                <DocumentUploadZone label={t.driverForm.scanLicense} onFile={(f) => setFiles((p) => ({ ...p, license: f }))} />
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase italic hover:text-red-500">
              {t.staff.modal.cancel}
            </button>
            <button
              disabled={
                modalLoading ||
                !phoneValid ||
                (!isEdit && (form.pricePerHour === '' || form.pricePerDay === '')) ||
                (!isEdit && (!files.profil || !files.cni || !files.license))
              }
              className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-blue-700 flex items-center justify-center gap-2 disabled:grayscale disabled:opacity-50 italic tracking-widest"
            >
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : t.staff.modal.submit}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};

const Input = ({ label, value, onChange, type = 'text', required = false, icon, maxLength, hint, inputMode }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase italic ml-1 tracking-widest">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6]">{icon}</div>}
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
