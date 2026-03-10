interface LocationBase {
  name: string;
  publicSlug: string;
  phone: string | null;
  website: string | null;
  address: string | null;
  timeZone: string | null;
  isDefault: boolean;
}
export interface PublicLocation extends LocationBase {
  id: string;
}

export interface Location extends PublicLocation {
  accountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationFormValues {
  name: string;
  phone: string;
  website: string;
  address: string;
  timeZone: string;
  publicSlug: string;
  isDefault: boolean;
}
