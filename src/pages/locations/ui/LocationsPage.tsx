import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function LocationsPage() {
  const { t } = useTranslation('common');

  return (
    <Stack
      gap='5'
      maxW='3xl'
    >
      <Heading size='4xl'>{t('workspace.sections.locations.title')}</Heading>
      <Text color='fg.muted'>{t('workspace.sections.locations.description')}</Text>
      <Text color='fg.subtle'>{t('workspace.sections.locations.emptyState')}</Text>
    </Stack>
  );
}
