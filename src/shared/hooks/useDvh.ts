import { useEffect } from 'react';

/**
 * useDvh — sets `--dvh` CSS variable to `window.innerHeight` in px on mount
 * and on every resize, then removes the listener on unmount.
 *
 * Why not plain `100dvh`?
 * Mobile browsers (Safari iOS, Chrome Android) count the address bar inside
 * `100dvh`, so full-screen layouts overflow. Using `window.innerHeight` gives
 * the actual visible area and mirrors the pattern from the localprof/reviews app.
 *
 * Usage in JSX (via theme size tokens):
 *   h='dvh100'     → 100% of visible viewport
 *   minH='dvh80'   → 80% of visible viewport
 *
 * Wire once at the root: call `useDvh()` inside `_app.tsx`.
 */
export function useDvh(): void {
  useEffect(() => {
    const update = () => {
      document.documentElement.style.setProperty('--dvh', `${window.innerHeight}px`);
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
}
