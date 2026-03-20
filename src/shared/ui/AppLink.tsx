import { Link as ChakraLink, type LinkProps as ChakraLinkProps } from '@chakra-ui/react';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';
import { type ReactNode } from 'react';

export interface AppLinkProps extends Omit<ChakraLinkProps, 'asChild' | 'href'> {
  children: ReactNode;
  href: NextLinkProps['href'];
  locale?: NextLinkProps['locale'];
  prefetch?: NextLinkProps['prefetch'];
  replace?: NextLinkProps['replace'];
  scroll?: NextLinkProps['scroll'];
  shallow?: NextLinkProps['shallow'];
}

export function AppLink({
  children,
  href,
  locale,
  prefetch,
  replace,
  scroll,
  shallow,
  target,
  ...rest
}: AppLinkProps) {
  return (
    <ChakraLink
      asChild
      {...rest}
    >
      <NextLink
        href={href}
        locale={locale}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        target={target}
      >
        {children}
      </NextLink>
    </ChakraLink>
  );
}
