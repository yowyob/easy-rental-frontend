/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Loader2, DollarSign, Smartphone, CreditCard, Banknote } from 'lucide-react';
import { Portal } from '../../components/Portal';

export const PaymentModal = ({ rental, onClose, onSubmit, loading }: any) => {
  const [amount, setAmount] = useState(rental.totalAmount - rental.amountPaid);
  const [method, setMethod] = useState<'CASH' | 'MOMO' | 'OM' | 'CARD'>('CASH');

  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2.5rem] shadow-2xl p-10 text-center animate-in zoom-in border border-white/20">
          <div className="size-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-[#0528d6] mx-auto mb-6">
            <DollarSign size={32} />
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Encaisser Paiement</h3>
          <p className="text-xs text-slate-400 italic mb-8  tracking-widest">Dossier #{rental.id.substring(0,8)}</p>

          <div className="space-y-6 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400  ml-1">Montant à percevoir (XAF)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))}
                     className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-[#0528d6] rounded-2xl font-black text-xl text-[#0528d6] outline-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'CASH', label: 'Espèces', icon: <Banknote size={16}/> },
                { id: 'MOMO', label: 'MoMo', icon: <Smartphone size={16}/> },
                { id: 'OM', label: 'Orange', icon: <Smartphone size={16}/> },
                { id: 'CARD', label: 'Carte', icon: <CreditCard size={16}/> },
              ].map(m => (
                <button key={m.id} onClick={() => setMethod(m.id as any)}
                        className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${method === m.id ? 'border-[#0528d6] bg-blue-50/50 text-[#0528d6]' : 'border-slate-100 text-slate-400'}`}>
                  {m.icon} <span className="text-[10px] font-black ">{m.label}</span>
                </button>
              ))}
            </div>

            <button onClick={() => onSubmit(amount, method)} disabled={loading}
                    className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs  tracking-widest shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2 mt-4">
              {loading ? <Loader2 className="animate-spin size-4" /> : "Valider la transaction"}
            </button>
            <button onClick={onClose} className="w-full text-xs font-bold text-slate-400  tracking-widest">Annuler</button>
          </div>
        </div>
      </div>
    </Portal>
  );
};