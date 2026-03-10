export interface ApiLocation {
  id: string;
  accountId: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  timeZone: string | null;
  publicSlug: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
  };
}

export interface SessionPayload {
  user?: {
    id?: string;
    email?: string;
  };
  account?: {
    id?: string;
    role?: string;
  };
}

export interface BrowserResponse<T = unknown> {
  headers?: Record<string, string>;
  ok: boolean;
  status: number;
  payload: T | null;
}

export interface LocationSeed {
  defaultLocation: ApiLocation;
  secondaryLocation: ApiLocation;
}

export interface AuthCredentials {
  email: string;
  password: string;
}
