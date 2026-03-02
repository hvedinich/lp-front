import type { ReactElement, ReactNode } from 'react';
import { MainPageLayout } from '../ui/MainPageLayout';

type WithGetLayout = { getLayout?: (page: ReactElement) => ReactNode };

/**
 * Attaches the standard authenticated layout to any Next.js page component.
 *
 * Usage in pages/:
 *   export default withMainLayout(
 *     dynamic(() => import('@/pages/home/ui/HomePage'), { ssr: false })
 *   );
 */
export function withMainLayout<T>(Page: T): T & WithGetLayout {
  (Page as unknown as WithGetLayout).getLayout = (page: ReactElement) => (
    <MainPageLayout>{page}</MainPageLayout>
  );
  return Page as T & WithGetLayout;
}
