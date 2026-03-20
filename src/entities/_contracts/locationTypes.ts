export interface LocationPayload {
  name: string;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  timeZone?: string | null;
  publicSlug?: string;
  pageConfig?: Record<string, unknown>;
}
