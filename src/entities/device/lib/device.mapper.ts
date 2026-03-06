import type { DeviceDto } from '../api/device.dto';
import type { Device } from '../model/types';

export const mapDeviceDto = (dto: DeviceDto): Device => ({
  ...dto,
  connectedAt: dto.connectedAt ? new Date(dto.connectedAt) : null,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
