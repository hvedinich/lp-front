import { describe, expect, it } from 'vitest';
import { normalizeLocationFromPlace } from './normalizeLocation';
import type { PlaceDetails } from './google-places.types';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeDetails = (overrides: Partial<PlaceDetails> = {}): PlaceDetails => ({
  placeId: 'place-1',
  name: 'Acme HQ',
  formattedAddress: '1 Main St, Warsaw',
  ...overrides,
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('normalizeLocationFromPlace', () => {
  it('maps name and placeId from the details', () => {
    const result = normalizeLocationFromPlace(makeDetails({ name: 'Beta Corp', placeId: 'p-42' }));

    expect(result.name).toBe('Beta Corp');
    expect(result.placeId).toBe('p-42');
  });

  it('maps formattedAddress to address', () => {
    const result = normalizeLocationFromPlace(
      makeDetails({ formattedAddress: '5 Baker Street, London' }),
    );

    expect(result.address).toBe('5 Baker Street, London');
  });

  it('falls back to empty string when formattedAddress is undefined', () => {
    const result = normalizeLocationFromPlace(makeDetails({ formattedAddress: undefined }));

    expect(result.address).toBe('');
  });

  it('strips non-numeric characters from phone, keeping the leading +', () => {
    const result = normalizeLocationFromPlace(makeDetails({ phone: '+48 (123) 456-789' }));

    expect(result.phone).toBe('+48123456789');
  });

  it('strips parentheses, spaces, and dashes from phone', () => {
    const result = normalizeLocationFromPlace(makeDetails({ phone: '(12) 345-6789' }));

    expect(result.phone).toBe('123456789');
  });

  it('omits phone from the result when details.phone is absent', () => {
    const result = normalizeLocationFromPlace(makeDetails({ phone: undefined }));

    expect(result).not.toHaveProperty('phone');
  });

  it('maps website when present', () => {
    const result = normalizeLocationFromPlace(makeDetails({ website: 'https://acme.com' }));

    expect(result.website).toBe('https://acme.com');
  });

  it('omits website from the result when details.website is absent', () => {
    const result = normalizeLocationFromPlace(makeDetails({ website: undefined }));

    expect(result).not.toHaveProperty('website');
  });

  it('returns the complete normalized object for a fully-populated details input', () => {
    const details = makeDetails({
      placeId: 'place-full',
      name: 'Full Corp',
      formattedAddress: '99 Elm St',
      phone: '+1 (800) 555-0199',
      website: 'https://full.com',
    });

    expect(normalizeLocationFromPlace(details)).toEqual({
      placeId: 'place-full',
      name: 'Full Corp',
      address: '99 Elm St',
      phone: '+18005550199',
      website: 'https://full.com',
    });
  });
});
