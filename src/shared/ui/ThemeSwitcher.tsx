import { Button, Popover, Stack } from '@chakra-ui/react';
import { useState } from 'react';
import { useTheme } from 'next-themes';
import { useTranslation } from 'react-i18next';
import { MoonIcon, SunIcon, SystemIcon } from './icons';

type ThemeMode = 'light' | 'system' | 'dark';

const modes: ThemeMode[] = ['light', 'system', 'dark'];

/** Renders the correct icon for a given theme mode option. */
const ModeIcon = ({ mode }: { mode: string | undefined }) => {
  if (mode === 'dark') return <MoonIcon size={14} />;
  if (mode === 'system') return <SystemIcon size={14} />;
  return <SunIcon size={14} />;
};

/**
 * ThemeSwitcher — single icon button that opens a popover with three mode options.
 *
 * Uses next-themes (the official Chakra UI v3 color mode solution).
 * `theme` reflects the user's explicit choice; next-themes resolves 'system'
 * to the actual OS preference and applies the `dark` class to <html>.
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);

  return (
    <Popover.Root
      open={open}
      onOpenChange={({ open: isOpen }) => setOpen(isOpen)}
      positioning={{ placement: 'bottom-end' }}
    >
      <Popover.Trigger asChild>
        <Button
          variant='ghost'
          size='sm'
          borderRadius='control'
          aria-label={t('theme.toggle')}
        >
          <ModeIcon mode={theme} />
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          minW='[120px]'
          p='2'
        >
          <Stack gap='1'>
            {modes.map((m) => (
              <Button
                key={m}
                variant={theme === m ? 'subtle' : 'ghost'}
                size='sm'
                justifyContent='flex-start'
                width='full'
                gap='2'
                aria-pressed={theme === m}
                onClick={() => {
                  setTheme(m);
                  setOpen(false);
                }}
              >
                <ModeIcon mode={m} />
                {t(`theme.${m}`)}
              </Button>
            ))}
          </Stack>
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}
