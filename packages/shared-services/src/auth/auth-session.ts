const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_EXPIRES_KEY = 'auth_token_exp';
const AUTH_LAST_ACTIVITY_KEY = 'auth_last_activity';

type SessionScope = 'client' | 'agency' | 'organisation' | 'admin' | 'shared';

function getSessionScope(): SessionScope {
  if (typeof window === 'undefined') return 'shared';
  const path = window.location.pathname;
  const port = window.location.port;

  if (path.startsWith('/client')) return 'client';
  if (path.startsWith('/agency')) return 'agency';
  if (path.startsWith('/organisation')) return 'organisation';
  if (path.startsWith('/admin') || port === '3004') return 'admin';
  return 'shared';
}

function scopedKey(baseKey: string): string {
  const scope = getSessionScope();
  return scope === 'shared' ? baseKey : `${baseKey}_${scope}`;
}

/** Idle timeout before forced logout (40 minutes). */
export const IDLE_TIMEOUT_MS = 40 * 60 * 1000;
/** Refresh JWT when less than this remains AND user is active. */
export const REFRESH_BEFORE_EXPIRY_MS = 10 * 60 * 1000;
const ACTIVITY_THROTTLE_MS = 15_000;
const WATCHER_INTERVAL_MS = 30_000;

type JwtPayload = {
  exp?: number;
  sub?: string;
};

type RefreshHandler = () => Promise<string | null>;

let refreshHandler: RefreshHandler | null = null;

/**
 * Register async token refresh (POST /auth/refresh). Called by auth.service.
 */
export function setAuthRefreshHandler(handler: RefreshHandler | null): void {
  refreshHandler = handler;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(payload.padEnd(payload.length + (4 - (payload.length % 4)) % 4, '='));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export function getTokenExpiryMs(token: string): number | null {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return null;
  return payload.exp * 1000;
}

export function isTokenExpired(token: string, skewMs = 30_000): boolean {
  const exp = getTokenExpiryMs(token);
  if (!exp) return false;
  return Date.now() >= exp - skewMs;
}

export function touchAuthActivity(): void {
  if (typeof window === 'undefined') return;
  const tokenKey = scopedKey(AUTH_TOKEN_KEY);
  const activityKey = scopedKey(AUTH_LAST_ACTIVITY_KEY);
  if (!localStorage.getItem(tokenKey)) return;
  localStorage.setItem(activityKey, String(Date.now()));
}

export function getLastActivityMs(): number | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(scopedKey(AUTH_LAST_ACTIVITY_KEY));
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function isIdleExpired(idleMs = IDLE_TIMEOUT_MS): boolean {
  const last = getLastActivityMs();
  if (last == null) return false;
  return Date.now() - last >= idleMs;
}

export function persistAuthToken(token: string): void {
  if (typeof window === 'undefined') return;
  const tokenKey = scopedKey(AUTH_TOKEN_KEY);
  const expiryKey = scopedKey(AUTH_EXPIRES_KEY);
  const activityKey = scopedKey(AUTH_LAST_ACTIVITY_KEY);
  localStorage.setItem(tokenKey, token);
  const exp = getTokenExpiryMs(token);
  if (exp) {
    localStorage.setItem(expiryKey, String(exp));
  } else {
    localStorage.removeItem(expiryKey);
  }
  localStorage.setItem(activityKey, String(Date.now()));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(scopedKey(AUTH_TOKEN_KEY));
  localStorage.removeItem(scopedKey(AUTH_EXPIRES_KEY));
  localStorage.removeItem(scopedKey(AUTH_LAST_ACTIVITY_KEY));
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(scopedKey(AUTH_TOKEN_KEY));
  if (!token) return null;
  if (isTokenExpired(token) || isIdleExpired()) {
    clearAuthSession();
    return null;
  }
  return token;
}

export function initAuthSessionWatcher(onExpired: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;

  let lastTouchWrite = 0;
  let refreshInFlight = false;
  const tokenKey = scopedKey(AUTH_TOKEN_KEY);
  const activityKey = scopedKey(AUTH_LAST_ACTIVITY_KEY);

  const markActivity = () => {
    if (!localStorage.getItem(tokenKey)) return;
    const now = Date.now();
    if (now - lastTouchWrite < ACTIVITY_THROTTLE_MS) return;
    lastTouchWrite = now;
    localStorage.setItem(activityKey, String(now));
  };

  const expireSession = () => {
    clearAuthSession();
    onExpired();
  };

  const maybeRefresh = async () => {
    if (!refreshHandler || refreshInFlight) return;
    const token = localStorage.getItem(tokenKey);
    if (!token || isIdleExpired()) return;
    const exp = getTokenExpiryMs(token);
    if (!exp) return;
    const remaining = exp - Date.now();
    if (remaining > REFRESH_BEFORE_EXPIRY_MS || remaining <= 0) return;
    refreshInFlight = true;
    try {
      const next = await refreshHandler();
      if (next) {
        persistAuthToken(next);
      } else if (isTokenExpired(token)) {
        expireSession();
      }
    } catch {
      if (isTokenExpired(token)) {
        expireSession();
      }
    } finally {
      refreshInFlight = false;
    }
  };

  const check = () => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return;
    if (isIdleExpired() || isTokenExpired(token)) {
      expireSession();
      return;
    }
    void maybeRefresh();
  };

  const activityEvents: Array<keyof WindowEventMap> = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
  ];

  activityEvents.forEach((eventName) => {
    window.addEventListener(eventName, markActivity, { passive: true });
  });
  window.addEventListener('focus', check);

  // Seed activity for existing sessions that predate AUTH_LAST_ACTIVITY_KEY
  if (localStorage.getItem(tokenKey) && !localStorage.getItem(activityKey)) {
    touchAuthActivity();
  }

  check();
  const intervalId = window.setInterval(check, WATCHER_INTERVAL_MS);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener('focus', check);
    activityEvents.forEach((eventName) => {
      window.removeEventListener(eventName, markActivity);
    });
  };
}

export function markFirstUsageDone(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('easyrental_first_usage_done', '1');
}

export function hasCompletedFirstUsage(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('easyrental_first_usage_done') === '1';
}

export function hasDismissedFeedbackPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('easyrental_feedback_prompt_dismissed') === '1';
}

export function dismissFeedbackPrompt(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('easyrental_feedback_prompt_dismissed', '1');
}
