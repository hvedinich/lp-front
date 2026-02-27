import type { LucideIcon } from 'lucide-react';
import { CampaignsIcon, LocationsIcon, ReviewsIcon, ScansIcon, SurveysIcon } from '@/shared/ui';
import { type WorkspaceSection } from './navigation';

/** Maps each workspace section to its sidebar nav icon component. */
export const navSectionIcons: Record<WorkspaceSection, LucideIcon> = {
  reviews: ReviewsIcon,
  surveys: SurveysIcon,
  scans: ScansIcon,
  campaigns: CampaignsIcon,
  locations: LocationsIcon,
};
