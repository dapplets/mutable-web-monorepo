'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ThemeImage } from '@/components/ThemeImage';
import { DESKTOP_SUPPORTERS, MOBILE_SUPPORTERS } from './supporters';
import styles from './SupportedBySection.module.scss';
import gsap from 'gsap';

const SupportedBySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationDone = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1025 || animationDone.current) return;

    const container = containerRef.current;
    if (!container) return;

    const supporters = Array.from(container.querySelectorAll('a, .theme-image-container'));
    
    gsap.set(supporters, { opacity: 0, y: 40 });
    
    const tl = gsap.timeline({ delay: 0.5 });
    tl.to(supporters, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.in',
    });

    animationDone.current = true;

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={containerRef}>
      <div className={styles.label}>Supported by:</div>

      <div className={styles.linkBlock}>
        {DESKTOP_SUPPORTERS.map((supporter, index) =>
          supporter.link ? (
            <Link
              key={index}
              href={supporter.link}
              target='_blank'
              rel='noopener noreferrer'
              className="supporter-item"
            >
              <ThemeImage
                className={styles.img}
                width={supporter.width}
                height={supporter.height}
                alt={supporter.alt}
                src={supporter.src}
                style={{ transform: 'none', cursor: 'pointer' }}
              />
            </Link>
          ) : (
            <div key={index} className="theme-image-container supporter-item">
              <ThemeImage
                className={styles.img}
                width={supporter.width}
                height={supporter.height}
                alt={supporter.alt}
                src={supporter.src}
                style={{ transform: 'none', cursor: 'default' }}
              />
            </div>
          )
        )}
      </div>

      <div className={styles.linkBlockMobile}>
        {MOBILE_SUPPORTERS.map((supporter, index) => (
          <ThemeImage
            key={index}
            className={styles.img}
            width={supporter.width}
            height={supporter.height}
            alt={supporter.alt}
            src={supporter.src}
            style={{ transform: 'none', cursor: 'default' }}
          />
        ))}
      </div>
    </div>
  );
};

export default SupportedBySection;