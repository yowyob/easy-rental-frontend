import { authService } from './auth.service';
import { getStoredToken } from '../auth/auth-session';

const SESSION_KEY = 'easyrental_support_session_id';

export type SupportVisitorContext =
  | {
      mode: 'anonymous';
      sessionId: string;
      displayTitle: string;
      displaySubtitle: string;
    }
  | {
      mode: 'account';
      email: string;
      displayName?: string;
      role?: string;
      displayTitle: string;
      displaySubtitle: string;
    };

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getOrCreateSupportSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  const existing = localStorage.getItem(SESSION_KEY);
  if (existing?.trim()) return existing.trim();
  const created = generateSessionId();
  localStorage.setItem(SESSION_KEY, created);
  return created;
}

function isLandingContext(): boolean {
  if (typeof window === 'undefined') return true;
  const path = window.location.pathname;
  const port = window.location.port;
  return !path.startsWith('/client')
    && !path.startsWith('/agency')
    && !path.startsWith('/organisation')
    && !path.startsWith('/admin')
    && port !== '3001'
    && port !== '3002'
    && port !== '3003'
    && port !== '3004';
}

function resolveRoleLabel(path: string, role?: string): string | undefined {
  if (role) return role;
  if (path.startsWith('/organisation')) return 'Organisation';
  if (path.startsWith('/agency')) return 'Agence';
  if (path.startsWith('/client')) return 'Client';
  return undefined;
}

function resolveDisplayName(user: Record<string, unknown> | undefined): string | undefined {
  if (!user) return undefined;
  const first = String(user.firstname ?? user.first_name ?? '').trim();
  const last = String(user.lastname ?? user.last_name ?? '').trim();
  const full = `${first} ${last}`.trim();
  return full || String(user.name ?? '').trim() || undefined;
}

/**
 * Landing = anonymous session. MFE connectés = compte (email auto).
 */
export async function resolveSupportVisitorContext(): Promise<SupportVisitorContext> {
  if (isLandingContext()) {
    const sessionId = getOrCreateSupportSessionId();
    return {
      mode: 'anonymous',
      sessionId,
      displayTitle: 'Support Easy Rental',
      displaySubtitle: 'Écrivez votre message — nous vous répondrons ici',
    };
  }

  const token = getStoredToken();
  if (!token) {
    const sessionId = getOrCreateSupportSessionId();
    return {
      mode: 'anonymous',
      sessionId,
      displayTitle: 'Support Easy Rental',
      displaySubtitle: 'Connectez-vous pour lier la conversation à votre compte',
    };
  }

  authService.setToken(token);
  const path = window.location.pathname;

  try {
    if (path.startsWith('/organisation')) {
      const orgRes = await authService.getOrgUserMe();
      const user = orgRes.data?.user as Record<string, unknown> | undefined;
      const email = String(user?.email ?? user?.mail ?? '').trim().toLowerCase();
      if (email) {
        const displayName = resolveDisplayName(user);
        const role = resolveRoleLabel(path, String(user?.role ?? 'Organisation'));
        return {
          mode: 'account',
          email,
          displayName,
          role,
          displayTitle: displayName ? `Bonjour ${displayName}` : 'Support',
          displaySubtitle: role ?? 'Organisation',
        };
      }
    }

    const meRes = await authService.getUserMe();
    if (meRes.ok && meRes.data) {
      const raw = meRes.data as Record<string, unknown>;
      const email = String(raw.email ?? raw.mail ?? '').trim().toLowerCase();
      if (email) {
        const displayName = resolveDisplayName(raw);
        const role = resolveRoleLabel(path, String(raw.role ?? ''));
        return {
          mode: 'account',
          email,
          displayName,
          role,
          displayTitle: displayName ? `Bonjour ${displayName}` : 'Support',
          displaySubtitle: role ?? 'Compte Easy Rental',
        };
      }
    }
  } catch {
    // fall through
  }

  const sessionId = getOrCreateSupportSessionId();
  return {
    mode: 'anonymous',
    sessionId,
    displayTitle: 'Support Easy Rental',
    displaySubtitle: 'Session visiteur',
  };
}
