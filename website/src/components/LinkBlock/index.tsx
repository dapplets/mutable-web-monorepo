import styles from './LinkBlock.module.scss';
import Image from 'next/image';
import Link from 'next/link';
import { forwardRef } from 'react';

export interface LinkBlockProps {
  content: any;
}

export const LinkBlock = forwardRef<HTMLDivElement, LinkBlockProps>(
  ({ content }, ref) => {
    return (
      <Link
        prefetch={false}
        className={styles.linkContainer}
        href={content.link}
        target='_blank'
        rel='noopener noreferrer'
      >
        <div className={styles.link} ref={ref}>
          <div className={styles.linkIcon}>
            <Image
              width={65}
              height={65}
              alt='arrow'
              src='icons/link/arrow.svg'
              fetchPriority='high'
            />
          </div>
          <div className={styles.linkTitle}>{content.title}</div>
          <div className={styles.linkContent}>{content.content}</div>
        </div>
      </Link>
    );
  }
);

LinkBlock.displayName = 'LinkBlock';