import { DeviceModeEnum } from '@/shared/lib';

export const getPlatformLabel = (platform: string) =>
  platform.charAt(0).toUpperCase() + platform.slice(1);

export const getDeviceName = (type: string, mode: DeviceModeEnum): string => {
  if (mode === DeviceModeEnum.MULTI) {
    return `Multi device`;
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)} device`;
};
