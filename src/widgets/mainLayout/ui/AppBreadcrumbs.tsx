import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppBreadcrumbs } from '../model/breadcrumbs';

export function AppBreadcrumbs() {
  const router = useRouter();
  const { t } = useTranslation('common');
  const items = useAppBreadcrumbs();
  const lastIndex = items.length - 1;

  return (
    <Flex
      as='nav'
      aria-label={t('workspace.breadcrumbs.ariaLabel')}
      align='center'
      gap='2'
      wrap='wrap'
    >
      {items.map((item, index) => {
        const isLast = index === lastIndex;

        return (
          <Fragment key={`${item.href ?? 'current'}-${item.label}-${index}`}>
            {!isLast && item.href ? (
              <Button
                variant='ghost'
                size='sm'
                px='2'
                color='fg.muted'
                onClick={() => {
                  void router.push(item.href!);
                }}
              >
                {item.label}
              </Button>
            ) : (
              <Heading
                as='h1'
                size='sm'
                px='2'
                fontWeight='semibold'
                color={isLast ? 'fg.default' : 'fg.muted'}
              >
                {item.label}
              </Heading>
            )}

            {!isLast ? <Text color='fg.subtle'>{t('workspace.breadcrumbs.separator')}</Text> : null}
          </Fragment>
        );
      })}
    </Flex>
  );
}
