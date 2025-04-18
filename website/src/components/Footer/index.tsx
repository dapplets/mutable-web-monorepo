import styles from './Footer.module.scss';
import cn from 'classnames';
import Link from 'next/link';
import { ThemeImage } from '../ThemeImage';

export function Footer() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.copy}>
        <div className={styles.copyText}>© {new Date().getFullYear()}</div>
        <div className={styles.copyImg}>
          <ThemeImage
            width={24}
            height={20}
            alt=''
            src='icons/footer/heart.svg'
          />
        </div>
        <div className={styles.copyText}>by</div>
        <Link prefetch={false} href='/'>
          <div className={styles.copyUnderline}>Dapplets Project</div>
        </Link>
      </div>

      <Link
        prefetch={false}
        href='/privacy-policy'
        className={styles.privacyLink}
      >
        Privacy Policy
      </Link>

      <div className={cn(styles.links, styles.linksContainer)}>
        <Link
          prefetch={false}
          target='_blank'
          href='https://github.com/dapplets'
        >
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='GitHub'
            src='icons/footer/github.svg'
          />
        </Link>

        <Link
          prefetch={false}
          target='_blank'
          href='https://discord.gg/YcxbkcyjMV'
        >
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='Discord'
            src='icons/footer/discord.svg'
          />
        </Link>

        <Link prefetch={false} target='_blank' href='https://t.me/dapplets'>
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='Telegram'
            src='icons/footer/tg.svg'
          />
        </Link>

        <Link
          prefetch={false}
          target='_blank'
          href='https://medium.com/@dapplets'
        >
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='Medium'
            src='icons/footer/medium.svg'
          />
        </Link>

        <Link
          prefetch={false}
          target='_blank'
          href='https://twitter.com/dapplets_org'
        >
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='X (former Twitter)'
            src='icons/footer/x.svg'
          />
        </Link>

        <Link
          prefetch={false}
          target='_blank'
          href='mailto:business@dapplets.org'
        >
          <ThemeImage
            className={styles.img}
            width={36}
            height={36}
            alt='Email'
            src='icons/footer/email.svg'
          />
        </Link>
      </div>
    </div>
  );
}
