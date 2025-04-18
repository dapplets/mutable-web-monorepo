import styles from './ThemeImage.module.scss';
import Image, { ImageProps } from 'next/image';
import cn from 'classnames';
import { useTheme } from 'next-themes';

type Props = Omit<ImageProps, 'src' | 'priority' | 'loading'> & {
  width: number;
  height: number;
  src?: string;
  className?: string;
  priority?: boolean;
};

export const ThemeImage = (props: Props) => {
  const { resolvedTheme } = useTheme();
  const { src, alt, className, priority, width, height, ...rest } = props;

  const themeSrc =
    resolvedTheme === 'dark' ? '/themes/dark/' + src : '/themes/light/' + src;

  return (
    <Image
      {...rest}
      src={themeSrc}
      alt={alt}
      className={cn(
        resolvedTheme === 'dark' ? styles.imgDark : styles.imgLight,
        'unset',
        className,
        {
          [styles.noTransition]: className == 'noTransition',
        }
      )}
      priority={priority}
      width={width}
      height={height}
    />
  );
};
