const DEFAULT_APP_PORT = 4000;

type DeriveAppUrlInput = {
  explicitSiteUrl?: string;
  port?: number;
  publicVercelUrl?: string;
  runtimeVercelUrl?: string;
};

const normalizeVercelUrl = (value: string): string =>
  value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;

export const deriveLocalUrl = (port = DEFAULT_APP_PORT): string => `http://localhost:${port}`;

export const deriveAppUrl = ({
  explicitSiteUrl,
  port = DEFAULT_APP_PORT,
  publicVercelUrl,
  runtimeVercelUrl,
}: DeriveAppUrlInput): string => {
  if (explicitSiteUrl) {
    return explicitSiteUrl;
  }

  const resolvedVercelUrl = publicVercelUrl ?? runtimeVercelUrl;
  if (resolvedVercelUrl) {
    return normalizeVercelUrl(resolvedVercelUrl);
  }

  return deriveLocalUrl(port);
};
