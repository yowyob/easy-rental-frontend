/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useState } from 'react';
import { X, Copy, Check, ExternalLink, KeyRound } from 'lucide-react';
import { Portal } from '../../components/Portal';

type StaffCredentials = {
  email: string;
  password: string;
  agencyUrl: string;
};

export const StaffCredentialsModal = ({
  credentials,
  onClose,
}: {
  credentials: StaffCredentials;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const copy = async (value: string, field: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" onClick={onClose} />
        <div className="relative w-full max-w-lg bg-white dark:bg-[#1a1d2d] rounded-[2rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in">
          <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
            <div className="text-left">
              <div className="flex items-center gap-2 text-[#0528d6] mb-2">
                <KeyRound size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">Identifiants agent</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                Compte créé
              </h3>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold mt-2 italic">
                Mode dev : aucun email envoyé. Communiquez ces identifiants à l&apos;agent.
              </p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
              <X size={20} />
            </button>
          </div>

          <div className="p-8 space-y-5 text-left">
            <CredentialRow
              label="Console agence"
              value={credentials.agencyUrl}
              isLink
            />
            <CredentialRow
              label="Email"
              value={credentials.email}
              onCopy={() => copy(credentials.email, 'email')}
              copied={copied === 'email'}
            />
            <CredentialRow
              label="Mot de passe temporaire"
              value={credentials.password}
              onCopy={() => copy(credentials.password, 'password')}
              copied={copied === 'password'}
              highlight
            />
          </div>

          <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <a
              href={credentials.agencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 text-center text-xs font-black uppercase italic text-[#0528d6] border-2 border-[#0528d6]/20 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center gap-2"
            >
              <ExternalLink size={14} /> Ouvrir la console agence
            </a>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-[#0528d6] text-white rounded-xl font-black text-xs uppercase italic shadow-lg"
            >
              J&apos;ai noté les identifiants
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

const CredentialRow = ({
  label,
  value,
  onCopy,
  copied,
  highlight,
  isLink,
}: {
  label: string;
  value: string;
  onCopy?: () => void;
  copied?: boolean;
  highlight?: boolean;
  isLink?: boolean;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{label}</label>
    <div className={`flex items-center gap-2 p-4 rounded-2xl border-2 ${
      highlight
        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800'
    }`}>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm font-bold text-[#0528d6] break-all">
          {value}
        </a>
      ) : (
        <span className={`flex-1 text-sm font-black break-all ${highlight ? 'text-amber-900 dark:text-amber-100' : 'text-slate-800 dark:text-white'}`}>
          {value}
        </span>
      )}
      {onCopy && (
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 p-2 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800 text-slate-500"
          title="Copier"
        >
          {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        </button>
      )}
    </div>
  </div>
);

export function parseInviteCredentials(
  data: unknown,
  fallbackEmail: string
): { email: string; password: string; agencyUrl: string } | null {
  if (!data || typeof data !== 'object') return null;
  const payload = data as Record<string, unknown>;
  const password = String(payload.temporary_password ?? payload.temporaryPassword ?? '');
  if (!password) return null;
  const agencyUrl = String(
    payload.agency_login_url ?? payload.agencyLoginUrl ?? 'https://rental.yowyob.com/agency/login'
  );
  const emailSent = payload.email_sent ?? payload.emailSent;
  if (emailSent === true) return null;
  return { email: fallbackEmail, password, agencyUrl };
}
