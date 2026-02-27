import Document, { Html, Head, Main, NextScript } from 'next/document';

/**
 * _document.tsx — кастомный Document для Next.js Pages Router.
 *
 * Зачем: позволяет добавить глобальные атрибуты к <html> и <body>,
 * а также управлять тегами <head> которые нельзя поместить в _app.tsx.
 *
 * Note по FOUC: Chakra UI v3 использует CSS-переменные (не dynamic CSS-in-JS),
 * поэтому стандартный @emotion/server cache не нужен — токены темы инжектируются
 * как :root CSS variables на стороне сервера через стандартный SSR механизм Next.js.
 * Это принципиальное отличие от Chakra v2 где требовался createEmotionCache().
 */
export default class MyDocument extends Document {
  render() {
    return (
      <Html lang='en'>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
