import { Device, DeviceLifecycleDtoRequest, DeviceModeEnum } from '@/entities/device';

export interface DeviceFormValues {
  mode: DeviceModeEnum;
  name: string;
  singleLinkUrl?: string;
}

export const deviceFormDefaultValues: DeviceFormValues = {
  mode: DeviceModeEnum.SINGLE,
  name: '',
  singleLinkUrl: '',
};

const mapDeviceMode = (mode: DeviceModeEnum | null): DeviceModeEnum => {
  return mode === DeviceModeEnum.SINGLE ? DeviceModeEnum.SINGLE : DeviceModeEnum.MULTI;
};

export const mapDeviceToFormValues = (device: Device): DeviceFormValues => ({
  mode: mapDeviceMode(device.mode),
  name: device.name ?? '',
  singleLinkUrl: device.targetUrl ?? '',
});

export const mapConfigureDeviceFormValues = (
  values: DeviceFormValues,
  locationId: string,
): DeviceLifecycleDtoRequest => {
  const input: DeviceLifecycleDtoRequest = {
    locationId,
    targetMode: values.mode,
    name: values.name,
  };

  if (values.mode === DeviceModeEnum.SINGLE && !!values?.singleLinkUrl) {
    input.singleLinkUrl = values.singleLinkUrl;
  }

  return input;
};
