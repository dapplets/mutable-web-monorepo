'use client';

import React, { useEffect, useRef } from 'react';
import styles from './ExamplesSection.module.scss';
import { ThemeImage } from '../ThemeImage';
import { PowerDapplets } from '@/constants/constantsText';
import Link from 'next/link';
import cn from 'classnames';
import gsap from 'gsap';

const ExamplesSection = () => {
  const itemsRef = useRef<(HTMLElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const animationTriggered = useRef(false);

  const addToItemsRef = (el: HTMLElement | null, index: number) => {
    if (el) {
      gsap.set(el, { opacity: 0 });
      itemsRef.current[index] = el;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || animationTriggered.current || !sectionRef.current) return;

    const items = itemsRef.current
      .filter((item): item is HTMLElement => item !== null)
      .slice(0, PowerDapplets.length);

    if (items.length !== PowerDapplets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animationTriggered.current) {
            gsap.set(items[0], { x: -100 });
            gsap.set(items[1], { y: 100 });
            gsap.set(items[2], { x: 100 });

            const tl = gsap.timeline({
              defaults: { duration: 0.8, ease: 'power2.in' }
            });

            tl.to(items[0], { x: 0, opacity: 1, delay: 0.1 })
              .to(items[1], { y: 0, opacity: 1 }, '-=0.6')
              .to(items[2], { x: 0, opacity: 1 }, '-=0.6');

            animationTriggered.current = true;
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
      items.forEach(item => gsap.killTweensOf(item));
    };
  }, []);

  return (
    <section className={styles.wrapper} ref={sectionRef}>
      <h2 className={styles.title}>
        mutations
        <span className={cn(styles.title, styles['title--color'])}>
          &nbsp;example
        </span>
      </h2>
      <div className={styles.container}>
        {PowerDapplets.map((dapplet, i) => (
          <DappletExample 
            key={i} 
            dapplet={dapplet} 
            ref={(el) => addToItemsRef(el, i)} 
          />
        ))}
      </div>
    </section>
  );
};

const DappletExample = React.forwardRef<HTMLElement, { dapplet: (typeof PowerDapplets)[0] }>(
  ({ dapplet }, ref) => {
    return (
      <article className={styles.item} ref={ref}>
        <div className={styles.img}>
          <ThemeImage
            width={390}
            height={407}
            alt={dapplet.title}
            src={dapplet.image}
            style={{ transform: 'none', cursor: 'default' }}
          />
        </div>

        <Link
          className={styles.link}
          prefetch={false}
          href={dapplet.link}
          target='_blank'
        >
          <h3 className={styles.itemTitle}>{dapplet.title}</h3>
          <p className={styles.text}>{dapplet.text}</p>
        </Link>

        <div className={styles.textTablet}>
          <Link prefetch={false} href={dapplet.link} target='_blank'>
            <h3 className={styles.itemTitle}>{dapplet.title}</h3>
          </Link>
          <p className={styles.text}>{dapplet.text}</p>
        </div>
      </article>
    );
  }
);

DappletExample.displayName = 'DappletExample';

export default ExamplesSection;