import { Button, Stack } from '@chakra-ui/react';
import { navSectionIcons } from '../model/navIcons';
import { type WorkspaceSection } from '../model/navigation';

interface NavButtonsProps {
  sections: readonly WorkspaceSection[];
  activeSection: WorkspaceSection;
  collapsed: boolean;
  onSelect: (section: WorkspaceSection) => void;
  getLabel: (section: WorkspaceSection) => string;
}

export function NavButtons({
  sections,
  activeSection,
  collapsed,
  onSelect,
  getLabel,
}: NavButtonsProps) {
  return (
    <Stack gap='1'>
      {sections.map((section) => {
        const isActive = section === activeSection;
        const Icon = navSectionIcons[section];
        const label = getLabel(section);

        if (collapsed) {
          return (
            <Button
              key={section}
              variant='ghost'
              size='sm'
              justifyContent='center'
              width='full'
              p='2'
              bg={isActive ? 'bg.subtle' : undefined}
              color={isActive ? 'fg.brand' : 'fg.muted'}
              onClick={() => onSelect(section)}
              aria-label={label}
            >
              <Icon size={18} />
            </Button>
          );
        }

        return (
          <Button
            key={section}
            variant='ghost'
            size='sm'
            justifyContent='flex-start'
            width='full'
            gap='3'
            bg={isActive ? 'bg.subtle' : undefined}
            color={isActive ? 'fg.brand' : 'fg.muted'}
            fontWeight={isActive ? 'semibold' : 'normal'}
            onClick={() => onSelect(section)}
          >
            <Icon size={18} />
            {label}
          </Button>
        );
      })}
    </Stack>
  );
}
