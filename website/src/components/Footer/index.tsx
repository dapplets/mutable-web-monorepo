import styles from './Footer.module.scss';
import Image from 'next/image';
import cn from 'classnames';
import Link from 'next/link';
import { ThemeImage } from '../ThemeImage';

export function Footer() {
  return (
    <div
      className={cn(
        styles.wrapper,
        'fonts container-xl  mx-auto flex justify-between max-xl:flex-col max-xl:items-center '
      )}
    >
      <div
        className={cn(
          styles.copy,
          'flex items-center justify-between max-xl:order-[1] max-xl:pt-20 max-lg:pt-10'
        )}
      >
        <div
          className={cn(styles.copyText, 'fonts flex items-center text-base')}
        >
          © 2019—{new Date().getFullYear()}
        </div>
        <div className={cn(styles.copyImg, 'flex items-center')}>
          <ThemeImage
            width={24}
            height={20}
            alt=''
            src='icons/footer/heart.svg'
          />
        </div>
        <div
          className={cn(styles.copyText, 'fonts flex items-center text-base')}
        >
          by
        </div>
        <Link prefetch={false} href='/'>
          <div
            className={cn(
              styles.copyUnderline,
              'fonts flex items-center text-base'
            )}
          >
            Dapplets Project
          </div>
        </Link>
      </div>
           <Link prefetch={false} href='/privacy-policy'>
       
      Privacy Policy
    
        </Link>
      <div
        className={cn(
          styles.links,
          'flex items-center justify-between max-xl:order-[0]'
        )}
      >
        <Link
          prefetch={false}
          target='_blank'
          href='https://github.com/dapplets'
        >
          <ThemeImage
            className={cn(styles.img, '')}
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
            className={cn(styles.img, '')}
            width={36}
            height={36}
            alt='Discord'
            src='icons/footer/discord.svg'
          />
        </Link>

        <Link prefetch={false} target='_blank' href='https://t.me/dapplets'>
          <ThemeImage
            className={cn(styles.img, '')}
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
            className={cn(styles.img, '')}
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
            className={cn(styles.img, '')}
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
            className={cn(styles.img, '')}
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
