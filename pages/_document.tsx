import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * Custom Document for Next.js Pages Router.
 *
 * Allows adding global attributes to <html> and <body>,
 * and managing <head> tags that cannot be placed in _app.tsx.
 *
 * Note on FOUC: Chakra UI v3 uses CSS variables (not dynamic CSS-in-JS),
 * so the standard @emotion/server cache is not needed — theme tokens are injected
 * as :root CSS variables server-side via the standard Next.js SSR mechanism.
 * This is the key difference from Chakra v2 which required createEmotionCache().
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html
        lang='en'
        suppressHydrationWarning
      >
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
