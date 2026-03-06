import type {
  ActivateDeviceDtoRequest,
  ConfigureDeviceDtoRequest,
  Device,
  DeviceMode,
} from '@/entities/device';
import type { DeviceFormValues } from './devices.schema';

export const deviceFormDefaultValues: DeviceFormValues = {
  locale: '',
  mode: 'multilink',
  name: '',
  singleLinkUrl: '',
  type: '',
};

const toNullable = (value: string) => {
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const mapDeviceMode = (mode: DeviceMode | null): DeviceFormValues['mode'] => {
  return mode === 'static' ? 'static' : 'multilink';
};

const mapDeviceLifecycleFormValues = (
  values: DeviceFormValues,
  locationId: string,
): ActivateDeviceDtoRequest => ({
  locale: toNullable(values.locale),
  locationId,
  mode: values.mode,
  name: toNullable(values.name),
  singleLinkUrl: values.mode === 'static' ? toNullable(values.singleLinkUrl) : null,
  type: toNullable(values.type),
});

export const mapDeviceToFormValues = (device: Device): DeviceFormValues => ({
  locale: device.locale ?? '',
  mode: mapDeviceMode(device.mode),
  name: device.name ?? '',
  singleLinkUrl: device.mode === 'static' ? (device.targetUrl ?? '') : '',
  type: device.type ?? '',
});

export const mapActivateDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): ActivateDeviceDtoRequest => mapDeviceLifecycleFormValues(values, locationId);

export const mapConfigureDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): ConfigureDeviceDtoRequest => mapDeviceLifecycleFormValues(values, locationId);
