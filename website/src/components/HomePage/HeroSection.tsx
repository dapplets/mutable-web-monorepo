import React from 'react';
import { Button } from '../Button';
import styles from './HeroSection.module.scss';
import SupportedBySection from './SupportedBySection';
import { HomeTitle } from '@/constants/constantsText';
import { ThemeImage } from '../ThemeImage';
import cn from 'classnames';

const HeroSection = () => {
  return (
    <section className={styles.wrapper}>
      <header className={styles.titleBlock}>
        <h1 className={styles.title}>
          The Home <br />
          of Mutable Web
        </h1>
        <p className={styles.subtitle}>{HomeTitle.subtitle}</p>
      </header>
      <div className={styles.buttons}>
        <Button
          link='https://chromewebstore.google.com/detail/mutable-web/cnahdmdbhkphpbpbjjbfdnmbphbenglc'
          text='Get started'
          isPrimary
          icon='icons/button/download.svg'
        />
        <Button
          text='Visit Github'
          isOutline
          icon='icons/button/github.svg'
          link='https://github.com/dapplets'
        />
      </div>
      <SupportedBySection />
      <ThemeImage
        className={cn(styles.img, styles['img-left'])}
        width={1920}
        height={761}
        alt='arrow'
        src='icons/home/bg-title.svg'
      />
    </section>
  );
};

export default HeroSection;
