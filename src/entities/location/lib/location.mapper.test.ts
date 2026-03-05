import { mapLocationDto } from './location.mapper';

describe('mapLocationDto', () => {
  it('maps dto fields and converts date strings to Date', () => {
    const dto = {
      accountId: 'acc-1',
      address: 'Road 1',
      createdAt: '2026-03-01T10:00:00.000Z',
      id: 'loc-1',
      isDefault: true,
      name: 'Main office',
      phone: '+1000000000',
      publicSlug: 'main-office',
      timeZone: 'Europe/Warsaw',
      updatedAt: '2026-03-02T10:00:00.000Z',
      website: 'https://example.com',
    };

    const result = mapLocationDto(dto);

    expect(result).toEqual({
      ...dto,
      createdAt: new Date(dto.createdAt),
      updatedAt: new Date(dto.updatedAt),
    });
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('keeps invalid date input as Invalid Date instance', () => {
    const result = mapLocationDto({
      accountId: 'acc-1',
      address: null,
      createdAt: 'not-a-date',
      id: 'loc-1',
      isDefault: false,
      name: 'Branch',
      phone: null,
      publicSlug: 'branch',
      timeZone: null,
      updatedAt: 'also-not-a-date',
      website: null,
    });

    expect(Number.isNaN(result.createdAt.getTime())).toBe(true);
    expect(Number.isNaN(result.updatedAt.getTime())).toBe(true);
  });
});
