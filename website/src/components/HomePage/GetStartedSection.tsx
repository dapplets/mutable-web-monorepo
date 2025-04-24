'use client';

import React, { useEffect, useRef } from 'react';
import styles from './GetStartedSection.module.scss';
import { getStartedLinks, getStartedMessage } from '@/constants/constantsText';
import { LinkBlock } from '../LinkBlock';
import gsap from 'gsap';

const GetStartedSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const linkBlocksRef = useRef<HTMLDivElement[]>([]);

  const addToLinkBlocksRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      gsap.set(el, { opacity: 0, y: 20 });
      linkBlocksRef.current[index] = el;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              if (headerRef.current) {
                gsap.fromTo(
                  headerRef.current,
                  { y: 50, opacity: 0 },
                  {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.3,
                    ease: 'back.out(1.7)',
                  }
                );
              }
              linkBlocksRef.current.forEach((block, index) => {
                if (block) {
                  gsap.fromTo(
                    block,
                    { y: 50, opacity: 0 },
                    {
                      y: 0,
                      opacity: 1,
                      duration: 0.8,
                      delay: 0.5 + index * 0.15, 
                      ease: 'back.out(1.4)',
                    }
                  );
                }
              });
            }, 300); 
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -150px 0px' 
      }
    );

    observer.observe(sectionRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section className={styles.wrapper} ref={sectionRef}>
      <header className={styles.container} ref={headerRef}>
        <h2 className={styles.title}>{getStartedMessage.title}</h2>
        <p className={styles.text}>{getStartedMessage.content}</p>
      </header>
      {getStartedLinks.map((x, i) => (
        <LinkBlock 
          key={i} 
          content={x} 
          ref={(el) => addToLinkBlocksRef(el, i)} 
        />
      ))}
    </section>
  );
};

export default GetStartedSection;