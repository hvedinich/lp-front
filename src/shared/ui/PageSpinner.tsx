import { Center, Spinner, type CenterProps } from '@chakra-ui/react';

/**
 * PageSpinner — full-viewport centered loading indicator.
 *
 * Used as a loading fallback for dynamic() imports and auth-guard pending states.
 * Accepts all Center props for layout overrides (minH, width, etc.).
 */
export function PageSpinner({ minH = 'dvh100', ...rest }: CenterProps) {
  return (
    <Center
      minH={minH}
      width='full'
      {...rest}
    >
      <Spinner size='lg' />
    </Center>
  );
}
