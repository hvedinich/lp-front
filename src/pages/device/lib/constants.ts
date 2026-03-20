import { DeviceModeEnum } from '@/entities/device';

export const deviceModes = [
  {
    value: DeviceModeEnum.SINGLE,
    title: 'workspace.devicePage.settings.singleModeTitle',
    description: 'workspace.devicePage.settings.singleModeDescription',
  },
  {
    value: DeviceModeEnum.MULTI,
    title: 'workspace.devicePage.settings.multiModeTitle',
    description: 'workspace.devicePage.settings.multiModeDescription',
  },
];
