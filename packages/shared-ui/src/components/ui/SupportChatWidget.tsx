'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Mail, RefreshCw } from 'lucide-react';
import {
  resolveSupportVisitorContext,
  supportService,
  type SupportVisitorContext,
} from '@pwa-easy-rental/shared-services';

type ChatMessage = {
  id: string;
  from: 'user' | 'admin';
  text: string;
  time: string;
};

function formatTime(value?: string | null) {
  if (!value) {
    return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
  return new Date(value).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function extractApiError(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const raw = data as Record<string, unknown>;
  const message = raw.message ?? raw.error ?? raw.detail;
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
}

export function SupportChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [visitor, setVisitor] = useState<SupportVisitorContext | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adminEmail, setAdminEmail] = useState('support@easyrental.local');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resolveSupportVisitorContext().then(setVisitor);
    supportService.getConfig().then((res) => {
      if (res.ok && res.data?.adminEmail) {
        setAdminEmail(res.data.adminEmail);
      }
    });
  }, []);

  const loadMessages = async (ctx: SupportVisitorContext, isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const params = ctx.mode === 'account'
      ? { email: ctx.email }
      : { visitorSessionId: ctx.sessionId };
    const res = await supportService.getConversationMessages(params);
    if (res.ok && Array.isArray(res.data)) {
      setMessages(
        res.data.map((msg) => ({
          id: msg.id,
          from: msg.senderRole === 'ADMIN' ? 'admin' : 'user',
          text: msg.body,
          time: formatTime(msg.createdAt),
        })),
      );
    }
    if (isRefresh) setRefreshing(false);
    else setLoading(false);
  };

  const handleRefresh = () => {
    if (visitor && !refreshing && !loading) {
      loadMessages(visitor, true);
    }
  };

  useEffect(() => {
    if (open && visitor) {
      loadMessages(visitor);
    }
  }, [open, visitor]);

  useEffect(() => {
    const openHandler = () => setOpen(true);
    window.addEventListener('support:open-chat', openHandler);
    return () => window.removeEventListener('support:open-chat', openHandler);
  }, []);

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !visitor || sending) return;

    setSending(true);
    setError('');

    const payload = visitor.mode === 'account'
      ? {
          threadId: threadId ?? undefined,
          email: visitor.email,
          authorName: visitor.displayName,
          visitorRole: visitor.role,
          body: text,
        }
      : {
          threadId: threadId ?? undefined,
          visitorSessionId: visitor.sessionId,
          body: text,
        };

    const res = await supportService.sendMessage(payload);

    if (res.ok && res.data) {
      if (res.data.threadId) setThreadId(res.data.threadId);
      await loadMessages(visitor);
      setInput('');
    } else {
      setError(extractApiError(res.data, 'Envoi impossible. Réessayez dans un instant.'));
    }
    setSending(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[500] size-14 rounded-2xl bg-[#0528d6] text-white shadow-2xl shadow-blue-600/30 flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Ouvrir le chat support"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <button
          type="button"
          aria-label="Fermer le chat"
          className="fixed inset-0 z-[550] bg-slate-900/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 z-[560] h-full w-full max-w-[400px] bg-white dark:bg-[#1a1d2d] shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        <header className="shrink-0 px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-[#0528d6] text-white flex items-center justify-between">
          <div>
            <p className="text-sm font-black uppercase italic tracking-tight">
              {visitor?.displayTitle ?? 'Support Easy Rental'}
            </p>
            <p className="text-[10px] opacity-80 mt-0.5">
              {visitor?.displaySubtitle ?? 'Messagerie support'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={!visitor || refreshing || loading}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors disabled:opacity-40"
              aria-label="Actualiser la conversation"
              title="Actualiser"
            >
              <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="p-2 rounded-xl hover:bg-white/15 transition-colors"
              aria-label="Fermer"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading && !refreshing && (
            <div className="flex justify-center py-6">
              <Loader2 className="animate-spin text-[#0528d6] size-6" />
            </div>
          )}
          {!loading && messages.length === 0 && (
            <p className="text-xs text-slate-400 italic text-center py-6">
              Bonjour ! Écrivez votre message — un administrateur vous répondra ici.
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={m.from === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}
            >
              <div
                className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  m.from === 'user'
                    ? 'bg-[#0528d6] text-white rounded-br-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        <footer className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-4 space-y-3 bg-slate-50/80 dark:bg-slate-900/50">
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Écrivez votre message…"
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none text-sm focus:ring-2 focus:ring-[#0528d6]/30"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !input.trim() || !visitor}
              className="px-4 py-3 rounded-xl bg-[#0528d6] text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
              aria-label="Envoyer"
            >
              {sending ? <Loader2 className="animate-spin size-4" /> : <Send size={16} />}
            </button>
          </div>
          <a
            href={`mailto:${adminEmail}?subject=${encodeURIComponent('Support Easy Rental')}`}
            className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-[#0528d6] uppercase tracking-wide"
          >
            <Mail size={12} /> {adminEmail}
          </a>
        </footer>
      </aside>
    </>
  );
}
