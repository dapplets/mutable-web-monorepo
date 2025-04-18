import styles from './ThemeImage.module.scss';
import Image, { ImageProps } from 'next/image';
import cn from 'classnames';

type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
  width: number;
  height: number;
  src?: string;
  className?: string;
  priority?: boolean;
};

export const ThemeImage = (props: Props) => {
  const { src, alt, className, priority, width, height, ...rest } = props;

  return (
    <>
      <Image
        {...rest}
        src={'/themes/light/' + src}
        alt={alt}
        className={cn(styles.imgLight, 'unset', className, {
          [styles.noTransition]: className == 'noTransition',
        })}
        priority={priority}
        width={width}
        height={height}
      />
      <Image
        {...rest}
        width={width}
        height={height}
        src={'/themes/dark/' + src}
        alt={alt}
        className={cn(styles.imgDark, 'unset', className, {
          [styles.noTransition]: className == 'noTransition',
        })}
        priority={priority}
      />
    </>
  );
};
