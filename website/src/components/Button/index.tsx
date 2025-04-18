import styles from './Button.module.scss';
import Image from 'next/image';
import cn from 'classnames';
import { ThemeImage } from '../ThemeImage';

export interface ButtonProps {
  text: string;
  link?: string;
  icon?: string;
  isPrimary?: boolean;
  isOutline?: boolean;
  classNames?: string;
  onClick?: (x: any) => void;
}

export function Button({
  text,
  link,
  icon,
  isPrimary,
  isOutline,
  classNames,
  onClick,
}: ButtonProps) {
  return (
    <div onClick={onClick} className={cn(styles.wrapper, classNames)}>
      {link ? (
        <a
          className={cn(styles.buttonDefault, {
            [styles.buttonPrimary]: isPrimary,
            [styles.buttonOutline]: isOutline,
          })}
          target='_blank'
          rel='noopener noreferrer'
          href={link}
        >
          {icon ? (
            <ThemeImage
              className={styles.img}
              width={24}
              height={24}
              alt='button'
              src={icon}
            />
          ) : null}
          {text}
        </a>
      ) : (
        <button
          className={cn(styles.buttonDefault, {
            [styles.buttonPrimary]: isPrimary,
            [styles.buttonOutline]: isOutline,
          })}
        >
          {icon ? (
            <Image
              className={styles.img}
              width={24}
              height={24}
              alt='button'
              src={icon}
            />
          ) : null}
          {text}
        </button>
      )}
    </div>
  );
}
