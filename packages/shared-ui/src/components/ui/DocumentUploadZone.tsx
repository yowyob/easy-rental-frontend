'use client';
import React, { useEffect, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import {
  MAX_DRIVER_DOCUMENT_BYTES,
  formatFileSize,
  validateDriverDocument,
} from '@pwa-easy-rental/shared-services';

type DocumentUploadZoneProps = {
  label: string;
  onFile: (file: File | null) => void;
  accept?: string;
  maxSizeBytes?: number;
};

export const DocumentUploadZone = ({
  label,
  onFile,
  accept = 'image/*,.pdf,application/pdf',
  maxSizeBytes = MAX_DRIVER_DOCUMENT_BYTES,
}: DocumentUploadZoneProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setError(null);

    if (!file) {
      setPreview(null);
      setFileName(null);
      setIsPdf(false);
      onFile(null);
      return;
    }

    const validationError = validateDriverDocument(file);
    if (validationError || file.size > maxSizeBytes) {
      setPreview(null);
      setFileName(null);
      setIsPdf(false);
      setError(validationError || `Fichier trop volumineux (max ${formatFileSize(maxSizeBytes)}).`);
      onFile(null);
      return;
    }

    const pdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setFileName(file.name);
    setIsPdf(pdf);

    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }

    onFile(file);
  };

  return (
    <div className="space-y-1">
      <div className="relative group flex flex-col items-center justify-center p-4 min-h-[120px] bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl transition-all hover:border-[#0528d6] cursor-pointer overflow-hidden">
        {preview ? (
          <img src={preview} alt={label} className="absolute inset-0 w-full h-full object-cover opacity-90" />
        ) : isPdf ? (
          <div className="flex flex-col items-center gap-2 relative z-10 text-[#0528d6]">
            <FileText size={32} />
            <span className="text-[8px] font-black uppercase tracking-widest">PDF</span>
          </div>
        ) : (
          <UploadCloud className="text-slate-300 mb-2 group-hover:text-[#0528d6] relative z-10" size={24} />
        )}
        <span className="text-[8px] font-black uppercase text-slate-500 text-center leading-tight tracking-widest relative z-10 bg-white/80 dark:bg-slate-900/80 px-2 py-1 rounded line-clamp-2">
          {fileName || label}
        </span>
        {fileName && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleFile(null); }}
            className="absolute top-2 right-2 z-20 p-1 bg-white/90 dark:bg-slate-800 rounded-full text-red-500"
            aria-label="Retirer le fichier"
          >
            <X size={14} />
          </button>
        )}
        <input
          type="file"
          onChange={(e) => handleFile(e.target.files?.[0] || null)}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
          accept={accept}
        />
      </div>
      {error && <p className="text-[9px] font-bold text-red-500 px-1">{error}</p>}
    </div>
  );
};
