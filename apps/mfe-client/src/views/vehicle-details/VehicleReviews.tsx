/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React from 'react';
import { Star, MessageSquare } from 'lucide-react';

export const VehicleReviews = ({ reviews }: any) => (
  <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
    {reviews?.length > 0 ? reviews.map((r: any) => (
      <div key={r.id} className="bg-white dark:bg-[#1a1d2d] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 flex gap-4">
        <div className="size-10 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center font-bold text-[#0528d6] shrink-0 ">{r.authorName?.charAt(0)}</div>
        <div className="flex-1 text-left">
          <div className="flex justify-between items-center mb-1">
            <h5 className="font-bold text-slate-900 dark:text-white text-sm">{r.authorName}</h5>
            <div className="flex text-orange-500 items-center gap-1"><Star size={12} fill="currentColor"/> <span className="text-[10px] font-black">{r.rating}</span></div>
          </div>
          <p className="text-xs text-slate-500 italic leading-relaxed font-medium">&quot;{r.comment}&quot;</p>
          <p className="text-[9px] font-bold text-slate-300  mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    )) : (
      <div className="py-20 text-center bg-white dark:bg-[#1a1d2d] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center gap-4">
        <MessageSquare size={32} className="text-slate-200" />
        <p className="text-slate-400 font-bold italic text-sm">Aucune évaluation enregistrée pour ce véhicule.</p>
      </div>
    )}
  </div>
);