import { Flex, Text, type FlexProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './LogoIcon';

export interface AppBrandProps extends Omit<FlexProps, 'children'> {
  /** When true, hides the text label — shows the icon only (collapsed sidebar). */
  collapsed?: boolean;
  /** Fades out the text label while keeping layout stable during collapse animation. */
  fadeLabel?: boolean;
}

/**
 * AppBrand — logo icon + product name.
 *
 * Used in:
 *   - MainSidebar top slot (expanded and collapsed states)
 *   - Login / Signup pages (centered above the auth card)
 *
 * Replace the BrandIcon internals with an <Image> once a real logo file is available.
 */
export function AppBrand({ collapsed = false, fadeLabel = false, ...rest }: AppBrandProps) {
  const { t } = useTranslation('common');

  return (
    <Flex
      align='center'
      gap='2'
      {...rest}
    >
      <LogoIcon size={32} />
      {!collapsed && (
        <Text
          fontWeight='semibold'
          fontSize='lg'
          color='fg.default'
          whiteSpace='nowrap'
          style={{
            opacity: fadeLabel ? 0 : 1,
            transition: 'opacity 120ms ease',
          }}
        >
          {t('app.name')}
        </Text>
      )}
    </Flex>
  );
}
