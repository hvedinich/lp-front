type AccountRole = 'owner' | 'admin' | 'member';

export interface AuthUserSummary {
  id: string;
  email: string;
  name: string | null;
}

export interface AuthAccountSummary {
  id: string;
  name: string;
  role: AccountRole;
}
