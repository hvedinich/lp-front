import type { LocationDto } from '../api/location.dto';
import type { Location } from '../model/types';

export const mapLocationDto = (dto: LocationDto): Location => ({
  ...dto,
  createdAt: new Date(dto.createdAt),
  updatedAt: new Date(dto.updatedAt),
});
