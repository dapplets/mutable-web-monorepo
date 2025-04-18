import React from 'react';
import styles from './ExamplesSection.module.scss';
import { ThemeImage } from '../ThemeImage';
import { PowerDapplets } from '@/constants/constantsText';
import Link from 'next/link';
import cn from 'classnames';

const ExamplesSection = () => {
  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>
        mutations
        <span className={cn(styles.title, styles['title--color'])}>
          &nbsp;example
        </span>
      </h2>
      <div className={styles.container}>
        {PowerDapplets.map((dapplet, i) => (
          <DappletExample key={i} dapplet={dapplet} />
        ))}
      </div>
    </section>
  );
};

function DappletExample({ dapplet }: { dapplet: (typeof PowerDapplets)[0] }) {
  return (
    <article className={styles.item}>
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

export default ExamplesSection;
