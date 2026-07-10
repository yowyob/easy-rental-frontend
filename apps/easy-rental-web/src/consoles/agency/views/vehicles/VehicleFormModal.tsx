/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Hash, Settings, Wind, ShieldCheck, Image as ImageIcon, Trash2, UploadCloud, Binary, Palette } from 'lucide-react';
import { Portal } from '../../components/Portal';
import { extraService, resolveMediaDisplayUrl } from '@pwa-easy-rental/shared-services';

export const VehicleFormModal = ({ editingVehicle, categories, initialData, onSubmit, onClose, modalLoading, backendError, t }: any) => {
  const [formData, setFormData] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(initialData);
    setUploadError('');
  }, [initialData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');
    const body = new FormData();
    body.append('file', file);

    try {
      const res = await extraService.uploadMedia(body);
      const url = res.data?.url as string | undefined;
      if (res.ok && url) {
        setFormData((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), url],
        }));
      } else {
        setUploadError((res.data as { message?: string })?.message || 'Upload impossible');
      }
    } catch {
      setUploadError('Erreur réseau lors de l\'upload');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index)
    }));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
              className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                {editingVehicle ? t.vehicleformdata.titleEdit : t.vehicleformdata.titleNew}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{t.vehicleformdata.subtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:text-red-500 transition-colors"><X size={22}/></button>
          </div>

          <div className="p-10 overflow-y-auto custom-scrollbar space-y-12 text-left">
            
            {/* SECTION 1 : IDENTITÉ ET LOCALISATION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label={t.vehicleformdata.brand} value={formData.brand} onChange={(v:any) => setFormData({...formData, brand: v})} required placeholder="ex: Toyota" />
                <Input label={t.vehicleformdata.model} value={formData.model} onChange={(v:any) => setFormData({...formData, model: v})} required placeholder="ex: RAV4" />
                <Input label={t.vehicleformdata.licencePlate} value={formData.licencePlate} onChange={(v:any) => setFormData({...formData, licencePlate: v.toUpperCase()})} required icon={<Hash size={14}/>} placeholder="LT-123-AB" />
                
                <Input label={t.vehicleformdata.vin} value={formData.vinNumber} onChange={(v:any) => setFormData({...formData, vinNumber: v.toUpperCase()})} required icon={<Binary size={14}/>} placeholder={t.vehicleformdata.vinPlaceholder} />
                <Input label={t.vehicleformdata.color} value={formData.color} onChange={(v:any) => setFormData({...formData, color: v})} icon={<Palette size={14}/>} placeholder="ex: Noir" />
                <Input label={t.vehicleformdata.year} type="date" value={formData.yearProduction} onChange={(v:any) => setFormData({...formData, yearProduction: v})} />

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">{t.vehicleformdata.category}</label>
                    <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-[#0528d6] outline-none transition-all dark:text-white">
                        <option value="">{t.vehicleformdata.selectCategory}</option>
                        {categories.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">{t.vehicleformdata.status}</label>
                    <select value={formData.statut} onChange={e => setFormData({...formData, statut: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold focus:border-[#0528d6] outline-none transition-all dark:text-white">
                        <option value="AVAILABLE">{t.vehicleformdata.statusAvailable}</option>
                        <option value="MAINTENANCE">{t.vehicleformdata.statusMaintenance}</option>
                    </select>
                </div>
            </div>

            {/* SECTION 2 : TECHNIQUE & MOTEUR */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-8">
                <h4 className="text-xs font-black text-[#0528d6] uppercase italic flex items-center gap-2"><Settings size={16}/> {t.vehicleformdata.techSpecs}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Input label={t.vehicleformdata.engineType} value={formData.engineDetails.type} onChange={(v:any) => setFormData({...formData, engineDetails: {...formData.engineDetails, type: v}})} placeholder="ex: V6 Hybride" />
                    <Input label={t.vehicleformdata.horsepower} type="number" value={formData.engineDetails.horsepower} onChange={(v:any) => setFormData({...formData, engineDetails: {...formData.engineDetails, horsepower: v}})} />
                    <Input label={t.vehicleformdata.capacity} type="number" value={formData.engineDetails.capacity} onChange={(v:any) => setFormData({...formData, engineDetails: {...formData.engineDetails, capacity: v}})} />
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase italic ml-1">{t.vehicleformdata.transmission}</label>
                        <select value={formData.transmission} onChange={e => setFormData({...formData, transmission: e.target.value})} className="w-full p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-[#0528d6] dark:text-white">
                            <option value="MANUAL">{t.vehicleformdata.transManual}</option>
                            <option value="AUTOMATIC">{t.vehicleformdata.transAuto}</option>
                        </select>
                    </div>
                    <Input label={t.vehicleformdata.seats} type="number" value={formData.places} onChange={(v:any) => setFormData({...formData, places: v})} />
                    <Input label={t.vehicleformdata.mileage} type="number" value={formData.kilometrage} onChange={(v:any) => setFormData({...formData, kilometrage: v})} />
                    <Input label={t.vehicleformdata.fuelCity} value={formData.fuelEfficiency.city} onChange={(v:any) => setFormData({...formData, fuelEfficiency: {...formData.fuelEfficiency, city: v}})} placeholder="ex: 8L/100" />
                    <Input label={t.vehicleformdata.fuelHighway} value={formData.fuelEfficiency.highway} onChange={(v:any) => setFormData({...formData, fuelEfficiency: {...formData.fuelEfficiency, highway: v}})} placeholder="ex: 6L/100" />
                </div>
            </div>

            {/* SECTION 3 : CONFORT ET SERVICES */}
            <div className="space-y-6">
                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2"><Wind size={16} className="text-[#0528d6]"/> {t.vehicleformdata.comfortEquip}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.keys(formData.functionalities).map((key) => (
                        <label key={key} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-[#0528d6] transition-all group">
                            <input 
                                type="checkbox" 
                                checked={formData.functionalities[key]} 
                                onChange={e => setFormData({...formData, functionalities: {...formData.functionalities, [key]: e.target.checked}})}
                                className="size-5 rounded border-slate-300 text-[#0528d6] focus:ring-[#0528d6]"
                            />
                            <span className="text-[10px] font-black uppercase text-slate-600 dark:text-slate-300 italic group-hover:text-[#0528d6]">{key.replace('_', ' ')}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* SECTION 4 : MÉDIAS & GALERIE */}
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase italic flex items-center gap-2"><ImageIcon size={16} className="text-[#0528d6]"/> {t.vehicleformdata.gallery}</h4>
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-[#0528d6] rounded-xl text-[10px] font-black uppercase italic border border-blue-100 dark:border-blue-800 hover:bg-[#0528d6] hover:text-white transition-all flex items-center gap-2">
                        {uploading ? <Loader2 size={14} className="animate-spin"/> : <UploadCloud size={14}/>} {t.vehicleformdata.addImage}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {formData.images.map((url: string, idx: number) => (
                        <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800 group shadow-sm">
                            <img src={resolveMediaDisplayUrl(url)} className="w-full h-full object-cover" alt="car" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                <Trash2 size={12}/>
                            </button>
                        </div>
                    ))}
                    {formData.images.length === 0 && (
                        <div className="col-span-full py-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                            <ImageIcon size={32} className="mb-2" />
                            <p className="text-[10px] font-bold uppercase italic">{t.vehicleformdata.noImages}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* SECTION 5 : ASSURANCE */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6">
                <h4 className="text-xs font-black uppercase italic flex items-center gap-2 text-blue-400"><ShieldCheck size={16}/> {t.vehicleformdata.insuranceCompliance}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Input label={t.vehicleformdata.insuranceProvider} dark value={formData.insuranceDetails.provider} onChange={(v:any) => setFormData({...formData, insuranceDetails: {...formData.insuranceDetails, provider: v}})} />
                    <Input label={t.vehicleformdata.insurancePolicy} dark value={formData.insuranceDetails.policy_number} onChange={(v:any) => setFormData({...formData, insuranceDetails: {...formData.insuranceDetails, policy_number: v}})} />
                    <Input label={t.vehicleformdata.insuranceExpiry} dark type="date" value={formData.insuranceDetails.expiry} onChange={(v:any) => setFormData({...formData, insuranceDetails: {...formData.insuranceDetails, expiry: v}})} />
                </div>
            </div>

          </div>

          {backendError && (
            <p className="px-10 pb-2 text-xs font-bold text-red-500 italic text-center">{backendError}</p>
          )}

          <div className="px-10 py-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-sm font-black text-slate-400 uppercase italic">{t.common.cancel}</button>
            <button disabled={modalLoading || uploading} className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : t.vehicleformdata.saveBtn}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};

const Input = ({ label, value, onChange, type = "text", icon, dark, placeholder, required }: any) => (
  <div className="space-y-1.5">
    <label className={`text-[9px] font-black uppercase italic ml-1 tracking-widest ${dark ? 'text-slate-400' : 'text-slate-400'}`}>{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input type={type} required={required} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} 
             className={`w-full ${icon ? 'pl-10' : 'px-4'} p-3 ${dark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white'} rounded-xl font-bold text-xs outline-none focus:border-[#0528d6] transition-all`} />
    </div>
  </div>
);