import { FC, PropsWithChildren, ReactNode, useEffect, useState } from 'react';
import styles from './Layout.module.scss';
import { Header } from '../Header';
import { Footer } from '../Footer';
import cn from 'classnames';
import Head from 'next/head';
import { useCurrentTheme } from '@/hooks/useCurrentTheme';
import { useRouter } from 'next/router';
import { Modal } from '../Modal';

interface LayoutProps extends PropsWithChildren {
  title?: string | ReactNode;
  setTitle?: any;
  description?: string;
}

export const Layout: FC<LayoutProps> = ({ children, title, description }) => {
  const theme = useCurrentTheme();
  const router = useRouter();
  const id = router.asPath;
  const [mounted, setMounted] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && id && id.toLowerCase().includes('mwm')) {
      setModalOpen(true);
    }

    if (isModalOpen) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
  }, [isModalOpen, id, mounted, router]);

  return (
    <>
      <Head>
        <link
          rel='icon'
          href={`/themes/${theme}/favicon/favicon.ico`}
          sizes='32x32'
        />
        <link
          rel='icon'
          href={`/themes/${theme}/favicon/favicon.svg`}
          type='image/svg+xml'
        />
        <link
          rel='apple-touch-icon'
          href={`/themes/${theme}/favicon/apple-touch-icon.png`}
        />
        <link rel='manifest' href='/manifest.json' />
        <meta name='theme-color' content='#e7ecef' />
        <title>{title}</title>
        <meta name='description' content={description} />
      </Head>
      <div className={cn(styles.wrapper, styles.layoutContainer)}>
        <div className={styles.menu}>
          <Header setModalOpen={setModalOpen} />
        </div>

        {children}
        <Modal setModalOpen={setModalOpen} isModalOpen={isModalOpen} />
        <div className={styles.delimeter}></div>

        <Footer />
      </div>
    </>
  );
};
