export type {
  ActivateDeviceDtoRequest,
  ConfigureDeviceDtoRequest,
  DeviceDto,
  DeviceListFilters,
  DeviceMode,
  GetDevicesParams,
} from './api/device.dto';
export type { DeviceError, DeviceErrorCode } from './model/errors';
export { useActivateDevice, type ActivateDeviceVariables } from './model/useActivateDevice';
export { useConfigureDevice, type ConfigureDeviceVariables } from './model/useConfigureDevice';
export { useDeactivateDevice, type DeactivateDeviceVariables } from './model/useDeactivateDevice';
export { useDeviceById } from './model/useDeviceById';
export { useDevices } from './model/useDevices';
export type {
  Device,
  DeviceType,
  ActivateSingleDevicePayload,
  ActivateMultiDevicePayload,
} from './model/types';
export { deviceQueryKeys } from './model/queryKeys';
export { usePublicDevice } from './model/usePublicDevice';
export { getDeviceName } from './lib/utils';
