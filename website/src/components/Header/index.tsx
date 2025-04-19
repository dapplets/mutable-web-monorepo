import Link from 'next/link';
import styles from './Header.module.scss';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import { ThemeImage } from '../ThemeImage';
import { FC, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '../Button';
import gsap from 'gsap'

const menuItems = [
  {
    title: 'Home',
    path: '/',
  },
  {
    title: 'About',
    path: '/about/',
  },
];

export interface HeaderProps {
  setModalOpen: (x: boolean) => void;
}

export const Header:FC<HeaderProps>=({ setModalOpen }) =>{
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenu, setMobileMenu] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const navLinksRef = useRef<HTMLDivElement>(null);
  const themeSwitcherRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1025) {
        setMobileMenu(false);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024) return;

    const elements = [
      logoRef.current,
      navLinksRef.current,
      themeSwitcherRef.current,
      buttonRef.current
    ].filter(Boolean) as HTMLElement[];

    gsap.set(elements, { opacity: 0, y: 40 });

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'back.out(1.7)',
      delay: 0.3
    });

  }, []);

  return (
    <div className={styles.wrapper} ref={headerRef}>
      <Link
        prefetch={false}
        className={cn(styles.linkHover, styles.logoLink)}
        href='/'
        ref={logoRef}
      >
        <ThemeImage
          width={178}
          height={50}
          alt='Dapplets'
          src='icons/header/logo.svg'
          className={styles.logoImage}
        />
      </Link>

      <div className={styles.navLinks} ref={navLinksRef}>
        {menuItems.map((menuItem, i) => (
          <Link prefetch={false} key={i} href={menuItem.path}>
            <div
              className={cn(styles.linkHover, {
                [styles.active]: pathname === menuItem.path,
              })}
            >
              {menuItem.title}
            </div>
          </Link>
        ))}
      </div>

      <div className={styles.themeSwitcher} onClick={toggleDarkMode} ref={themeSwitcherRef}>
        <ThemeImage
          width={34}
          height={34}
          alt='darkMode'
          src='icons/header/theme-switcher.svg'
        />
      </div>

   
        <Button
          onClick={() => setModalOpen(true)}
          classNames={styles.mvmButton}
          text='MWM'
          isPrimary
          ref={buttonRef}
        />
  

      <div
        onClick={() => setMobileMenu(!isMobileMenu)}
        className={styles.burger}
      >
        <div className={styles.burgerLines}></div>
      </div>

      {isMobileMenu && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileHeader}>
              <Link prefetch={false} className={styles.logoLink} href='/'>
                <ThemeImage
                  width={178}
                  height={50}
                  alt='Dapplets'
                  src='icons/header/logo.svg'
                  className={styles.logoImage}
                />
              </Link>
              <div className={styles.themeSwitcher} onClick={toggleDarkMode}>
                <ThemeImage
                  width={34}
                  height={34}
                  alt='darkMode'
                  src='icons/header/theme-switcher.svg'
                />
              </div>
              <div
                onClick={() => setMobileMenu(!isMobileMenu)}
                className={styles.burger}
              >
                <div className={styles.burgerLinesActive}></div>
              </div>
            </div>

            <div className={styles.mobileNav}>
              {menuItems.map((menuItem, i) => (
                <Link
                  prefetch={false}
                  key={i}
                  href={menuItem.path}
                  onClick={() => setMobileMenu(false)}
                >
                  <div
                    className={cn(styles.linkHover, {
                      [styles.active]: pathname === menuItem.path,
                    })}
                  >
                    {menuItem.title}
                  </div>
                </Link>
              ))}
            </div>

            <div className={styles.socialLinks}>
              {['github', 'discord', 'tg', 'medium', 'x', 'email'].map(
                (social) => (
                  <Link
                    key={social}
                    prefetch={false}
                    target='_blank'
                    href={`#${social}`}
                  >
                    <ThemeImage
                      className={styles.socialIcon}
                      width={36}
                      height={36}
                      alt={social}
                      src={`icons/footer/${social}.svg`}
                    />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header