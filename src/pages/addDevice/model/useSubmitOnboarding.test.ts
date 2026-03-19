import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceModeEnum } from '@/entities/device';
import type { UseFormReturn } from 'react-hook-form';
import { useSubmitOnboarding } from './useSubmitOnboarding';
import type { OnboardDeviceError, OnboardingFormValues } from '@/features/onboarding';

// ── Hoisted mocks ─────────────────────────────────────────────────────────────

const {
  onboardDeviceMutateAsync,
  onboardLocationMutateAsync,
  activateDeviceMock,
  setIsEmailConflict,
} = vi.hoisted(() => ({
  onboardDeviceMutateAsync: vi.fn(),
  onboardLocationMutateAsync: vi.fn(),
  activateDeviceMock: vi.fn(),
  setIsEmailConflict: vi.fn(),
}));

let capturedOnboardDeviceOnError: ((err: OnboardDeviceError) => void) | undefined;
let isOnboarding = false;
let isOnboardLocationPending = false;
let isActivatePending = false;

// ── Module mocks ──────────────────────────────────────────────────────────────

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: (_initial: unknown) => [false, setIsEmailConflict],
  };
});

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

vi.mock('next/router', () => ({
  useRouter: () => ({ isReady: true }),
}));

vi.mock('@/entities/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/auth')>();
  return {
    ...actual,
    useHasActiveSession: vi.fn(() => ({
      data: { payload: { account: { id: 'acc-1' } } },
    })),
  };
});

vi.mock('@/shared/store', () => ({
  useUiStore: (selector: (state: object) => unknown) =>
    selector({ selectedLocationIdByAccountId: { 'acc-1': 'loc-existing' } }),
}));

vi.mock('@/features/onboarding', () => ({
  useOnboardDevice: vi.fn(
    (params: { options?: { onError?: (err: OnboardDeviceError) => void } }) => {
      capturedOnboardDeviceOnError = params.options?.onError;
      return { mutateAsync: onboardDeviceMutateAsync, isPending: isOnboarding };
    },
  ),
  useOnboardLocation: vi.fn(() => ({
    mutateAsync: onboardLocationMutateAsync,
    isPending: isOnboardLocationPending,
  })),
}));

vi.mock('@/features/device-actions', () => ({
  useDeviceActions: vi.fn(() => ({
    activateDevice: activateDeviceMock,
    isActivatePending,
  })),
}));

