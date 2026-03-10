export const devicePaths = {
  public: (shortCode: string) => `/devices/public/${shortCode}`,
  activate: (id: string) => `/devices/${id}/activate`,
  onboard: '/onboarding',
} as const;
