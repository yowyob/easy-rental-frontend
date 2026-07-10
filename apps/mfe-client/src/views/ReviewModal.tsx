/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { X, Loader2, Star } from 'lucide-react';
import { reviewService } from '@pwa-easy-rental/shared-services';

type ReviewModalProps = {
  rental: any;
  vehicle?: any;
  driver?: any;
  authorName?: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export const ReviewModal = ({ rental, vehicle, driver, authorName, onClose, onSubmitted }: ReviewModalProps) => {
  const [vehicleRating, setVehicleRating] = useState(5);
  const [driverRating, setDriverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle?.id || !driver?.id) {
      setError('Véhicule et chauffeur requis pour noter.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const base = { comment, authorName: authorName || rental?.clientName || 'Client' };
      const [vRes, dRes] = await Promise.all([
        reviewService.addReview({ ...base, resourceId: vehicle.id, resourceType: 'VEHICLE', rating: vehicleRating }),
        reviewService.addReview({ ...base, resourceId: driver.id, resourceType: 'DRIVER', rating: driverRating }),
      ]);
      if (!vRes.ok || !dRes.ok) {
        setError('Impossible d\'enregistrer vos avis.');
        return;
      }
      onSubmitted();
      onClose();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white dark:bg-[#1a1d2d] rounded-[2rem] p-8 shadow-2xl border border-white/20 space-y-6"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Noter votre trajet</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Véhicule et chauffeur</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={20} />
          </button>
        </div>

        {error && <p className="text-xs font-bold text-red-500">{error}</p>}

        <StarRow label="Véhicule" value={vehicleRating} onChange={setVehicleRating} />
        <StarRow label="Chauffeur" value={driverRating} onChange={setDriverRating} />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Commentaire (optionnel)"
          className="w-full p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-medium min-h-[80px] outline-none focus:border-[#0528d6] dark:text-white"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#0528d6] text-white rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin size-4" /> : 'Envoyer mes avis'}
        </button>
      </form>
    </div>
  );
};

const StarRow = ({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) => (
  <div>
    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{label}</p>
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-1">
          <Star size={22} className={n <= value ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
        </button>
      ))}
    </div>
  </div>
);
