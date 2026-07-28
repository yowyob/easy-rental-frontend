/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Send, MessageSquare } from 'lucide-react';
import { conversationService } from '@pwa-easy-rental/shared-services';
import type { ChatMessage, Conversation } from '@pwa-easy-rental/shared-services';

export type ChatRole = 'CLIENT' | 'AGENCY' | 'ADMIN';

export type ChatPanelProps = {
  role: ChatRole;
  selfId?: string | null;
  initialTarget?: { type: ChatRole; id: string | null; label?: string } | null;
  readOnly?: boolean;
};

const PARTICIPANT_LABELS: Record<string, string> = {
  CLIENT: 'Client',
  AGENCY: 'Agence',
  ADMIN: 'Support',
};

function participantLabel(name?: string | null, type?: string | null, id?: string | null): string {
  // Priorité au vrai nom (client/agence) résolu côté backend ; sinon type ; sinon #id court.
  if (name && name.trim()) return name.trim();
  const label = (type && PARTICIPANT_LABELS[type]) || type || 'Inconnu';
  const shortId = id ? ` #${id.slice(0, 8)}` : '';
  return `${label}${shortId}`;
}

function conversationTitle(conv: Conversation, role: ChatRole): string {
  if (role === 'ADMIN') {
    return `${participantLabel(conv.participantAName, conv.participantAType, conv.participantAId)}`
      + ` ↔ ${participantLabel(conv.participantBName, conv.participantBType, conv.participantBId)}`;
  }
  const aIsSelf = conv.participantAType === role;
  const other = aIsSelf
    ? { name: conv.participantBName, type: conv.participantBType, id: conv.participantBId }
    : { name: conv.participantAName, type: conv.participantAType, id: conv.participantAId };
  return participantLabel(other.name, other.type, other.id);
}

function formatWhen(iso?: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR');
  } catch {
    return '—';
  }
}

export const ChatPanel = ({ role, selfId, initialTarget, readOnly = false }: ChatPanelProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadConversations = useCallback(async (): Promise<Conversation[]> => {
    const res = role === 'ADMIN' && readOnly
      ? await conversationService.adminListAll()
      : await conversationService.listMine();
    if (res.ok && Array.isArray(res.data)) {
      setConversations(res.data);
      return res.data;
    }
    return [];
  }, [role, readOnly]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const res = await conversationService.getMessages(conversationId);
    if (res.ok && Array.isArray(res.data)) {
      setMessages(res.data);
    }
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    setSelectedId(conversationId);
    setLoadingMessages(true);
    await loadMessages(conversationId);
    setLoadingMessages(false);
    if (!readOnly) {
      await conversationService.markRead(conversationId);
      setConversations((prev) => prev.map((c) => (c.id === conversationId ? { ...c, unread: 0 } : c)));
    }
  }, [loadMessages, readOnly]);

  // Chargement initial : liste des conversations + éventuellement ouverture d'une cible.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      const list = await loadConversations();
      if (cancelled) return;

      if (initialTarget) {
        const opened = await conversationService.open(initialTarget.type, initialTarget.id);
        if (!cancelled && opened.ok && opened.data) {
          await loadConversations();
          if (!cancelled) await selectConversation(opened.data.id);
        }
      } else if (list.length > 0 && !selectedId) {
        await selectConversation(list[0].id);
      }
      if (!cancelled) setLoadingList(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Polling des messages de la conversation sélectionnée.
  useEffect(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    if (!selectedId) return undefined;
    pollRef.current = setInterval(() => {
      loadMessages(selectedId);
    }, 5000);
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedId || !draft.trim() || sending || readOnly) return;
    setSending(true);
    const res = await conversationService.sendMessage(selectedId, draft.trim());
    if (res.ok) {
      setDraft('');
      await loadMessages(selectedId);
      await loadConversations();
    }
    setSending(false);
  };

  const isOwnMessage = (msg: ChatMessage) => role !== 'ADMIN' && msg.senderType === role;

  if (loadingList) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[520px]">
      {/* LISTE DES CONVERSATIONS */}
      <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1a1d2d] shadow-sm flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <MessageSquare size={16} className="text-[#0528d6]" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              type="button"
              onClick={() => selectConversation(conv.id)}
              className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                selectedId === conv.id ? 'bg-blue-50 dark:bg-blue-950/20' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                  {conversationTitle(conv, role)}
                </p>
                {conv.unread > 0 && (
                  <span className="shrink-0 size-5 rounded-full bg-[#F76513] text-white text-[10px] font-black flex items-center justify-center">
                    {conv.unread > 9 ? '9+' : conv.unread}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">{formatWhen(conv.lastMessageAt)}</p>
            </button>
          ))}
          {conversations.length === 0 && (
            <p className="p-6 text-sm text-slate-400 italic text-center">Aucune conversation pour le moment.</p>
          )}
        </div>
      </div>

      {/* FIL DE MESSAGES */}
      <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#1a1d2d] flex flex-col shadow-sm min-h-[520px]">
        {selectedId ? (
          <>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <p className="font-black text-slate-900 dark:text-white italic">
                {conversations.find((c) => c.id === selectedId)
                  ? conversationTitle(conversations.find((c) => c.id === selectedId) as Conversation, role)
                  : 'Conversation'}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                Messagerie Easy Rental
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
              {loadingMessages && (
                <div className="flex justify-center py-4">
                  <Loader2 className="animate-spin text-[#0528d6] size-5" />
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={isOwnMessage(msg) ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isOwnMessage(msg)
                        ? 'bg-[#0528d6] text-white rounded-br-md shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
                    }`}
                  >
                    {msg.body}
                  </div>
                </div>
              ))}
              {messages.length === 0 && !loadingMessages && (
                <p className="text-sm text-slate-400 italic text-center py-8">Aucun message pour l&apos;instant.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
            {!readOnly && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-[#1a1d2d]">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Écrire un message…"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:border-[#0528d6]"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="px-5 py-3 rounded-xl bg-[#0528d6] text-white disabled:opacity-40 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  {sending ? <Loader2 className="animate-spin size-4" /> : <Send size={16} />}
                </button>
              </div>
            )}
          </>
        ) : (
          <p className="p-8 text-sm text-slate-400 italic text-center">Sélectionnez une conversation.</p>
        )}
      </div>
    </div>
  );
};
