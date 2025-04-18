import type { AppProps } from 'next/app';
import { FC, useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import init from '@socialgouv/matomo-next';

import '@/assets/styles/globals.css';

const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

const MyApp: FC<AppProps> = ({ Component, ...rest }) => {
  useEffect(() => {
    // Initialize Matomo Analytics
    if (MATOMO_URL && MATOMO_SITE_ID) {
      init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID });
    }
  }, []);

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <Component {...rest} />
    </ThemeProvider>
  );
};

export default MyApp;
