import { Button, Icon, Stack } from '@chakra-ui/react';
import { MailWarning } from 'lucide-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { BlockHeading } from './BlockHeading';

interface EmailConflictNotificationProps {
  loginUrl: string;
}

export function EmailConflictNotification({ loginUrl }: EmailConflictNotificationProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  return (
    <Stack
      gap='6'
      alignSelf='center'
      align='center'
      w='full'
      textAlign='center'
    >
      <Icon
        asChild
        boxSize={12}
        color='orange.500'
      >
        <MailWarning />
      </Icon>

      <BlockHeading
        maxW='md'
        title={t('addDevice.emailConflict.title')}
        description={t('addDevice.emailConflict.description')}
      />

      <Button
        w='full'
        onClick={() => void router.push(loginUrl)}
      >
        {t('addDevice.emailConflict.loginButton')}
      </Button>
    </Stack>
  );
}
