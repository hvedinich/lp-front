import { Flex, Heading, Text } from '@chakra-ui/react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { AppLink } from '@/shared/ui';
import { useAppBreadcrumbs } from '../model/breadcrumbs';

export function AppBreadcrumbs() {
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
              <AppLink
                href={item.href}
                fontSize='sm'
                fontWeight='medium'
                px='2'
                color='fg.muted'
              >
                {item.label}
              </AppLink>
            ) : (
              <Heading
                as='h1'
                aria-current={isLast ? 'page' : undefined}
                size='sm'
                px='2'
                fontWeight='semibold'
                color={isLast ? 'fg.default' : 'fg.muted'}
              >
                {item.label}
              </Heading>
            )}

            {!isLast ? (
              <Text
                color='fg.subtle'
                aria-hidden='true'
              >
                {t('workspace.breadcrumbs.separator')}
              </Text>
            ) : null}
          </Fragment>
        );
      })}
    </Flex>
  );
}
