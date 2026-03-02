import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function ScansPage() {
  const { t } = useTranslation('common');

  return (
    <Stack
      gap='5'
      maxW='3xl'
    >
      <Heading size='4xl'>{t('workspace.sections.scans.title')}</Heading>
      <Text color='fg.muted'>{t('workspace.sections.scans.description')}</Text>
      <Text color='fg.subtle'>{t('workspace.sections.scans.emptyState')}</Text>
    </Stack>
  );
}
