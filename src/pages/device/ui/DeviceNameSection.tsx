import { Heading, Stack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import type { Control } from 'react-hook-form';
import { InputField } from '@/shared/ui';
import type { DeviceSettingsFormValues } from '../lib/schema';

interface DeviceNameSectionProps {
  control: Control<DeviceSettingsFormValues>;
}

export function DeviceNameSection({ control }: DeviceNameSectionProps) {
  const { t } = useTranslation('common');
  return (
    <Stack gap='2'>
      <Heading size='sm'>{t('Device name')}</Heading>
      <InputField
        control={control}
        name='device.name'
      />
    </Stack>
  );
}
