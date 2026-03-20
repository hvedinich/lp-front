import { Flex, Heading, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { SelectOptionCard } from '@/shared/ui';
import { deviceModes } from '../lib/constants';
import { useFormContext } from 'react-hook-form';

export function DeviceModeSection() {
  const { t } = useTranslation('common');
  const { setValue, getValues } = useFormContext();

  const currentMode = getValues('device.mode');

  return (
    <Stack gap='2'>
      <Heading size='sm'>{t('workspace.devicePage.settings.modeTitle')}</Heading>
      <Flex
        gap='3'
        direction={{ base: 'column', md: 'row' }}
      >
        {deviceModes.map(({ value, title, description }) => (
          <SelectOptionCard
            key={value}
            data-testid={`device-mode-${value}`}
            data-selected={currentMode === value ? true : undefined}
            isSelected={currentMode === value}
            onSelect={() => setValue('device.mode', value, { shouldDirty: true })}
            title={t(title)}
            minH='full'
            bg='bg'
            description={t(description)}
          />
        ))}
      </Flex>
    </Stack>
  );
}
