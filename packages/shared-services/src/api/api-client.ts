// FILE: packages/shared-services/src/api/api-client.ts
import { getStoredToken, clearAuthSession, touchAuthActivity } from '../auth/auth-session';

export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiClient {
  private headers: Record<string, string>;
  private memoryToken: string | null = null;

  constructor(_config?: { baseUrl?: string }) {
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  private resolveBaseUrl(): string {
    return getDynamicBaseUrl();
  }

  setAuthToken(token: string): void {
    this.memoryToken = token.trim();
    this.headers['Authorization'] = `Bearer ${this.memoryToken}`;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<ApiResponse<T>> {
    // 1. Construction de l'URL
    // Si l'endpoint commence par /, on l'enlève pour éviter les doubles slashs
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
    const url = `${this.resolveBaseUrl()}/${cleanEndpoint}`;

    // 2. Récupération dynamique du token
    const storedToken = getStoredToken();
    this.memoryToken = storedToken;
    if (storedToken) {
      this.headers['Authorization'] = `Bearer ${storedToken.trim()}`;
    } else {
      delete this.headers['Authorization'];
    }
    const token = storedToken;
    
    const requestHeaders: Record<string, string> = { 
      ...this.headers,
      'Accept': '*/*', // Aligné sur Swagger
    };

    const needsAuthHeader =
      Boolean(token) &&
      (!cleanEndpoint.startsWith('auth/') || cleanEndpoint === 'auth/refresh');
    if (needsAuthHeader && token) {
      requestHeaders['Authorization'] = `Bearer ${token.trim()}`;
    }

    let body: any;
    if (data instanceof FormData) {
      delete requestHeaders['Content-Type'];
      body = data; 
    } else if (data) {
      body = JSON.stringify(data);
    }

    try {
      const isMultipart = data instanceof FormData;
      const controller = new AbortController();
      const timeoutMs = isMultipart ? 180_000 : 60_000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 204) return { data: {} as T, status: 204, ok: true };

      const responseData = await response.json().catch(() => null);

      if (!response.ok && response.status === 401 && typeof window !== 'undefined') {
        this.memoryToken = null;
        clearAuthSession();
      }

      if (!response.ok) {
        this.handleUnauthorized(response.status);
      }

      if (response.ok && token) {
        touchAuthActivity();
      }

      return {
        data: responseData,
        status: response.status,
        ok: response.ok,
      };
    } catch (error) {
      const aborted = error instanceof DOMException && error.name === 'AbortError';
      return {
        data: { message: aborted ? 'Délai dépassé lors de l’envoi du fichier. Réduisez la taille ou réessayez.' : 'Erreur réseau' } as any,
        status: 0,
        ok: false,
      };
    }
  }

  private handleUnauthorized(status: number): void {
    if (status !== 401 || typeof window === 'undefined') {
      return;
    }
    this.memoryToken = null;
    clearAuthSession();
    window.dispatchEvent(new CustomEvent('auth:session-expired'));
  }

  async get<T>(e: string) { return this.request<T>('GET', e); }
  async post<T>(e: string, d: unknown) { return this.request<T>('POST', e, d); }
  async put<T>(e: string, d: unknown) { return this.request<T>('PUT', e, d); }
  async patch<T>(e: string, d: unknown) { return this.request<T>('PATCH', e, d); }
  async delete<T>(e: string) { return this.request<T>('DELETE', e); }
}

/**
 * Détecte si on est sur /agency ou /organisation pour taper le bon proxy local.
 * Peut être forcé via configureApiBaseUrl (ex. mfe-admin).
 */
let apiBaseOverride: string | null = null;

export function configureApiBaseUrl(baseUrl: string): void {
  apiBaseOverride = baseUrl.replace(/\/$/, '');
}

const getDynamicBaseUrl = () => {
  if (apiBaseOverride) {
    return apiBaseOverride;
  }

  if (typeof window === 'undefined') {
    return '/api-rental';
  }

  const path = window.location.pathname;
  const port = window.location.port;

  if (path.startsWith('/client')) return '/client/api-rental';
  if (path.startsWith('/agency')) return '/agency/api-rental';
  if (path.startsWith('/organisation')) return '/organisation/api-rental';
  if (path.startsWith('/admin') || port === '3004') return '/admin/api-rental';

  return '/api-rental';
};

export const defaultClient = new ApiClient();

/**
 * Fonction utilitaire pour créer de nouvelles instances si nécessaire
 */
export function createApiClient(_baseUrl?: string): ApiClient {
  return new ApiClient();
}