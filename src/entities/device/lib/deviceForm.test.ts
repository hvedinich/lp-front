import { describe, expect, it } from 'vitest';
import {
  deviceFormDefaultValues,
  mapConfigureDeviceFormValues,
  mapDeviceToFormValues,
} from './device.mapper';
import { DeviceModeEnum } from '@/shared/lib';

describe('deviceForm', () => {
  it('provides stable default values', () => {
    expect(deviceFormDefaultValues).toEqual({
      locale: '',
      mode: DeviceModeEnum.SINGLE,
      name: '',
      singleLinkUrl: '',
      type: '',
    });
  });

  it('maps device to form values', () => {
    expect(
      mapDeviceToFormValues({
        accountId: 'acc-1',
        connectedAt: null,
        createdAt: new Date('2026-03-01T00:00:00.000Z'),
        id: 'dev-1',
        locale: 'en',
        locationId: 'loc-1',
        mode: DeviceModeEnum.SINGLE,
        name: 'Lobby',
        shortCode: 'ABCD-1234',
        status: 'active',
        targetUrl: 'https://example.com',
        type: 'tablet',
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      }),
    ).toEqual({
      locale: 'en',
      mode: DeviceModeEnum.SINGLE,
      name: 'Lobby',
      singleLinkUrl: 'https://example.com',
      type: 'tablet',
    });
  });

  it('maps activate/configure form values to lifecycle payloads', () => {
    const values = {
      locale: ' en ',
      mode: DeviceModeEnum.SINGLE,
      name: ' Lobby ',
      singleLinkUrl: ' https://example.com ',
      type: ' tablet ',
    };

    expect(mapConfigureDeviceFormValues(values, 'loc-1')).toEqual({
      locale: 'en',
      locationId: 'loc-1',
      mode: DeviceModeEnum.SINGLE,
      name: 'Lobby',
      singleLinkUrl: 'https://example.com',
      type: 'tablet',
    });

    expect(
      mapConfigureDeviceFormValues(
        {
          ...values,
          mode: DeviceModeEnum.MULTI,
          singleLinkUrl: '',
        },
        'loc-1',
      ),
    ).toEqual({
      locale: 'en',
      locationId: 'loc-1',
      mode: DeviceModeEnum.MULTI,
      name: 'Lobby',
      singleLinkUrl: null,
      type: 'tablet',
    });
  });
});
