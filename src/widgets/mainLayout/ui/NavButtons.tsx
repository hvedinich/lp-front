import { Box, Button, Stack, StackProps } from '@chakra-ui/react';
import { AppIcon } from '@/shared/ui';
import { type NavItem } from '../model/navigation';

interface NavButtonsProps extends Omit<StackProps, 'children' | 'onSelect'> {
  items: readonly NavItem[];
  activePath: string;
  collapsed: boolean;
  fadeLabels?: boolean;
  onSelect: (item: NavItem) => void;
  getLabel: (item: NavItem) => string;
}

export function NavButtons({
  items,
  activePath,
  collapsed,
  fadeLabels = false,
  onSelect,
  getLabel,
  ...stackProps
}: NavButtonsProps) {
  return (
    <Stack
      gap='1'
      {...stackProps}
    >
      {items.map((item) => {
        const isActive = item.path === '/' ? activePath === '/' : activePath.startsWith(item.path);
        const label = getLabel(item);

        if (collapsed) {
          return (
            <Button
              key={item.key}
              variant='ghost'
              size='sm'
              justifyContent='center'
              width='full'
              bg={isActive ? 'bg.subtle' : undefined}
              color={isActive ? 'fg.brand' : 'fg.muted'}
              onClick={() => onSelect(item)}
              aria-label={label}
            >
              <AppIcon
                icon={item.icon}
                size={18}
              />
            </Button>
          );
        }

        return (
          <Button
            key={item.key}
            variant='ghost'
            size='sm'
            justifyContent='flex-start'
            width='full'
            gap='3'
            bg={isActive ? 'bg.subtle' : undefined}
            color={isActive ? 'fg.brand' : 'fg.muted'}
            fontWeight={isActive ? 'semibold' : 'normal'}
            onClick={() => onSelect(item)}
          >
            <AppIcon
              icon={item.icon}
              size={18}
            />
            <Box
              as='span'
              whiteSpace='nowrap'
              style={{
                opacity: fadeLabels ? 0 : 1,
                transition: 'opacity 120ms ease',
              }}
            >
              {label}
            </Box>
          </Button>
        );
      })}
    </Stack>
  );
}
