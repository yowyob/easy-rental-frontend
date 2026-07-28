'use client';
import React from 'react';
import { ChatPanel } from '../../shared-chat/ChatPanel';

export const ChatAuditView = () => (
  <section className="space-y-4">
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 italic">
      Audit de toutes les conversations de la plateforme (client ↔ agence, client/agence ↔ support)
    </p>
    <ChatPanel role="ADMIN" selfId={null} readOnly />
  </section>
);
