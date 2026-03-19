import { AuthAccountSummary, AuthUserSummary } from '@/entities/contracts';

export interface RegisterAccountPayload {
  name: string;
  region: string;
  contentLanguage: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  accountId?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name?: string;
  language?: string;
  account?: RegisterAccountPayload;
}

export type RegisterUser = AuthUserSummary;

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse extends AuthTokens {
  user: AuthUserSummary;
  accounts?: AuthAccountSummary[];
}

export interface RegisterResponse extends AuthTokens {
  user: RegisterUser;
}

export type AuthSessionState = 'authenticated' | 'unauthenticated' | 'unknown';

export interface AuthSessionUser extends AuthUserSummary {
  isSystemUser: boolean;
  language: string;
}

export interface AuthSessionAccount extends AuthAccountSummary {
  contentLanguage: string;
  region: string;
}

export interface AuthSessionPayload {
  account: AuthSessionAccount;
  user: AuthSessionUser;
}

export interface AuthSession {
  payload: AuthSessionPayload | null;
  state: AuthSessionState;
}
