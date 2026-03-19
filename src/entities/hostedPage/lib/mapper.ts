import { HostedPageDTO } from '@/entities/contracts';
import type { HostedPage, PlatformLink } from '../model/types';

export const mapHostedPageDTO = (dto: HostedPageDTO): HostedPage => ({
  id: dto.id,
  accountId: dto.accountId,
  locationId: dto.locationId,
  publishedConfig: {
    ...dto.publishedConfig,
    links: dto?.publishedConfig?.links
      ? (JSON.parse(dto.publishedConfig.links) as PlatformLink[])
      : undefined,
  },
  createdAt: dto.createdAt,
  updatedAt: dto.updatedAt,
});
