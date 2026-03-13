export const hostedPageQueryKeys = {
  byLocation: (locationId: string) => ['hostedPages', locationId] as const,
} as const;
