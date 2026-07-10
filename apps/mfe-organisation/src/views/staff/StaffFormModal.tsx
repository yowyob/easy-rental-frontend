/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Mail, User, Store, UserCheck, Briefcase } from 'lucide-react';
import { Portal } from '../../components/Portal';

export const StaffFormModal = ({ editingStaff, agencies, postes = [], kernelMode, formError, initialData, onSubmit, onClose, modalLoading, t }: any) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
              className="relative w-full max-w-xl bg-white dark:bg-[#1a1d2d] rounded-[3rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-8 md:px-10 py-7 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {editingStaff ? t.staff.modal.titleEdit : (kernelMode ? 'Recruter un agent' : t.staff.modal.titleAdd)}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1.5 italic">
                {kernelMode && !editingStaff
                  ? 'Compte créé automatiquement — identifiants affichés ici (console agence)'
                  : t.staff.profile.agency}
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all shadow-sm"><X size={22}/></button>
          </div>

          <div className="p-8 md:p-10 overflow-y-auto custom-scrollbar space-y-8 text-left">
            {kernelMode && !editingStaff && (
              <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl text-[11px] text-green-800 dark:text-green-300 font-medium leading-relaxed">
                Mode local : le compte agent est créé directement dans Easy Rental. Les identifiants
                s&apos;affichent dans une fenêtre après validation — aucun email ni vérification kernel requis.
              </div>
            )}
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-5 py-4 rounded-2xl text-xs font-bold italic">
                {formError}
              </div>
            )}
            <div className="grid grid-cols-2 gap-5">
              <Input label={t.auth.firstname} value={formData.firstname} onChange={(v: any) => setFormData({...formData, firstname: v})} required icon={<User size={16}/>} />
              <Input label={t.auth.lastname} value={formData.lastname} onChange={(v: any) => setFormData({...formData, lastname: v})} required icon={<User size={16}/>} />
            </div>

            {!editingStaff && (
              <Input label="Email de l'agent" type="email" value={formData.email} onChange={(v: any) => setFormData({...formData, email: v})} required icon={<Mail size={16}/>} />
            )}

            <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-slate-800">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                  <Store size={14} className="text-[#0528d6]"/> {t.staff.modal.agencyLabel}
                </label>
                <select 
                  required value={formData.agencyId} 
                  onChange={e => setFormData({...formData, agencyId: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-[#0528d6] transition-all dark:text-white shadow-inner"
                >
                  <option value="">{t.staff.modal.selectPlaceholder}</option>
                  {agencies.map((a: any) => <option key={a.id} value={a.id}>{a.name} ({a.city})</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                  <Briefcase size={14} className="text-[#0528d6]"/> {t.staff.modal.posteLabel}
                </label>
                <select 
                  required value={formData.posteId} 
                  onChange={e => setFormData({...formData, posteId: e.target.value})}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-[#0528d6] transition-all dark:text-white shadow-inner"
                >
                  <option value="">{t.staff.modal.selectPlaceholder}</option>
                  {postes.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}{p.isSystem ? ' (système)' : ''}
                    </option>
                  ))}
                </select>
                {postes.length === 0 && (
                  <p className="text-[10px] text-amber-600 font-bold italic ml-1">
                    Aucun poste configuré. Créez d&apos;abord un poste dans l&apos;onglet Postes &amp; Rôles.
                  </p>
                )}
              </div>

              {editingStaff && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic flex items-center gap-2">
                    <UserCheck size={14} className="text-[#0528d6]"/> {t.staff.modal.statusLabel}
                  </label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-[#0528d6] transition-all dark:text-white shadow-inner"
                  >
                    <option value="ACTIVE">{t.staff.modal.statusActive}</option>
                    <option value="SUSPENDED">{t.staff.modal.statusSuspended}</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase italic hover:text-red-500 transition-colors">{t.staff.modal.cancel}</button>
            <button disabled={modalLoading}
                    className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest">
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : editingStaff ? t.common.save : (kernelMode ? 'Créer et envoyer' : t.staff.modal.submit)}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};

const Input = ({ label, value, onChange, type = "text", required = false, icon }: any) => {
  const isEmail = type === 'email';
  return (
  <div className="space-y-1.5 w-full">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">{label}</label>
    <div className="relative group">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors">{icon}</div>}
      <input type={type} required={required} value={value} onChange={e => onChange(e.target.value)} 
             className={`w-full ${icon ? 'pl-11' : 'px-4'} p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner ${isEmail ? 'normal-case' : 'uppercase italic'}`} />
    </div>
  </div>
  );
};
