import { DeviceModeEnum } from '@/entities/device';

export const getDeviceName = (type: string, mode: DeviceModeEnum): string => {
  if (mode === DeviceModeEnum.MULTI) {
    return `Multi device`;
  }

  return `${type.charAt(0).toUpperCase() + type.slice(1)} device`;
};
