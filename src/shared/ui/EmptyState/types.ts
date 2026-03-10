import type { BoxProps } from '@chakra-ui/react';
import type { LucideIcon } from 'lucide-react';
import type { MouseEventHandler, ReactNode } from 'react';

interface EmptyStateActionBase {
  description?: string;
  icon?: LucideIcon;
  title: string;
}

interface EmptyStateActionLink extends EmptyStateActionBase {
  href: string;
  onClick?: never;
}

interface EmptyStateActionButton extends EmptyStateActionBase {
  href?: never;
  onClick: MouseEventHandler<HTMLElement>;
}

export type EmptyStateAction = EmptyStateActionLink | EmptyStateActionButton;

export interface EmptyStateCta {
  href?: string;
  icon?: LucideIcon;
  label: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface EmptyStateProps extends Omit<BoxProps, 'children'> {
  actionCards?: EmptyStateAction[];
  actionsTitle?: string;
  cta?: EmptyStateCta;
  description: string;
  illustration?: ReactNode;
  title: string;
}
