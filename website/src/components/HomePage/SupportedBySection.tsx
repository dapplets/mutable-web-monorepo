'use client';

import React from 'react';
import Link from 'next/link';
import { ThemeImage } from '@/components/ThemeImage';
import { DESKTOP_SUPPORTERS, MOBILE_SUPPORTERS } from './supporters';
import styles from './SupportedBySection.module.scss';

const SupportedBySection = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.label}>Supported by:</div>

      <div className={styles.linkBlock}>
        {DESKTOP_SUPPORTERS.map((supporter, index) =>
          supporter.link ? (
            <Link
              key={index}
              href={supporter.link}
              target='_blank'
              rel='noopener noreferrer'
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
            <ThemeImage
              key={index}
              className={styles.img}
              width={supporter.width}
              height={supporter.height}
              alt={supporter.alt}
              src={supporter.src}
              style={{ transform: 'none', cursor: 'default' }}
            />
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
