// FILE: packages/shared-services/src/api/auth.service.ts
import { defaultClient as client } from './api-client';
import { isOrganizationOnboarded, normalizeOrganization } from './org.mapper';
import { persistAuthToken, setAuthRefreshHandler } from '../auth/auth-session';

export type LoginResult =
  | { ok: true; token: string }
  | { ok: false; error: string }
  | { mfaRequired: true; mfaToken: string; mfaChannel?: string };

export type RegisterClientResult =
  | { ok: true; emailVerificationRequired: true; message: string }
  | { ok: true; emailVerificationRequired: false; user?: Record<string, unknown> }
  | { ok: false; error: string };

const refreshSessionToken = async (): Promise<string | null> => {
  const res = await client.post<{ token?: string }>('/auth/refresh', {});
  const token = res.data?.token;
  if (res.ok && token) {
    persistAuthToken(token);
    client.setAuthToken(token);
    return token;
  }
  return null;
};

setAuthRefreshHandler(refreshSessionToken);

export const authService = {
  getUserMe: () => client.get<any>('/auth/me'),
  getOrgUserMe: async () => {
    const res = await client.get<Record<string, unknown>>('/api/org/auth/me');
    if (!res.ok || !res.data) {
      return res;
    }
    const raw = res.data;
    const rawOrg = raw.organization as Record<string, unknown> | null | undefined;
    const organization = normalizeOrganization(rawOrg);
    return {
      ...res,
      data: {
        user: raw.user,
        organization,
        isOnboarded: isOrganizationOnboarded(organization),
      },
    };
  },
  login: async (data: { email: string; password: string }): Promise<LoginResult> => {
    const res = await client.post<any>('/auth/login', data);
    const dataObj = res.data as Record<string, unknown> | null;
    const mfaRequired =
      dataObj?.mfa_required === true || dataObj?.mfaRequired === true || res.status === 202;
    const mfaToken = (dataObj?.mfa_token ?? dataObj?.mfaToken) as string | undefined;
    if (mfaRequired && mfaToken) {
      return {
        mfaRequired: true,
        mfaToken,
        mfaChannel: (dataObj?.mfa_channel ?? dataObj?.mfaChannel) as string | undefined,
      };
    }
    const token = (dataObj?.token) as string | undefined;
    if (res.ok && token) {
      persistAuthToken(token);
      return { ok: true, token };
    }
    const message = (dataObj?.message ?? dataObj?.error) as string | undefined;
    if (res.status === 0) {
      return { ok: false, error: 'Serveur indisponible. Démarrez le backend (port 8081) et Docker postgres/redis.' };
    }
    if (res.status === 502 || res.status === 504) {
      return { ok: false, error: 'Backend injoignable (proxy). Vérifiez que le port 8081 répond.' };
    }
    if (message?.includes('timed out') || message?.includes('timeout') || message?.includes('KERNEL_TIMEOUT')) {
      return {
        ok: false,
        error: 'Connexion au kernel trop lente. Réessayez dans quelques secondes (réseau vers kernel-core.yowyob.com).',
      };
    }
    if (res.status === 403) {
      return {
        ok: false,
        error: 'Accès refusé par le serveur (CORS). Redémarrez le backend après mise à jour.',
      };
    }
    if (res.status === 404) {
      return {
        ok: false,
        error: 'API introuvable (proxy). Vérifiez que le backend tourne sur le port 8081 et redémarrez le frontend.',
      };
    }
    if (message === 'An internal error occurred' || res.status === 500) {
      return {
        ok: false,
        error: 'Erreur serveur au login. Vérifiez que Docker postgres/redis tournent et réessayez (le kernel peut être lent).',
      };
    }
    return { ok: false, error: message || 'Identifiants invalides' };
  },
  isEmailVerificationError: (message?: string) => {
    if (!message) {
      return false;
    }
    const lower = message.toLowerCase();
    return message.includes('EMAIL_NOT_VERIFIED') || lower.includes('not verified');
  },
  confirmMfa: async (mfaToken: string, code: string): Promise<LoginResult> => {
    const res = await client.post<any>('/auth/login/mfa/confirm', { mfaToken, code });
    if (res.ok && res.data?.token) {
      persistAuthToken(res.data.token);
      return { ok: true, token: res.data.token };
    }
    return { ok: false, error: res.data?.message || 'Code MFA invalide' };
  },
  registerOrg: (data: any) => client.post<any>('/auth/register/organizationOwner', data),
  registerFreelance: (data: {
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    city: string;
    password: string;
    planId?: string;
  }) => client.post<any>('/auth/register/freelance', data),
  registerClient: async (data: {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
  }): Promise<RegisterClientResult> => {
    const res = await client.post<Record<string, unknown>>('/auth/register/client', data);
    if (!res.ok) {
      const message = (res.data?.message as string | undefined) || 'Inscription impossible. Verifiez vos informations.';
      return { ok: false, error: message };
    }
    const body = res.data ?? {};
    if (body.emailVerificationRequired === true) {
      return {
        ok: true,
        emailVerificationRequired: true,
        message: (body.message as string) || 'Verifiez votre email avant de vous connecter.',
      };
    }
    return {
      ok: true,
      emailVerificationRequired: false,
      user: body.user as Record<string, unknown> | undefined,
    };
  },
  refresh: async (): Promise<{ ok: true; token: string } | { ok: false }> => {
    const token = await refreshSessionToken();
    return token ? { ok: true, token } : { ok: false };
  },
  setToken: (token: string) => {
    persistAuthToken(token);
    client.setAuthToken(token);
  },
  updateProfile: (data: { firstname: string; lastname: string }) =>
    client.put<Record<string, unknown>>('/api/users/profile', {
      firstname: data.firstname,
      lastname: data.lastname,
    }),

  updatePassword: (data: { oldPassword: string; newPassword: string }) =>
    client.put<unknown>('/api/users/password', {
      old_password: data.oldPassword,
      new_password: data.newPassword,
    }),
};