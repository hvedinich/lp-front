import type { DeviceMode } from '../api/device.dto';

export interface Device {
  id: string;
  shortCode: string;
  locale: string | null;
  type: string | null;
  connectedAt: Date | null;
  status: string;
  mode: DeviceMode | null;
  targetUrl: string | null;
  accountId: string;
  locationId: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}
