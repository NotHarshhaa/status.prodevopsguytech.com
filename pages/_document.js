import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#0969da" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0d1117" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function setThemeClass(isDark) {
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                }

                try {
                  // Check localStorage first
                  var savedMode = localStorage.getItem('darkMode');
                  if (savedMode !== null) {
                    setThemeClass(savedMode === 'true');
                  } else {
                    // Fall back to system preference
                    var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setThemeClass(systemDark);
                  }
                } catch (e) {
                  console.warn('Failed to set initial theme:', e);
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
