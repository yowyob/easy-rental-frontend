/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { Loader2, Camera, Trash2, Check } from 'lucide-react';
import {
  DEFAULT_INSPECTION_ITEMS,
  INSPECTION_ITEM_LABELS,
  ITEM_STATUS_LABELS,
  extraService,
} from '@pwa-easy-rental/shared-services';

const STATUSES = ['OK', 'DAMAGED', 'BROKEN', 'MISSING', 'NOT_APPLICABLE'];

const statusColor = (s: string, active: boolean) => {
  if (!active) return 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-transparent';
  switch (s) {
    case 'OK': return 'bg-emerald-500 text-white border-emerald-500';
    case 'DAMAGED': return 'bg-amber-500 text-white border-amber-500';
    case 'BROKEN': return 'bg-red-500 text-white border-red-500';
    case 'MISSING': return 'bg-slate-700 text-white border-slate-700';
    default: return 'bg-slate-300 text-slate-700 border-slate-300';
  }
};

type ItemState = { itemCode: string; status: string; note: string };

/**
 * Formulaire d'inspection (CHECK_IN ou CHECK_OUT). Min 4 photos requises.
 * onSubmit reçoit { odometer, fuelLevel, notes, photoUrls, items }.
 */
export const InspectionForm = ({
  mode,
  submitting,
  onSubmit,
  onCancel,
}: {
  mode: 'CHECK_IN' | 'CHECK_OUT';
  submitting?: boolean;
  onSubmit: (payload: {
    odometer: number | null;
    fuelLevel: number | null;
    notes: string;
    photoUrls: string[];
    items: ItemState[];
  }) => void;
  onCancel?: () => void;
}) => {
  const [odometer, setOdometer] = useState<string>('');
  const [fuelLevel, setFuelLevel] = useState<number>(4);
  const [notes, setNotes] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [items, setItems] = useState<ItemState[]>(
    DEFAULT_INSPECTION_ITEMS.map((code) => ({ itemCode: code, status: 'OK', note: '' })),
  );
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append('file', file);
        const res: any = await extraService.uploadMedia(body);
        const url = res?.data?.url || res?.data?.fileUrl;
        if (res.ok && url) uploaded.push(url);
      }
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch {
      setError('Échec de l\'upload d\'une ou plusieurs photos.');
    } finally {
      setUploading(false);
    }
  };

  const setStatus = (code: string, status: string) =>
    setItems((prev) => prev.map((it) => (it.itemCode === code ? { ...it, status } : it)));
  const setNote = (code: string, note: string) =>
    setItems((prev) => prev.map((it) => (it.itemCode === code ? { ...it, note } : it)));

  const handleSubmit = () => {
    setError(null);
    if (photos.length < 4) {
      setError('Au moins 4 photos sont obligatoires (avant, arrière, gauche, droite).');
      return;
    }
    if (!odometer) {
      setError('Le kilométrage compteur est obligatoire.');
      return;
    }
    onSubmit({
      odometer: Number(odometer),
      fuelLevel,
      notes,
      photoUrls: photos,
      items,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-[11px] font-black italic uppercase tracking-widest text-[#0528d6]">
        {mode === 'CHECK_IN' ? 'Inspection de départ (check-in)' : 'Inspection de retour (check-out)'}
      </div>

      {/* Globaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Kilométrage compteur *</span>
          <input
            type="number"
            value={odometer}
            onChange={(e) => setOdometer(e.target.value)}
            placeholder="ex. 52340"
            className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Carburant : {fuelLevel}/8</span>
          <input
            type="range" min={0} max={8} value={fuelLevel}
            onChange={(e) => setFuelLevel(Number(e.target.value))}
            className="mt-4 w-full accent-[#0528d6]"
          />
        </label>
      </div>

      {/* Photos */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
            Photos ({photos.length}/4 min)
          </span>
          {photos.length >= 4 && <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1"><Check size={12} /> OK</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative size-20 rounded-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 size-6 rounded-lg bg-red-500 text-white flex items-center justify-center"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          <label className="size-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer hover:border-[#0528d6]">
            {uploading ? <Loader2 size={20} className="animate-spin text-[#0528d6]" /> : <Camera size={22} className="text-slate-400" />}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
          </label>
        </div>
      </div>

      {/* Checklist */}
      <div className="space-y-2">
        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">Checklist véhicule</span>
        {items.map((it) => (
          <div key={it.itemCode} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-black italic text-slate-700 dark:text-slate-200">
                {INSPECTION_ITEM_LABELS[it.itemCode] || it.itemCode}
              </span>
              <div className="flex flex-wrap gap-1">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(it.itemCode, s)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${statusColor(s, it.status === s)}`}
                  >
                    {ITEM_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            {it.status !== 'OK' && it.status !== 'NOT_APPLICABLE' && (
              <input
                value={it.note}
                onChange={(e) => setNote(it.itemCode, e.target.value)}
                placeholder="Note (ex. bosse portière conducteur)"
                className="mt-2 w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
              />
            )}
          </div>
        ))}
      </div>

      <label className="block">
        <span className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">État général (notes)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
        />
      </label>

      {error && (
        <p className="px-4 py-3 rounded-2xl bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-900/30 text-[11px] font-black italic uppercase tracking-widest text-red-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-xs font-black uppercase italic text-slate-500">
            Annuler
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || uploading}
          className="flex-1 py-3 rounded-2xl bg-[#0528d6] text-white text-xs font-black uppercase italic disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          {mode === 'CHECK_IN' ? 'Valider le check-in' : 'Valider le check-out'}
        </button>
      </div>
    </div>
  );
};
