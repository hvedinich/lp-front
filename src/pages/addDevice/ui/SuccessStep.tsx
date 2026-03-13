import { Button, Stack, Flex, Text, List, Card, Icon, FlexProps } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { BlockHeading } from './BlockHeading';
import { InfoIcon } from 'lucide-react';
import { DoneIcon } from '@/shared/ui';

interface SuccessStepProps {
  deviceId: string;
}

const SuccessStep = ({ deviceId }: SuccessStepProps) => {
  const { t } = useTranslation('common');
  const router = useRouter();

  const handleGoToDevice = async () => {
    await router.push(`/devices/${deviceId}`);
  };

  const isScanned = false;

  return (
    <Stack
      gap='6'
      alignSelf='center'
      align='center'
      w='full'
      textAlign='center'
    >
      <BlockHeading
        maxW='md'
        title={t('addDevice.success.title')}
        description={t('addDevice.success.description')}
      />

      <Flex
        flexDir='column'
        gap='2'
        w='full'
      >
        <InfoBlock text={t('addDevice.success.activatedText')} />
        <InfoBlock text={t('addDevice.success.reportText')} />

        <InfoBlock
          alignItems='start'
          justifyContent='start'
          color={isScanned ? 'green.800' : 'gray.muted'}
        >
          <Flex
            flexDir='column'
            gap='1'
            lineHeight='short'
            textAlign='left'
          >
            <Text
              fontSize='lg'
              fontWeight='medium'
            >
              {t('addDevice.success.testText')}
            </Text>
            <Text
              fontSize='sm'
              maxW='xs'
            >
              {t('addDevice.success.testDescription')}
            </Text>
            <List.Root
              as='ol'
              fontSize='sm'
              fontWeight='semibold'
            >
              <List.Item>{t('addDevice.success.testStep1')}</List.Item>
              <List.Item>{t('addDevice.success.testStep2')}</List.Item>
            </List.Root>
          </Flex>
        </InfoBlock>
      </Flex>

      <Card.Root
        alignItems='center'
        flexDir='row'
        gap='2'
        p='4'
        w='full'
        variant='outline'
        borderRadius='2xl'
      >
        <Icon
          asChild
          boxSize={4}
        >
          <InfoIcon />
        </Icon>
        <Text fontSize='sm'>{t('addDevice.success.editText')}</Text>
      </Card.Root>

      <Button
        w='full'
        onClick={() => void handleGoToDevice()}
      >
        {t('commonActions.finish')}
      </Button>
    </Stack>
  );
};

interface InfoBlockProps extends FlexProps {
  text?: string;
}

function InfoBlock({ text, color = 'green.800', children, ...props }: InfoBlockProps) {
  return (
    <Flex
      alignItems='center'
      gap='2'
      {...props}
    >
      <DoneIcon
        boxSize={6}
        color={color}
      />
      {children || (
        <Text
          fontSize='lg'
          fontWeight='medium'
        >
          {text}
        </Text>
      )}
    </Flex>
  );
}

export default SuccessStep;
