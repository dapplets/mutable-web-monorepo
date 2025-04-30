'use client';

import { useEffect, useRef } from 'react';
import styles from './About.module.scss';
import { Layout } from '@/components/Layout';
import { brand, mission, problem, title } from '@/constants/constantsTextAbout';
import { Button } from '@/components/Button';
import { ThemeImage } from '@/components/ThemeImage';
import gsap from 'gsap';

function About() {
  const rotatingImageRef = useRef<HTMLDivElement>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const floatAnimationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!rotatingImageRef.current) return;

    const initComplexAnimation = () => {
      gsap.set(rotatingImageRef.current, {
        transformPerspective: 1000,
        transformOrigin: 'center center'
      });

      const appearTl = gsap.timeline();
      appearTl.from(rotatingImageRef.current, {
        scale: 0.7,
        opacity: 0,
        rotationY: 180,
        duration: 1.8,
        ease: 'elastic.out(1, 0.6)'
      });

      floatAnimationRef.current = gsap.to(rotatingImageRef.current, {
        y: '-=15',
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      gsap.to(rotatingImageRef.current, {
        rotationY: 360,
        duration: 25,
        repeat: -1,
        ease: 'none'
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!rotatingImageRef.current) return;

      mousePosition.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2
      };

      if (animationRef.current) animationRef.current.kill();

      animationRef.current = gsap.to(rotatingImageRef.current, {
        rotationY: mousePosition.current.x * 15,
        rotationX: -mousePosition.current.y * 10,
        x: mousePosition.current.x * 20,
        y: mousePosition.current.y * 20,
        duration: 1.5,
        ease: 'power2.out'
      });
    };

    const handleMouseEnter = () => {
      gsap.to(rotatingImageRef.current, {
        scale: 1.1,
        duration: 0.7,
        ease: 'back.out(2)',
        overwrite: true
      });
      
      gsap.to(rotatingImageRef.current, {
        '--glow-opacity': 0.3,
        '--glow-spread': '20px',
        duration: 0.5
      });
    };

    const handleMouseLeave = () => {
      gsap.to(rotatingImageRef.current, {
        scale: 1,
        rotationY: 0,
        rotationX: 0,
        x: 0,
        y: 0,
        '--glow-opacity': 0.1,
        '--glow-spread': '10px',
        duration: 1.5,
        ease: 'elastic.out(1, 0.5)'
      });
    };

    initComplexAnimation();
    window.addEventListener('mousemove', handleMouseMove);
    rotatingImageRef.current.addEventListener('mouseenter', handleMouseEnter);
    rotatingImageRef.current.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      rotatingImageRef.current?.removeEventListener('mouseenter', handleMouseEnter);
      rotatingImageRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      animationRef.current?.kill();
      floatAnimationRef.current?.kill();
    };
  }, []);

  return (
    <Layout
      title='Empowering Web Communities with Dapplets and Mutable Web: Solving Centralization Issues.'
      description='Enhance web experiences with Dapplets and Mutable Web. Empowering web communities, fostering freedom, and enabling new business possibilities. Join us in building a more connected digital world.'
    >
      <div className={styles.wrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.titleBlock}>
            <h1 className={styles.titleTitle}>{title.title}</h1>
            <p className={styles.titleMessage}>{title.message}</p>
            <div className={styles.titleButtons}>
              <Button
                link='https://chromewebstore.google.com/detail/mutable-web/cnahdmdbhkphpbpbjjbfdnmbphbenglc'
                text='Get started'
                isPrimary
                icon='icons/button/download.svg'
              />
              <Button
                text='Visit Github'
                isOutline
                icon='icons/button/github.svg'
                link='https://github.com/dapplets'
              />
            </div>
          </div>
          <div 
            className={styles.iconBlock} 
            ref={rotatingImageRef}
            style={{
              '--glow-color': 'var(--accent-color)',
              '--glow-opacity': '0.1',
              '--glow-spread': '10px'
            } as React.CSSProperties}
          >
            <ThemeImage
              className={styles.supportedBlockIcon}
              width={439}
              height={411}
              alt='About'
              src='icons/about/bg-title.svg'
            />
          </div>
        </div>

        <div className={styles.problemWrapper}>
          <div className={styles.problemDelimeter}></div>
          <h2 className={styles.problemTitle}>problem statement</h2>
          <div className={styles.problemText}>
            {problem.map((x, i) => (
              <p className={styles.problemTextItem} key={i}>
                {x.message}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.missionBg}>
          <div className={styles.missionWrapper}>
            <div className={styles.missionTitleBlock}>
              <h2 className={styles.missionTitle}>
                our&nbsp;<span className={styles.missionHilight}>mission</span>
              </h2>
              <p className={styles.missionMessage}>{mission[0].message}</p>
            </div>
            <div className={styles.missionText}>
              {mission
                .filter((x, i) => i !== 0)
                .map((x, i) => (
                  <div key={i} className={styles.missionItem}>
                    <h3 className={styles.missionItemTitle}>{x.title}</h3>
                    <p className={styles.missionItemMessage}>{x.message}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className={styles.brandWrapper}>
          <div className={styles.brandTitleBlock}>
            <h2 className={styles.brandTitle}>brand assets</h2>
            <Button
              classNames={styles.desktopBrandButton}
              link='https://www.figma.com/community/file/1123896455146409779/dapplets-project-brand-assets'
              text='Watch Files'
              isPrimary
              icon='icons/button/download.svg'
            />
          </div>
          <div className={styles.brandMessageBlock}>
            {brand.map((x, i) => (
              <p key={i} className={styles.brandMessage}>
                {x.message}
              </p>
            ))}
          </div>
          <Button
            classNames={styles.mobileBrandButton}
            link='https://www.figma.com/community/file/1123896455146409779/dapplets-project-brand-assets'
            text='Watch Files'
            isPrimary
            icon='icons/button/download.svg'
          />
        </div>
      </div>
    </Layout>
  );
}

export default About;