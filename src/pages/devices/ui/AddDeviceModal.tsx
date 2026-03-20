import { Button, Card, Heading, Stack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLink, InputField, Modal, toaster } from '@/shared/ui';
import { FormProvider } from 'react-hook-form';
import { Keyboard, Link as LinkIcon, Scan } from 'lucide-react';
import { envApp } from '@/shared/config';
import { useCheckPublicDevice } from '../lib/useCheckPublicDevice';
import { useZodForm } from '@/shared/lib';
import z from 'zod';

const STORE_URL = `${envApp.app.landingUrl}/store/products`;

interface AddDeviceFormValues {
  deviceCode: string | undefined;
}

const formSchema = z.object({
  deviceCode: z.string().trim().optional().default(''),
});

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export function AddDeviceModal({ open, onOpenChange }: AddDeviceModalProps) {
  const { t } = useTranslation('common');
  const router = useRouter();

  const methods = useZodForm<AddDeviceFormValues>({
    schema: formSchema,
    mode: 'onBlur',
    defaultValues: { deviceCode: '' },
  });

  const { query: deviceQuery, pendingCode, check, message, isChecking } = useCheckPublicDevice();

  useEffect(() => {
    if (!pendingCode || deviceQuery.fetchStatus === 'fetching') return;

    if (deviceQuery.isError || deviceQuery?.data?.status !== 'unconfigured') {
      toaster.error({ description: message });
      return;
    }

    if (deviceQuery.isSuccess) {
      void router.push(`/add-device?id=${pendingCode}`);
    }
  }, [
    pendingCode,
    deviceQuery.fetchStatus,
    deviceQuery?.data?.status,
    deviceQuery.isError,
    deviceQuery.isSuccess,
    message,
    router,
  ]);

  const onSubmit = ({ deviceCode }: AddDeviceFormValues) => {
    const code = deviceCode?.trim();
    if (!code) return;
    check(code);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={t('workspace.devicesPage.addDeviceModal.title')}
    >
      <Stack gap='4'>
        <Card.Root
          gap='0.5'
          p='4'
        >
          <Stack direction='row'>
            <Scan style={{ width: '16' }} />
            <Heading size='md'>{t('workspace.devicesPage.addDeviceModal.scanTitle')}</Heading>
          </Stack>

          <Text
            fontSize='sm'
            color='fg.muted'
          >
            {t('workspace.devicesPage.addDeviceModal.scanDescription')}
          </Text>
        </Card.Root>

        <AppLink
          href={STORE_URL}
          target='_blank'
        >
          <Card.Root
            gap='0.5'
            p='4'
            position='relative'
          >
            <Stack direction='row'>
              <LinkIcon style={{ width: '16' }} />
              <Heading size='md'>{t('workspace.devicesPage.addDeviceModal.orderTitle')}</Heading>
            </Stack>
            <Text
              fontSize='sm'
              color='fg.muted'
            >
              {t('workspace.devicesPage.addDeviceModal.orderDescription')}
            </Text>
          </Card.Root>
        </AppLink>

        <Card.Root
          p='4'
          gap='0.5'
        >
          <Stack direction='row'>
            <Keyboard style={{ width: '16' }} />
            <Heading size='md'>{t('workspace.devicesPage.addDeviceModal.manualTitle')}</Heading>
          </Stack>

          <FormProvider {...methods}>
            <Stack direction='row'>
              <InputField
                size='sm'
                placeholder={t('workspace.devicesPage.addDeviceModal.codePlaceholder')}
                name='deviceCode'
              />
              <Button
                size='sm'
                loading={isChecking}
                onClick={() => methods.handleSubmit(onSubmit)()}
              >
                {t('commonActions.continue')}
              </Button>
            </Stack>
          </FormProvider>
        </Card.Root>
        <Button
          mt='2'
          asChild
          variant='outline'
        >
          <AppLink
            target='_blank'
            href={STORE_URL}
            _hover={{ textDecoration: 'none' }}
          >
            {t('workspace.devicesPage.addDeviceModal.shopButton')}
          </AppLink>
        </Button>
      </Stack>
    </Modal>
  );
}
