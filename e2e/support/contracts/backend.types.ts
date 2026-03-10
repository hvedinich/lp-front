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
  account?: {
    role?: string;
  };
}

export interface BrowserResponse<T = unknown> {
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
