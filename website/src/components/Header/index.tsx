'use client';

import Link from 'next/link';
import styles from './Header.module.scss';
import cn from 'classnames';
import { useTheme } from 'next-themes';
import { ThemeImage } from '../ThemeImage';
import { FC, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '../Button';
import gsap from 'gsap';

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

export const Header: FC<HeaderProps> = ({ setModalOpen }) => {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [isMobileMenu, setMobileMenu] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const toggleDarkMode = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth < 1024 || !headerRef.current) return;

    const logo = headerRef.current.querySelector(`.${styles.logoLink}`);
    const navLinks = Array.from(headerRef.current.querySelectorAll(`.${styles.navLinks} a`));
    const themeSwitcher = headerRef.current.querySelector(`.${styles.themeSwitcher}`);
    const button = headerRef.current.querySelector(`.${styles.mvmButton}`);

    gsap.set([logo, ...navLinks, themeSwitcher, button], { 
      opacity: 0, 
      y: 20 
    });

    timelineRef.current = gsap.timeline()
      .to(logo, { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        ease: 'power2.in' 
      })
      .to(navLinks, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.in'
      }, '-=0.4')
      .to([themeSwitcher, button], {
        opacity: 1,
        y: 0,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.in'
      }, '-=0.3');

    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mobileMenuRef.current) return;

    if (isMobileMenu) {
      gsap.fromTo(mobileMenuRef.current,
        { opacity: 0, y: -50 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4,
          ease: 'power2.in'
        }
      );

      gsap.fromTo(mobileMenuRef.current.querySelectorAll('a'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.in',
          delay: 0.2
        }
      );
    } else {
      gsap.to(mobileMenuRef.current,
        { 
          opacity: 0, 
          y: -50, 
          duration: 0.3,
          ease: 'power2.in'
        }
      );
    }
  }, [isMobileMenu]);

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

  return (
    <div className={styles.wrapper} ref={headerRef}>
      <Link
        prefetch={false}
        className={cn(styles.linkHover, styles.logoLink)}
        href='/'
      >
        <ThemeImage
          width={178}
          height={50}
          alt='Dapplets'
          src='icons/header/logo.svg'
          className={styles.logoImage}
        />
      </Link>

      <div className={styles.navLinks}>
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

      <div className={styles.themeSwitcher} onClick={toggleDarkMode}>
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
      />

      <div
        onClick={() => setMobileMenu(!isMobileMenu)}
        className={styles.burger}
      >
        <div className={isMobileMenu ? styles.burgerLinesActive : styles.burgerLines}></div>
      </div>

      <div className={styles.mobileMenu} ref={mobileMenuRef} style={{ display: isMobileMenu ? 'block' : 'none' }}>
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
    </div>
  );
};

export default Header;