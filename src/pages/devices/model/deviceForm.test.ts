import { describe, expect, it } from 'vitest';
import {
  deviceFormDefaultValues,
  mapActivateDeviceFormValues,
  mapConfigureDeviceFormValues,
  mapDeviceToFormValues,
} from './deviceForm';

describe('deviceForm', () => {
  it('provides stable default values', () => {
    expect(deviceFormDefaultValues).toEqual({
      locale: '',
      mode: 'multilink',
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
        mode: 'static',
        name: 'Lobby',
        shortCode: 'ABCD-1234',
        status: 'active',
        targetUrl: 'https://example.com',
        type: 'tablet',
        updatedAt: new Date('2026-03-02T00:00:00.000Z'),
      }),
    ).toEqual({
      locale: 'en',
      mode: 'static',
      name: 'Lobby',
      singleLinkUrl: 'https://example.com',
      type: 'tablet',
    });
  });

  it('maps activate/configure form values to lifecycle payloads', () => {
    const values = {
      locale: ' en ',
      mode: 'static' as const,
      name: ' Lobby ',
      singleLinkUrl: ' https://example.com ',
      type: ' tablet ',
    };

    expect(mapActivateDeviceFormValues(values, 'loc-1')).toEqual({
      locale: 'en',
      locationId: 'loc-1',
      mode: 'static',
      name: 'Lobby',
      singleLinkUrl: 'https://example.com',
      type: 'tablet',
    });

    expect(
      mapConfigureDeviceFormValues(
        {
          ...values,
          mode: 'multilink',
          singleLinkUrl: '',
        },
        'loc-1',
      ),
    ).toEqual({
      locale: 'en',
      locationId: 'loc-1',
      mode: 'multilink',
      name: 'Lobby',
      singleLinkUrl: null,
      type: 'tablet',
    });
  });
});