vi.mock('../lib/helpers', () => ({
  getDeviceName: vi.fn(() => 'Google Card'),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeMethods = (values: Partial<OnboardingFormValues> = {}) =>
  ({
    getValues: vi.fn(() => ({
      googleLocation: { location: { name: 'Main Branch', address: '1 Main St' } },
      isNewLocation: false,
      user: {
        email: 'owner@example.com',
        name: 'Jan Kowalski',
        phone: '+48123456789',
        password: 'secret123',
        language: 'pl',
      },
      device: { id: 'device-1', locale: 'pl' },
      mode: DeviceModeEnum.MULTI,
      links: [{ type: 'GOOGLE', url: 'https://g.co/review' }],
      isNotify: false,
      isConsent: true,
      ...values,
    })),
  }) as unknown as UseFormReturn<OnboardingFormValues>;

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useSubmitOnboarding', () => {
  beforeEach(() => {
    onboardDeviceMutateAsync.mockReset();
    onboardLocationMutateAsync.mockReset();
    activateDeviceMock.mockReset();
    setIsEmailConflict.mockReset();
    capturedOnboardDeviceOnError = undefined;
    isOnboarding = false;
    isOnboardLocationPending = false;
    isActivatePending = false;
  });

  describe('unauthenticated flow (isAuth=false)', () => {
    it('calls onboardDevice with correctly shaped payload for MULTI mode', async () => {
      onboardDeviceMutateAsync.mockResolvedValue({});
      const onComplete = vi.fn();

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete,
      });

      await onSubmit();

      expect(onboardDeviceMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'owner@example.com',
          name: 'Jan Kowalski',
          phone: '+48123456789',
          password: 'secret123',
          account: { name: 'Jan Kowalski', region: 'pl', contentLanguage: 'pl' },
          device: { id: 'device-1', mode: DeviceModeEnum.MULTI },
          deviceName: 'Google Card',
        }),
      );
    });

    it('includes targetUrl in device payload for SINGLE mode', async () => {
      onboardDeviceMutateAsync.mockResolvedValue({});

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({
          mode: DeviceModeEnum.SINGLE,
          links: [{ type: 'google', url: 'https://g.co/review' }],
        } as Partial<OnboardingFormValues>),
        isAuth: false,
        onComplete: vi.fn(),
      });

      await onSubmit();

      expect(onboardDeviceMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          device: { id: 'device-1', mode: DeviceModeEnum.SINGLE, targetUrl: 'https://g.co/review' },
        }),
      );
    });

    it('calls onComplete after successful submission', async () => {
      onboardDeviceMutateAsync.mockResolvedValue({});
      const onComplete = vi.fn();

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete,
      });

      await onSubmit();

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('excludes links without type or url from the location payload', async () => {
      onboardDeviceMutateAsync.mockResolvedValue({});

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({
          links: [
            { type: 'google', url: 'https://g.co/review' },
            { type: '', url: 'https://example.com' },
            { type: 'facebook', url: '' },
          ] as OnboardingFormValues['links'],
        }),
        isAuth: false,
        onComplete: vi.fn(),
      });

      await onSubmit();

      const calledWith = onboardDeviceMutateAsync?.mock?.calls?.[0]?.[0];
      const parsedLinks = JSON.parse(calledWith.location.pageConfig.links);
      expect(parsedLinks).toEqual([{ type: 'google', url: 'https://g.co/review' }]);
    });
  });

  describe('authenticated flow (isAuth=true)', () => {
    it('calls onboardLocation then activateDevice with the new locationId when isNewLocation=true', async () => {
      onboardLocationMutateAsync.mockResolvedValue({ location: { id: 'loc-new' } });
      activateDeviceMock.mockResolvedValue({});

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({ isNewLocation: true }),
        isAuth: true,
        onComplete: vi.fn(),
      });

      await onSubmit();

      expect(onboardLocationMutateAsync).toHaveBeenCalledTimes(1);
      expect(activateDeviceMock).toHaveBeenCalledWith(
        { deviceId: 'device-1' },
        expect.objectContaining({ locationId: 'loc-new' }),
      );
    });

    it('skips onboardLocation and uses currentLocationId when isNewLocation=false', async () => {
      activateDeviceMock.mockResolvedValue({});

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({ isNewLocation: false }),
        isAuth: true,
        onComplete: vi.fn(),
      });

      await onSubmit();

      expect(onboardLocationMutateAsync).not.toHaveBeenCalled();
      expect(activateDeviceMock).toHaveBeenCalledWith(
        { deviceId: 'device-1' },
        expect.objectContaining({ locationId: 'loc-existing' }),
      );
    });

    it('passes singleLinkUrl to activateDevice for SINGLE mode', async () => {
      activateDeviceMock.mockResolvedValue({});

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({
          isNewLocation: false,
          mode: DeviceModeEnum.SINGLE,
          singleLinkUrl: 'https://g.co/review',
        }),
        isAuth: true,
        onComplete: vi.fn(),
      });

      await onSubmit();

      expect(activateDeviceMock).toHaveBeenCalledWith(
        { deviceId: 'device-1' },
        expect.objectContaining({
          targetMode: DeviceModeEnum.SINGLE,
          singleLinkUrl: 'https://g.co/review',
        }),
      );
    });

    it('calls onComplete after successful submission', async () => {
      activateDeviceMock.mockResolvedValue({});
      const onComplete = vi.fn();

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({ isNewLocation: false }),
        isAuth: true,
        onComplete,
      });

      await onSubmit();

      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('guard conditions', () => {
    it('returns early without calling any mutation when links is empty and isNewLocation=true', async () => {
      const onComplete = vi.fn();

      const { onSubmit } = useSubmitOnboarding({
        methods: makeMethods({
          links: [] as OnboardingFormValues['links'],
          isNewLocation: true,
        }),
        isAuth: false,
        onComplete,
      });

      await onSubmit();

      expect(onboardDeviceMutateAsync).not.toHaveBeenCalled();
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  describe('isSubmitting', () => {
    it('is true when onboardDevice is pending', () => {
      isOnboarding = true;

      const { isSubmitting } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete: vi.fn(),
      });

      expect(isSubmitting).toBe(true);
    });

    it('is true when onboardLocation is pending', () => {
      isOnboardLocationPending = true;

      const { isSubmitting } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: true,
        onComplete: vi.fn(),
      });

      expect(isSubmitting).toBe(true);
    });

    it('is true when activateDevice is pending', () => {
      isActivatePending = true;

      const { isSubmitting } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: true,
        onComplete: vi.fn(),
      });

      expect(isSubmitting).toBe(true);
    });

    it('is false when no mutation is pending', () => {
      const { isSubmitting } = useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete: vi.fn(),
      });

      expect(isSubmitting).toBe(false);
    });
  });

  describe('isEmailConflict', () => {
    it('calls the state setter with true when onboardDevice errors with CONFLICT', () => {
      useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete: vi.fn(),
      });

      capturedOnboardDeviceOnError?.({
        code: 'CONFLICT',
        message: 'Email already in use',
        issues: undefined,
      });

      expect(setIsEmailConflict).toHaveBeenCalledWith(true);
    });

    it('does not call the state setter for non-CONFLICT error codes', () => {
      useSubmitOnboarding({
        methods: makeMethods(),
        isAuth: false,
        onComplete: vi.fn(),
      });

      capturedOnboardDeviceOnError?.({
        code: 'NETWORK',
        message: 'Network error',
        issues: undefined,
      });

      expect(setIsEmailConflict).not.toHaveBeenCalled();
    });
  });
});
