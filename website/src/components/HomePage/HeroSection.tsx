import React, { useEffect, useRef } from 'react';
import { Button } from '../Button';
import styles from './HeroSection.module.scss';
import SupportedBySection from './SupportedBySection';
import { HomeTitle } from '@/constants/constantsText';
import { ThemeImage } from '../ThemeImage';
import cn from 'classnames';
import gsap from 'gsap';

const HeroSection = () => {
  const buttonsContainerRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLDivElement>(null);
  const secondButtonRef = useRef<HTMLDivElement>(null);
  const masterTrigger = useRef<ScrollTrigger>();

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    import('gsap/ScrollTrigger').then((module) => {
      const ScrollTrigger = module.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const buttons = [
        firstButtonRef.current,
        secondButtonRef.current
      ].filter(Boolean) as HTMLElement[];

      gsap.set(buttons, { opacity: 0, y: 40 });

      if (masterTrigger.current) masterTrigger.current.kill();

      const tl = gsap.timeline({
        paused: true,
        defaults: { duration: 0.8, ease: 'back.out(1.7)' }
      });

      tl.to(buttons[0], { opacity: 1, y: 0 }, 0)
        .to(buttons[1], { opacity: 1, y: 0 }, 0.15);

      masterTrigger.current = ScrollTrigger.create({
        trigger: buttonsContainerRef.current,
        start: 'top 30%',
        end: 'top 70%',
        onLeave: () => gsap.to(buttons, { 
          opacity: 0, 
          y: 40, 
          duration: 0.6,
          ease: 'power2.in' 
        }),
        onEnterBack: () => tl.restart(true),
     
      });

      buttons.forEach((button, index) => {
        ScrollTrigger.create({
          trigger: button,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          animation: gsap.to(button, {
            yPercent: -5 - index * 3,
            ease: 'none'
          })
        });
      });

      tl.play();
    });

    return () => {
      if (masterTrigger.current) masterTrigger.current.kill();
    };
  }, []);

  return (
    <section className={styles.wrapper}>
      <header className={styles.titleBlock}>
        <h1 className={styles.title}>
          The Home <br />
          of Mutable Web
        </h1>
        <p className={styles.subtitle}>{HomeTitle.subtitle}</p>
      </header>
      <div className={styles.buttons} ref={buttonsContainerRef}>
        <Button
          ref={firstButtonRef}
          link='https://chromewebstore.google.com/detail/mutable-web/cnahdmdbhkphpbpbjjbfdnmbphbenglc'
          text='Get started'
          isPrimary
          icon='icons/button/download.svg'
        />
        <Button
          ref={secondButtonRef}
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