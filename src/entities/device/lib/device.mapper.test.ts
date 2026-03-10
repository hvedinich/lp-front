import { DeviceModeEnum } from '@/shared/lib';
import { mapDeviceDto } from './device.mapper';
import { DeviceStatus } from '../model/types';

describe('mapDeviceDto', () => {
  it('maps dto fields and converts date strings to Date', () => {
    const dto = {
      accountId: 'acc-1',
      connectedAt: '2026-03-01T09:00:00.000Z',
      createdAt: '2026-03-01T10:00:00.000Z',
      id: 'dev-1',
      locale: 'en',
      locationId: 'loc-1',
      mode: DeviceModeEnum.MULTI,
      name: 'Lobby screen',
      shortCode: 'ABCD-1234',
      status: 'active' as DeviceStatus,
      targetUrl: 'https://example.com/reviews',
      type: 'tv',
      updatedAt: '2026-03-02T10:00:00.000Z',
    };

    const result = mapDeviceDto(dto);

    expect(result).toEqual({
      ...dto,
      connectedAt: new Date(dto.connectedAt),
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
    expect(result.connectedAt).toBeInstanceOf(Date);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('keeps nullable connectedAt as null and invalid dates as Invalid Date', () => {
    const result = mapDeviceDto({
      accountId: 'acc-1',
      connectedAt: null,
      createdAt: 'not-a-date',
      id: 'dev-1',
      locale: '',
      locationId: 'loc-1',
      mode: null,
      name: null,
      shortCode: 'ABCD-1234',
      status: 'disabled',
      targetUrl: null,
      type: null,
      updatedAt: 'also-not-a-date',
    });

    expect(result.connectedAt).toBe(null);
    expect(Number.isNaN(result.createdAt.getTime())).toBe(true);
    expect(Number.isNaN(result.updatedAt.getTime())).toBe(true);
  });
});
