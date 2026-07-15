import type { LanguageCode } from '@/lib/i18n';

export const AUTH_SESSION_KEY = 'km-auth-session-v1';
export const AUTH_ACCOUNTS_KEY = 'km-auth-accounts-v1';

export type AuthSession = {
  mode: 'user' | 'demo';
  identifier: string;
  name: string;
  language: LanguageCode;
  createdAt: string;
};

type LocalAccount = {
  identifier: string;
  password: string;
  name: string;
  language: LanguageCode;
};

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function readAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    return session?.identifier && session?.mode ? session : null;
  } catch {
    return null;
  }
}

export function writeAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

export function readLocalAccounts(): LocalAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const accounts = JSON.parse(window.localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]') as LocalAccount[];
    return Array.isArray(accounts) ? accounts : [];
  } catch {
    return [];
  }
}

export function saveLocalAccount(account: LocalAccount): void {
  if (typeof window === 'undefined') return;
  const normalized = normalizeIdentifier(account.identifier);
  const next = readLocalAccounts().filter((item) => normalizeIdentifier(item.identifier) !== normalized);
  next.push({ ...account, identifier: normalized });
  window.localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(next));
}

export function verifyLocalAccount(identifier: string, password: string): LocalAccount | null {
  const normalized = normalizeIdentifier(identifier);
  return readLocalAccounts().find((account) => normalizeIdentifier(account.identifier) === normalized && account.password === password) ?? null;
}

export function createSession(options: { mode: 'user' | 'demo'; identifier: string; name?: string; language: LanguageCode }): AuthSession {
  return {
    mode: options.mode,
    identifier: normalizeIdentifier(options.identifier),
    name: options.name || (options.mode === 'demo' ? 'Asha Pawar' : 'Kisan'),
    language: options.language,
    createdAt: new Date().toISOString(),
  };
}
