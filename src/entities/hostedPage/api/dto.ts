interface PublishedConfigValueDTO {
  links?: string;
  [key: string]: string | undefined;
}
export interface HostedPageDTO {
  id: string;
  accountId: string;
  locationId: string;
  publishedConfig: PublishedConfigValueDTO;
  createdAt: string;
  updatedAt: string;
}
