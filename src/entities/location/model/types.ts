export interface Location {
  id: string;
  accountId: string;
  name: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  timeZone: string | null;
  publicSlug: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}
