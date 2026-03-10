import { ALL_PLATFORMS, REVIEW_PLATFORMS } from '@/shared/lib';
import { z } from 'zod';

export const platformLinkSchema = z.object({
  type: z.string().min(1, 'Select a platform'),
  url: z.string().min(1, 'URL is required').url('Enter a valid URL'),
});

export const reviewPlatformLinkSchema = z.object({
  type: z.enum(REVIEW_PLATFORMS as [string, ...string[]], {
    error: 'Select a review platform',
  }),
  url: z.string().min(1, 'URL is required').url('Enter a valid URL'),
});

export const locationSchema = z.object({
  id: z.string(),
  name: z.string(),
  address: z.string(),
  placeId: z.string(),
  links: z.array(platformLinkSchema),
});

export const userSchema = z.object({
  email: z.string(),
  name: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
  language: z.string(),
});

export const onboardingSchema = z.object({
  location: locationSchema,
  mode: z.string(),
  user: userSchema,
});

export const allPlatformsEnum = ALL_PLATFORMS as [string, ...string[]];
export const reviewPlatformsEnum = REVIEW_PLATFORMS as [string, ...string[]];
