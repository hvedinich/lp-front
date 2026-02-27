import { Flex, Text, type FlexProps } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { LogoIcon } from './LogoIcon';

export interface AppBrandProps extends Omit<FlexProps, 'children'> {
  /** When true, hides the text label — shows the icon only (collapsed sidebar). */
  collapsed?: boolean;
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
export function AppBrand({ collapsed = false, ...rest }: AppBrandProps) {
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
        >
          {t('app.name')}
        </Text>
      )}
    </Flex>
  );
}
