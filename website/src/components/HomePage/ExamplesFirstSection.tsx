'use client';

import React, { useRef, useEffect } from 'react';
import styles from './ExamplesFirstSection.module.scss';
import { ThemeImage } from '../ThemeImage';
import { Examples } from '@/constants/constantsText';
import cn from 'classnames';
import gsap from 'gsap';

export const ExamplesFirstSection = () => {
  const exampleBlocksRef = useRef<(HTMLDivElement | null)[]>([]);

  const addToExampleBlocksRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      gsap.set(el.querySelector(`.${styles.imageContainer}`), { 
        opacity: 0, 
        y: 50 
      });
      exampleBlocksRef.current[index] = el;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observers: IntersectionObserver[] = [];

    exampleBlocksRef.current.forEach((block, index) => {
      if (!block) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const imageContainer = entry.target.querySelector(`.${styles.imageContainer}`);
              if (imageContainer) {
                gsap.to(imageContainer, {
                  y: 0,
                  opacity: 1,
                  duration: 0.8,
                  delay: 0.1 * index,
                  ease: 'power2.in',
                });
              }
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.4, 
          rootMargin: '0px 0px -150px 0px' 
        }
      );

      observer.observe(block);
      observers.push(observer);
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>
      examples
      </h2>

      <div className={styles.examplesContainer}>
        {Examples.map((example, index) => (
          <div
            key={index}
            className={cn(styles.exampleBlock, {
              [styles.reverse]: index % 2 !== 0,
            })}
            ref={(el) => addToExampleBlocksRef(el, index)}
          >
            <div className={styles.imageContainer}>
              <ThemeImage
                width={500}
                height={300}
                alt={example.title}
                src={`images/example-${index + 1}.png`}
                className={styles.exampleImage}
              />
            </div>
            <div className={styles.content}>
              <h3 className={styles.exampleTitle}>{example.title}</h3>
              <p className={styles.exampleDescription}>{example.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};



export default ExamplesFirstSection;