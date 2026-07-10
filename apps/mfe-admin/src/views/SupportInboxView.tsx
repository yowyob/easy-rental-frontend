'use client';
import React, { useEffect, useState } from 'react';
import { Loader2, Send, RefreshCw } from 'lucide-react';
import { adminService } from '@pwa-easy-rental/shared-services';
import type { SupportConversation, SupportMessage } from '@pwa-easy-rental/shared-services';

type SelectedConversation = {
  email?: string;
  visitorSessionId?: string;
  displayLabel: string;
};

export const SupportInboxView = ({ onActivityChange }: { onActivityChange?: () => void }) => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selected, setSelected] = useState<SelectedConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshingList, setRefreshingList] = useState(false);
  const [refreshingMessages, setRefreshingMessages] = useState(false);

  const loadConversations = async (isRefresh = false) => {
    if (isRefresh) setRefreshingList(true);
    else setLoading(true);
    const res = await adminService.getSupportConversations();
    if (res.ok && Array.isArray(res.data)) {
      setConversations(res.data);
      if (!selected && res.data.length > 0) {
        const first = res.data[0];
        setSelected({
          email: first.visitorEmail,
          visitorSessionId: first.visitorSessionId,
          displayLabel: first.displayLabel,
        });
      }
    }
    if (isRefresh) setRefreshingList(false);
    else setLoading(false);
  };

  const loadMessages = async (conversation: SelectedConversation, isRefresh = false) => {
    if (isRefresh) setRefreshingMessages(true);
    const res = await adminService.getSupportConversationMessages({
      email: conversation.email,
      visitorSessionId: conversation.visitorSessionId,
    });
    if (res.ok && Array.isArray(res.data)) {
      setMessages(res.data);
    }
    if (isRefresh) setRefreshingMessages(false);
  };

  const handleRefreshList = () => {
    if (!refreshingList) loadConversations(true);
  };

  const handleRefreshMessages = async () => {
    if (!selected || refreshingMessages) return;
    await loadMessages(selected, true);
    await markRead(selected);
  };

  const markRead = async (conversation: SelectedConversation) => {
    await adminService.markSupportConversationRead({
      email: conversation.email,
      visitorSessionId: conversation.visitorSessionId,
    });
    setConversations((prev) =>
      prev.map((item) => {
        const sameEmail = conversation.email && item.visitorEmail === conversation.email;
        const sameSession = conversation.visitorSessionId
          && item.visitorSessionId === conversation.visitorSessionId;
        if (sameEmail || sameSession) {
          return { ...item, adminUnreadCount: 0 };
        }
        return item;
      }),
    );
    onActivityChange?.();
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selected) return;
    loadMessages(selected);
    markRead(selected);
  }, [selected?.email, selected?.visitorSessionId]);

  const handleSelect = (conversation: SupportConversation) => {
    setSelected({
      email: conversation.visitorEmail,
      visitorSessionId: conversation.visitorSessionId,
      displayLabel: conversation.displayLabel,
    });
  };

  const handleReply = async () => {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    const res = await adminService.replyToSupportConversation({
      email: selected.email,
      visitorSessionId: selected.visitorSessionId,
      body: reply.trim(),
    });
    if (res.ok) {
      setReply('');
      await loadMessages(selected);
      await loadConversations();
      onActivityChange?.();
    }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Loader2 className="animate-spin text-[#0528d6] size-8" />
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
        Une conversation par personne — historique fusionné
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-[520px]">
        <div className="lg:col-span-1 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-white dark:bg-[#1a1d2d] shadow-sm flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Conversations</p>
            <button
              type="button"
              onClick={handleRefreshList}
              disabled={refreshingList}
              className="p-2 rounded-xl text-slate-500 hover:text-[#0528d6] hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              aria-label="Actualiser la liste"
              title="Actualiser"
            >
              <RefreshCw size={16} className={refreshingList ? 'animate-spin' : ''} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => {
            const isSelected = selected
              && ((conversation.visitorEmail && selected.email === conversation.visitorEmail)
                || (conversation.visitorSessionId
                  && selected.visitorSessionId === conversation.visitorSessionId));
            return (
              <button
                key={conversation.conversationKey}
                type="button"
                onClick={() => handleSelect(conversation)}
                className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm text-slate-800 dark:text-white truncate">
                    {conversation.displayLabel}
                  </p>
                  {conversation.adminUnreadCount > 0 && (
                    <span className="shrink-0 size-5 rounded-full bg-[#F76513] text-white text-[10px] font-black flex items-center justify-center">
                      {conversation.adminUnreadCount > 9 ? '9+' : conversation.adminUnreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  {conversation.lastMessageAt
                    ? new Date(conversation.lastMessageAt).toLocaleString('fr-FR')
                    : '—'}
                </p>
              </button>
            );
          })}
          {conversations.length === 0 && (
            <p className="p-6 text-sm text-slate-400 italic text-center">Aucun message pour le moment.</p>
          )}
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-[#1a1d2d] flex flex-col shadow-sm min-h-[520px]">
          {selected ? (
            <>
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-3">
                <div>
                  <p className="font-black text-slate-900 dark:text-white italic">{selected.displayLabel}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Support Easy Rental
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRefreshMessages}
                  disabled={refreshingMessages}
                  className="p-2.5 rounded-xl text-slate-500 hover:text-[#0528d6] hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-40 transition-colors"
                  aria-label="Actualiser les messages"
                  title="Actualiser"
                >
                  <RefreshCw size={18} className={refreshingMessages ? 'animate-spin' : ''} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-3 custom-scrollbar">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={msg.senderRole === 'ADMIN' ? 'flex justify-end' : 'flex justify-start'}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.senderRole === 'ADMIN'
                          ? 'bg-[#0528d6] text-white rounded-br-md shadow-md shadow-blue-600/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-bl-md'
                      }`}
                    >
                      {msg.body}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-[#1a1d2d]">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="Répondre…"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm outline-none focus:border-[#0528d6]"
                />
                <button
                  type="button"
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="px-5 py-3 rounded-xl bg-[#0528d6] text-white disabled:opacity-40 shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  {sending ? <Loader2 className="animate-spin size-4" /> : <Send size={16} />}
                </button>
              </div>
            </>
          ) : (
            <p className="p-8 text-sm text-slate-400 italic text-center">Sélectionnez une conversation.</p>
          )}
        </div>
      </div>
    </section>
  );
};
