/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Lock, CheckSquare, Square, Check, ShieldCheck, AlignLeft } from 'lucide-react';
import { Portal } from '../../components/Portal';

export const RoleFormModal = ({ editingPoste, permissionsByModule, initialData, onSubmit, onClose, modalLoading, t }: any) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const togglePermission = (id: string) => {
    setFormData((prev: any) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(id) 
        ? prev.permissionIds.filter((pid: string) => pid !== id) 
        : [...prev.permissionIds, id]
    }));
  };

  const toggleModuleGroup = (moduleName: string) => {
    const modulePermIds = permissionsByModule[moduleName].map((p: any) => p.id);
    const areAllSelected = modulePermIds.every((id: string) => formData.permissionIds.includes(id));
    
    setFormData((prev: any) => ({
      ...prev,
      permissionIds: areAllSelected 
        ? prev.permissionIds.filter((id: string) => !modulePermIds.includes(id))
        : Array.from(new Set([...prev.permissionIds, ...modulePermIds]))
    }));
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in" onClick={onClose} />
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
              className="relative w-full max-w-5xl bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in border border-white/20">
          
          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {editingPoste ? t.roles.modal.titleEdit : t.roles.modal.titleAdd}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em] mt-1.5 italic">{t.roles.subtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
              <X size={22} />
            </button>
          </div>

          <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1 italic">{t.roles.modal.name}</label>
                <div className="relative group">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors" size={18}/>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner uppercase" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] ml-1 italic">{t.roles.modal.description}</label>
                <div className="relative group">
                    <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors" size={18}/>
                    <input required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner italic" />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <h4 className="text-xs font-black text-[#0528d6] dark:text-blue-400 flex items-center gap-3 border-b dark:border-slate-800 pb-3 uppercase tracking-widest italic">
                <Lock size={16}/> {t.roles.modal.privilegesTitle}
              </h4>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                {Object.keys(permissionsByModule).map((module) => {
                  const modulePermIds = permissionsByModule[module].map((p: any) => p.id);
                  const isAllSelected = modulePermIds.every((id: string) => formData.permissionIds.includes(id));

                  return (
                    <div key={module} className="space-y-4 text-left">
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/80 px-5 py-3 rounded-2xl border dark:border-slate-800 shadow-sm">
                        <span className="text-[11px] font-black uppercase text-slate-700 dark:text-slate-300 italic tracking-[0.2em]">{module}</span>
                        <button type="button" onClick={() => toggleModuleGroup(module)}
                                className={`flex items-center gap-2 text-[9px] font-black uppercase transition-all italic ${isAllSelected ? 'text-orange-500' : 'text-[#0528d6] dark:text-blue-400 hover:scale-105'}`}>
                          {isAllSelected ? <><CheckSquare size={14} /> {t.roles.modal.deselect}</> : <><Square size={14} /> {t.roles.modal.selectAll}</>}
                        </button>
                      </div>
                      <div className="space-y-3 pl-2">
                        {permissionsByModule[module].map((perm: any) => (
                          <div key={perm.id} onClick={() => togglePermission(perm.id)}
                               className={`flex items-center justify-between p-4 rounded-[1.5rem] border-2 transition-all cursor-pointer group ${formData.permissionIds.includes(perm.id) ? 'border-[#0528d6] bg-blue-50/30 dark:bg-blue-900/20' : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}>
                            <div className="flex-1 pr-4">
                              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase italic tracking-tight">{perm.name}</p>
                              <p className="text-[9px] text-slate-400 font-bold italic leading-none mt-1">{perm.description}</p>
                            </div>
                            <div className={`size-6 rounded-xl border-2 flex items-center justify-center shrink-0 transition-all ${formData.permissionIds.includes(perm.id) ? 'bg-[#0528d6] border-[#0528d6] text-white shadow-lg shadow-blue-600/30' : 'border-slate-200 dark:border-slate-700'}`}>
                              {formData.permissionIds.includes(perm.id) && <Check size={14} strokeWidth={4} />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase italic hover:text-red-500 transition-colors">{t.common.cancel}</button>
            <button disabled={modalLoading}
                    className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest">
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : t.roles.modal.submitAdd}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};