import { Head, Html, Main, NextScript } from "expo-router/html";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Unika Online" />
        <meta name="theme-color" content="#ffffff" />
        <link rel="manifest" href="/assets/images/site.webmanifest" />
        <link
          rel="icon"
          type="image/png"
          href="/assets/images/favicon-96x96.png"
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="/assets/images/favicon.svg"
        />
        <link rel="shortcut icon" href="/assets/images/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/images/apple-touch-icon.png"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
