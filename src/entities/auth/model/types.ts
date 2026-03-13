export interface RegisterAccountPayload {
  name: string;
  region: string;
  contentLanguage: string;
}

export type AccountRole = 'owner' | 'admin' | 'member';

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

export interface AuthUserSummary {
  id: string;
  email: string;
  name: string | null;
}

export type RegisterUser = AuthUserSummary;

export interface AuthAccountSummary {
  id: string;
  name: string;
  role: AccountRole;
}

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
