import * as Sentry from '@sentry/nextjs';
import { Box, Button, Code, Grid, Heading, HStack, Separator, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toaster } from '@/shared/ui';

export default function SurveysPage() {
  const { t } = useTranslation('common');
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [renderCrashArmed, setRenderCrashArmed] = useState(false);

  if (renderCrashArmed) {
    throw new Error('Sentry manual client render test error');
  }

  const setResult = (value: string) => {
    setLastResult(value);
  };

  const notify = (titleKey: string, descriptionKey: string) => {
    toaster.create({
      title: t(titleKey),
      description: t(descriptionKey),
      type: 'info',
    });
  };

  const runClientCapture = () => {
    Sentry.captureException(new Error('Sentry manual client captured test error'));
    setResult('client:capture');
    notify(
      'workspace.surveysPage.sentryLab.notifications.clientCaptureTitle',
      'workspace.surveysPage.sentryLab.notifications.clientCaptureDescription',
    );
  };

  const runClientUnhandled = () => {
    setResult('client:unhandled');
    notify(
      'workspace.surveysPage.sentryLab.notifications.clientUnhandledTitle',
      'workspace.surveysPage.sentryLab.notifications.clientUnhandledDescription',
    );

    window.setTimeout(() => {
      throw new Error('Sentry manual client unhandled test error');
    }, 0);
  };

  const runClientRender = () => {
    setResult('client:render');
    setRenderCrashArmed(true);
  };

  const runApiScenario = async (runtime: 'node' | 'edge', mode: 'capture' | 'throw') => {
    const url = `/api/sentry/${runtime}?mode=${mode}`;

    try {
      const response = await fetch(url);
      setResult(`${runtime}:${mode}:${response.status}`);
    } catch {
      setResult(`${runtime}:${mode}:network-error`);
    }

    notify(
      'workspace.surveysPage.sentryLab.notifications.serverTriggerTitle',
      'workspace.surveysPage.sentryLab.notifications.serverTriggerDescription',
    );
  };

  const runSsrError = () => {
    setResult('ssr:throw');
    window.location.assign('/surveys?sentry=ssr-throw');
  };

  return (
    <Stack
      gap='5'
      maxW='5xl'
    >
      <Heading size='4xl'>{t('workspace.sections.surveys.title')}</Heading>
      <Text color='fg.muted'>{t('workspace.sections.surveys.description')}</Text>

      <Box
        borderWidth='thin'
        borderColor='border.muted'
        borderRadius='card'
        bg='bg.canvas'
        p='6'
      >
        <Stack gap='4'>
          <Heading size='lg'>{t('workspace.surveysPage.sentryLab.title')}</Heading>
          <Text color='fg.muted'>{t('workspace.surveysPage.sentryLab.description')}</Text>
          <Text color='fg.subtle'>{t('workspace.surveysPage.sentryLab.warning')}</Text>

          <Grid
            gap='3'
            templateColumns={{ base: '1fr', md: 'repeat(2, minmax(0, 1fr))' }}
          >
            <Stack
              gap='3'
              borderWidth='thin'
              borderColor='border.muted'
              borderRadius='card'
              p='4'
            >
              <Heading size='md'>{t('workspace.surveysPage.sentryLab.groups.clientTitle')}</Heading>
              <Text color='fg.muted'>
                {t('workspace.surveysPage.sentryLab.groups.clientDescription')}
              </Text>
              <Button
                onClick={runClientCapture}
                colorPalette='brand'
              >
                {t('workspace.surveysPage.sentryLab.actions.clientCapture')}
              </Button>
              <Button
                onClick={runClientUnhandled}
                variant='outline'
              >
                {t('workspace.surveysPage.sentryLab.actions.clientUnhandled')}
              </Button>
              <Button
                onClick={runClientRender}
                variant='outline'
              >
                {t('workspace.surveysPage.sentryLab.actions.clientRender')}
              </Button>
            </Stack>

            <Stack
              gap='3'
              borderWidth='thin'
              borderColor='border.muted'
              borderRadius='card'
              p='4'
            >
              <Heading size='md'>{t('workspace.surveysPage.sentryLab.groups.serverTitle')}</Heading>
              <Text color='fg.muted'>
                {t('workspace.surveysPage.sentryLab.groups.serverDescription')}
              </Text>
              <HStack
                align='stretch'
                flexWrap='wrap'
              >
                <Button
                  onClick={() => void runApiScenario('node', 'capture')}
                  colorPalette='brand'
                >
                  {t('workspace.surveysPage.sentryLab.actions.nodeCapture')}
                </Button>
                <Button
                  onClick={() => void runApiScenario('node', 'throw')}
                  variant='outline'
                >
                  {t('workspace.surveysPage.sentryLab.actions.nodeThrow')}
                </Button>
                <Button
                  onClick={() => void runApiScenario('edge', 'capture')}
                  variant='outline'
                >
                  {t('workspace.surveysPage.sentryLab.actions.edgeCapture')}
                </Button>
                <Button
                  onClick={() => void runApiScenario('edge', 'throw')}
                  variant='outline'
                >
                  {t('workspace.surveysPage.sentryLab.actions.edgeThrow')}
                </Button>
                <Button
                  onClick={runSsrError}
                  variant='outline'
                >
                  {t('workspace.surveysPage.sentryLab.actions.ssrThrow')}
                </Button>
              </HStack>
            </Stack>
          </Grid>

          <Separator />

          <Stack gap='2'>
            <Text fontWeight='medium'>{t('workspace.surveysPage.sentryLab.lastAction')}</Text>
            <Code
              p='3'
              whiteSpace='pre-wrap'
            >
              {lastResult ?? t('workspace.surveysPage.sentryLab.idleState')}
            </Code>
          </Stack>
        </Stack>
      </Box>

      <Text color='fg.subtle'>{t('workspace.sections.surveys.emptyState')}</Text>
    </Stack>
  );
}
