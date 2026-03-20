import { Device, DeviceLifecycleDtoRequest, DeviceModeEnum } from '@/entities/device';

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

export const mapDeviceToFormValues = (device: Device): DeviceFormValues => ({
  locale: device.locale ?? '',
  mode: device.mode === DeviceModeEnum.SINGLE ? DeviceModeEnum.SINGLE : DeviceModeEnum.MULTI,
  name: device.name ?? '',
  singleLinkUrl: device.targetUrl ?? '',
  type: device.type ?? '',
});

const nullIfEmpty = (value: string): string | null => value.trim() || null;

export const mapConfigureDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): DeviceLifecycleDtoRequest => ({
  locationId,
  targetMode: values.mode,
  name: nullIfEmpty(values.name),
  singleLinkUrl: values.mode === DeviceModeEnum.MULTI ? null : nullIfEmpty(values.singleLinkUrl),
});
