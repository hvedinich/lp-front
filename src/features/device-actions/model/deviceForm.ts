import { Device, DeviceLifecycleDtoRequest, DeviceModeEnum } from '@/entities/device';
import { toNullable } from '@/shared/lib';

export interface DeviceFormValues {
  locale: string;
  mode: DeviceModeEnum;
  name: string;
  singleLinkUrl: string;
  type: string;
}

export const deviceFormDefaultValues: DeviceFormValues = {
  locale: '',
  mode: DeviceModeEnum.SINGLE,
  name: '',
  singleLinkUrl: '',
  type: '',
};

const mapDeviceMode = (mode: DeviceModeEnum | null): DeviceModeEnum => {
  return mode === DeviceModeEnum.SINGLE ? DeviceModeEnum.SINGLE : DeviceModeEnum.MULTI;
};

const mapDeviceLifecycleFormValues = (
  values: DeviceFormValues,
  locationId: string,
): DeviceLifecycleDtoRequest => ({
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
  singleLinkUrl: device.targetUrl ?? '',
  type: device.type ?? '',
});

export const mapConfigureDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): DeviceLifecycleDtoRequest => mapDeviceLifecycleFormValues(values, locationId);
