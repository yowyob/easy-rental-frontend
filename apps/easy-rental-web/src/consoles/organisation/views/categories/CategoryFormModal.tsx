/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState, useEffect } from 'react';
import { X, Loader2, Info, LayoutGrid, AlignLeft } from 'lucide-react';
import { Portal } from '../../components/Portal';

export const CategoryFormModal = ({ editingCat, initialData, onSubmit, onClose, modalLoading, formError, t }: any) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  return (
    <Portal>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 md:p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl animate-in fade-in" onClick={onClose} />
        
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} 
              className="relative w-full max-w-lg bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in">
          
          <div className="px-6 md:px-10 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-[#1a1d2d]">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                {editingCat ? t.categories.modal.edit : t.categories.modal.add}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 italic">{t.categories.subtitle}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><X size={22}/></button>
          </div>

          <div className="p-6 md:p-10 space-y-6 text-left">
            {formError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 px-5 py-4 rounded-2xl text-xs font-bold italic">
                {formError}
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">{t.categories.modal.name}</label>
              <div className="relative group">
                <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#0528d6] transition-colors" size={18} />
                <input 
                    required value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="ex: Premium SUV"
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 italic">{t.categories.modal.desc}</label>
              <div className="relative group">
                <AlignLeft className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#0528d6] transition-colors" size={18} />
                <textarea 
                    rows={4} value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Détails techniques du standing..."
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl font-black text-sm outline-none focus:border-[#0528d6] dark:text-white transition-all shadow-inner italic"
                />
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20 flex gap-3 italic">
              <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-600 dark:text-blue-400 leading-relaxed font-bold uppercase">
                {t.categories.deleteConfirm.split('?')[1] || "Les catégories permettent aux clients de filtrer votre flotte par standing."}
              </p>
            </div>
          </div>

          <div className="px-6 md:px-10 py-7 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-xs font-black text-slate-400 uppercase italic hover:text-red-500 transition-colors">{t.common.cancel}</button>
            <button disabled={modalLoading}
                    className="flex-[2] py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 italic tracking-widest">
              {modalLoading ? <Loader2 className="animate-spin size-4" /> : t.categories.modal.submit}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
};