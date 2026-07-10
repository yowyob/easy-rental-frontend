import { defaultClient as client } from './api-client';

export type SupportConfig = {
  adminEmail: string;
  helpUrl: string;
  consoleUrl: string;
};

export type SupportConversation = {
  conversationKey: string;
  displayLabel: string;
  visitorEmail?: string;
  visitorSessionId?: string;
  visitorRole?: string;
  adminUnreadCount: number;
  lastMessageAt?: string | null;
  canonicalThreadId: string;
};

export type SupportMessage = {
  id: string;
  threadId: string;
  senderRole: 'USER' | 'ADMIN' | string;
  body: string;
  createdAt?: string | null;
};

function str(value: unknown, fallback = ''): string {
  return value != null ? String(value) : fallback;
}

function normalizeConversation(raw: Record<string, unknown>): SupportConversation {
  return {
    conversationKey: str(raw.conversationKey ?? raw.conversation_key),
    displayLabel: str(raw.displayLabel ?? raw.display_label),
    visitorEmail: str(raw.visitorEmail ?? raw.visitor_email) || undefined,
    visitorSessionId: str(raw.visitorSessionId ?? raw.visitor_session_id) || undefined,
    visitorRole: str(raw.visitorRole ?? raw.visitor_role) || undefined,
    adminUnreadCount: Number(raw.adminUnreadCount ?? raw.admin_unread_count ?? 0),
    lastMessageAt: (raw.lastMessageAt ?? raw.last_message_at ?? null) as string | null,
    canonicalThreadId: str(raw.canonicalThreadId ?? raw.canonical_thread_id),
  };
}

function normalizeMessage(raw: Record<string, unknown>): SupportMessage {
  return {
    id: str(raw.id),
    threadId: str(raw.threadId ?? raw.thread_id),
    senderRole: str(raw.senderRole ?? raw.sender_role, 'USER'),
    body: str(raw.body),
    createdAt: (raw.createdAt ?? raw.created_at ?? null) as string | null,
  };
}

function conversationQuery(email?: string, visitorSessionId?: string): string {
  const params = new URLSearchParams();
  if (email) params.set('email', email);
  if (visitorSessionId) params.set('visitorSessionId', visitorSessionId);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const supportService = {
  getConfig: async () => {
    const res = await client.get<Record<string, unknown>>('/api/support/config');
    if (!res.ok || !res.data) return res;
    const raw = res.data;
    return {
      ...res,
      data: {
        adminEmail: str(raw.adminEmail ?? raw.admin_email),
        helpUrl: str(raw.helpUrl ?? raw.help_url),
        consoleUrl: str(raw.consoleUrl ?? raw.console_url),
      } satisfies SupportConfig,
    };
  },

  sendMessage: async (payload: {
    threadId?: string;
    email?: string;
    visitorSessionId?: string;
    authorName?: string;
    visitorRole?: string;
    body: string;
  }) => {
    const res = await client.post<Record<string, unknown>>('/api/support/messages', payload);
    if (!res.ok || !res.data) return res;
    return {
      ...res,
      data: {
        threadId: str(res.data.threadId ?? res.data.thread_id),
        confirmationMessage: str(
          res.data.confirmationMessage ?? res.data.confirmation_message,
          'Message envoyé.',
        ),
      },
    };
  },

  getConversationMessages: async (params: { email?: string; visitorSessionId?: string }) => {
    const res = await client.get<Record<string, unknown>[]>(
      `/api/support/conversation/messages${conversationQuery(params.email, params.visitorSessionId)}`,
    );
    if (!res.ok || !Array.isArray(res.data)) return res;
    return { ...res, data: res.data.map((row) => normalizeMessage(row)) };
  },

  listConversations: async () => {
    const res = await client.get<Record<string, unknown>[]>('/api/support/admin/conversations');
    if (!res.ok || !Array.isArray(res.data)) return res;
    return { ...res, data: res.data.map((row) => normalizeConversation(row)) };
  },

  getAdminConversationMessages: async (params: { email?: string; visitorSessionId?: string }) => {
    const res = await client.get<Record<string, unknown>[]>(
      `/api/support/admin/conversation/messages${conversationQuery(params.email, params.visitorSessionId)}`,
    );
    if (!res.ok || !Array.isArray(res.data)) return res;
    return { ...res, data: res.data.map((row) => normalizeMessage(row)) };
  },

  replyToConversation: (params: { email?: string; visitorSessionId?: string; body: string }) =>
    client.post<Record<string, unknown>>(
      `/api/support/admin/conversation/reply${conversationQuery(params.email, params.visitorSessionId)}`,
      { body: params.body },
    ),

  markConversationAsRead: (params: { email?: string; visitorSessionId?: string }) =>
    client.patch<void>(
      `/api/support/admin/conversation/read${conversationQuery(params.email, params.visitorSessionId)}`,
      {},
    ),
};
