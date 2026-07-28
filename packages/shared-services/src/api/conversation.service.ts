import { defaultClient as client } from './api-client';
import { deepCamelize } from '../utils/camelize';

export type Conversation = {
  id: string; type: string;
  participantAType: string; participantAId?: string | null; participantAName?: string | null;
  participantBType: string; participantBId?: string | null; participantBName?: string | null;
  subject?: string | null; unread: number; lastMessageAt?: string | null;
};
export type ChatMessage = {
  id: string; conversationId: string; senderType: string;
  senderId?: string | null; body: string; createdAt?: string | null;
};

export const conversationService = {
  open: async (targetType: 'CLIENT'|'AGENCY'|'ADMIN', targetId: string | null) => {
    const res = await client.post<any>('/api/conversations/open', { target_type: targetType, target_id: targetId });
    if (res.ok && res.data) return { ...res, data: deepCamelize(res.data) as Conversation };
    return res;
  },
  listMine: async () => {
    const res = await client.get<any[]>('/api/conversations/mine');
    if (res.ok && Array.isArray(res.data)) return { ...res, data: res.data.map(deepCamelize) as Conversation[] };
    return res;
  },
  getMessages: async (id: string, page = 0, size = 50) => {
    const res = await client.get<any[]>(`/api/conversations/${id}/messages?page=${page}&size=${size}`);
    if (res.ok && Array.isArray(res.data)) return { ...res, data: res.data.map(deepCamelize) as ChatMessage[] };
    return res;
  },
  sendMessage: async (id: string, body: string) => {
    const res = await client.post<any>(`/api/conversations/${id}/messages`, { body });
    if (res.ok && res.data) return { ...res, data: deepCamelize(res.data) as ChatMessage };
    return res;
  },
  markRead: (id: string) => client.put<any>(`/api/conversations/${id}/read`, {}),
  adminListAll: async (page = 0, size = 50) => {
    const res = await client.get<any[]>(`/api/conversations/admin/all?page=${page}&size=${size}`);
    if (res.ok && Array.isArray(res.data)) return { ...res, data: res.data.map(deepCamelize) as Conversation[] };
    return res;
  },
};
