'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { auditService } from '@pwa-easy-rental/shared-services';
import type { AuditEvent } from '@pwa-easy-rental/shared-services';

const ACTION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: '', label: 'Toutes' },
  { value: 'LOGIN_SUCCESS', label: 'Connexion réussie' },
  { value: 'LOGIN_FAILED', label: 'Connexion échouée' },
  { value: 'SIGNUP_CLIENT_SUCCESS', label: 'Inscription client réussie' },
  { value: 'SIGNUP_CLIENT_FAILED', label: 'Inscription client échouée' },
  { value: 'SIGNUP_ORG_SUCCESS', label: 'Inscription organisation réussie' },
  { value: 'SIGNUP_ORG_FAILED', label: 'Inscription organisation échouée' },
  { value: 'SIGNUP_FREELANCE_SUCCESS', label: 'Inscription freelance réussie' },
  { value: 'SIGNUP_FREELANCE_FAILED', label: 'Inscription freelance échouée' },
  { value: 'UPGRADE_TO_COMPANY', label: 'Passage en société' },
];

const PAGE_SIZE = 25;

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function shortId(id: string | null): string {
  if (!id) return '—';
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

function actionBadgeClasses(action: string): string {
  if (action.endsWith('_SUCCESS')) {
    return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/40';
  }
  if (action.endsWith('_FAILED')) {
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/40';
  }
  return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/40';
}

export const AuditLogView = () => {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);

  const [action, setAction] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = useCallback(async (targetPage: number) => {
    setLoading(true);
    setError('');
    const res = await auditService.search({
      userId: userId.trim() || undefined,
      action: action || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
      page: targetPage,
      size: PAGE_SIZE,
    });
    if (res.ok && Array.isArray(res.data)) {
      setEvents(res.data);
      setPage(targetPage);
    } else {
      setError("Impossible de charger le journal d'audit.");
    }
    setLoading(false);
  }, [userId, action, from, to]);

  useEffect(() => {
    load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    load(0);
  };

  const hasNext = events.length >= PAGE_SIZE;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
          Journal d&apos;audit — événements d&apos;authentification
        </p>
        <button
          type="button"
          onClick={() => load(page)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-[#0528d6] hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          <RefreshCw size={14} /> Actualiser
        </button>
      </div>

      <form
        onSubmit={handleFilter}
        className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3 items-end"
      >
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1323] text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0528d6]/30"
          >
            {ACTION_OPTIONS.map((opt) => (
              <option key={opt.value || 'ALL'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">User ID</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="UUID utilisateur"
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1323] text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0528d6]/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Depuis</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1323] text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0528d6]/30"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Jusqu&apos;à</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0f1323] text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0528d6]/30"
          />
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0528d6] text-white rounded-xl text-xs font-bold hover:bg-[#0420b0] transition-all"
        >
          <Search size={14} /> Filtrer
        </button>
      </form>

      {loading && (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#0528d6] size-8" />
        </div>
      )}

      {!loading && error && (
        <p className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
          {error}
        </p>
      )}

      {!loading && !error && (
        <div className="bg-white dark:bg-[#1a1d2d] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-[#0f1323] text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Console</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {events.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 font-medium">
                      Aucun événement trouvé.
                    </td>
                  </tr>
                )}
                {events.map((evt) => {
                  const createdAt = evt.createdAt ?? evt.created_at;
                  const userId = evt.userId ?? evt.user_id;
                  const rawMeta = evt.metadata ?? '';
                  let sourceLabel: string | null = null;
                  try {
                    const parsed = rawMeta ? JSON.parse(rawMeta) : null;
                    if (parsed && typeof parsed === 'object' && parsed.source) {
                      sourceLabel = String(parsed.source);
                    }
                  } catch {
                    /* metadata pas JSON, ignore */
                  }
                  return (
                    <tr key={evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300 font-medium">
                        {formatDate(createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wide ${actionBadgeClasses(evt.action)}`}
                        >
                          {evt.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {sourceLabel ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase text-slate-600 dark:text-slate-300">
                            {sourceLabel}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400" title={userId ?? ''}>
                        {shortId(userId)}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{evt.ip ?? '—'}</td>
                      <td
                        className="px-4 py-3 max-w-[220px] truncate text-slate-500 dark:text-slate-400"
                        title={rawMeta}
                      >
                        {rawMeta || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
              Page {page + 1}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => load(page - 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                <ChevronLeft size={14} /> Précédent
              </button>
              <button
                type="button"
                disabled={!hasNext}
                onClick={() => load(page + 1)}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Suivant <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
