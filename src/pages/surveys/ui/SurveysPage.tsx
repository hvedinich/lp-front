import { Heading, Stack, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function SurveysPage() {
  const { t } = useTranslation('common');

  return (
    <Stack
      gap='5'
      maxW='3xl'
    >
      <Heading size='4xl'>{t('workspace.sections.surveys.title')}</Heading>
      <Text color='fg.muted'>{t('workspace.sections.surveys.description')}</Text>
      <Text color='fg.subtle'>{t('workspace.sections.surveys.emptyState')}</Text>
    </Stack>
  );
}
