import { DeviceModeEnum } from '@/shared/lib';
import type {
  ActivateDeviceDtoRequest,
  ConfigureDeviceDtoRequest,
  DeviceDto,
} from '../api/device.dto';
import type {
  ActivateMultiDevicePayload,
  ActivateSingleDevicePayload,
  Device,
  DeviceFormValues,
} from '../model/types';

export const mapDeviceDto = (dto: DeviceDto): Device => ({
  ...dto,
  connectedAt: dto.connectedAt ? new Date(dto.connectedAt) : null,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});

export const deviceFormDefaultValues: DeviceFormValues = {
  locale: '',
  mode: DeviceModeEnum.SINGLE,
  name: '',
  singleLinkUrl: '',
  type: '',
};

const toNullable = (value: string) => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const mapDeviceMode = (mode: DeviceModeEnum | null): DeviceModeEnum => {
  return mode === DeviceModeEnum.SINGLE ? DeviceModeEnum.SINGLE : DeviceModeEnum.MULTI;
};

const mapDeviceLifecycleFormValues = (
  values: DeviceFormValues,
  locationId: string,
): ActivateDeviceDtoRequest => ({
  locale: toNullable(values.locale),
  locationId,
  mode: values.mode,
  name: toNullable(values.name),
  singleLinkUrl: values.mode === DeviceModeEnum.SINGLE ? toNullable(values.singleLinkUrl) : null,
  type: toNullable(values.type),
});

export const mapDeviceToFormValues = (device: Device): DeviceFormValues => ({
  locale: device.locale ?? '',
  mode: mapDeviceMode(device.mode),
  name: device.name ?? '',
  singleLinkUrl: device.mode === DeviceModeEnum.SINGLE ? (device.targetUrl ?? '') : '',
  type: device.type ?? '',
});

export const mapConfigureDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): ConfigureDeviceDtoRequest => mapDeviceLifecycleFormValues(values, locationId);
