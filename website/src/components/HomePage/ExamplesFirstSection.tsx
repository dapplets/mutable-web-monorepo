'use client';

import React, { useRef, useEffect } from 'react';
import styles from './ExamplesFirstSection.module.scss';
import { ThemeImage } from '../ThemeImage';
import { Examples } from '@/constants/constantsText';
import cn from 'classnames';
import gsap from 'gsap';
import Label from '../Label';

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
            <div className={cn(styles.label,styles['label--top'], index % 2 == 0 && styles['label--top-2'], index % 2 !== 0 && styles['label--top-1'])}>
              <Label title={example.labelTop.label} subtitle={example.labelTop.subLabel}/>
              </div>
             <ThemeImage
                width={500}
                height={61}
                alt={example.title}
                src={`icons/home/arrow-example-${index + 1}.svg`}
                className={cn(styles.labelImg,index % 2 !== 0 && styles['labelImg--top-1'],index % 2 == 0 && styles['labelImg--top-2'])}
              />
               <ThemeImage
                width={500}
                height={61}
                alt={example.title}
                src={`icons/home/arrow-example-${index + 1}-bottom.svg`}
                className={cn(styles.labelImg,index % 2 !== 0 && styles['labelImg--bottom-1'],index % 2 == 0 && styles['labelImg--bottom-2'])}
              />
            <div className={cn(styles.label,styles['label--bottom'], index % 2 == 0 && styles['label--bottom-2'],index % 2 !== 0 && styles['label--bottom-1'])}>
              <Label title={example.labelBottom.label} subtitle={example.labelBottom.subLabel}/>
              </div>
          </div>
        ))}
      </div>
    </section>
  );
};



export default ExamplesFirstSection;