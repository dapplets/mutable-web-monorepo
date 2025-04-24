'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { ThemeImage } from '@/components/ThemeImage';
import {
  PlatformFeatures,
  PlatformFeaturesMessage,
} from '@/constants/constantsText';
import styles from './FeaturesSection.module.scss';
import gsap from 'gsap';

const FeaturesSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section className={styles.wrapper} ref={sectionRef}>
      <header className={styles.header}>
        <h2 className={styles.title}>
          platform
          <span className={styles.titleAccent}>&nbsp;features</span>
        </h2>
        <FeatureLink />
      </header>

      {PlatformFeatures.map((feature, index) => (
        <FeatureBlock key={index} feature={feature} index={index} />
      ))}
    </section>
  );
};

const FeatureLink = () => {
  const linkRef = useRef<HTMLAnchorElement>(null);

  return (
    <Link
      ref={linkRef}
      prefetch={false}
      target='_blank'
      href='https://chrome.google.com/webstore/detail/dapplets/pjjnaojpjhgbhpfffnjleidmdbajagdj'
      className={styles.featureLink}
    >
      <div className={styles.linkContent}>
        <p className={styles.linkText}>{PlatformFeaturesMessage}</p>
        <ThemeImage
          width={50}
          height={50}
          alt='arrow'
          src='icons/link/arrow-dark.svg'
          className={styles.linkIcon}
        />
      </div>
    </Link>
  );
};

function FeatureBlock({
  feature,
  index,
}: {
  feature: (typeof PlatformFeatures)[0];
  index: number;
}) {
  const blockRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isSecondFeature = index === 1;

  useEffect(() => {
    if (!imageRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(imageRef.current, 
              { y: 100, opacity: 0 },
              { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: 'power2.out'
              }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    observer.observe(imageRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={blockRef}
      className={cn(styles.featureBlock, styles[`featureBlock--${index + 1}`], {
        [styles.featureBlockSpecial]: isSecondFeature,
      })}
    >
      {!isSecondFeature ? (
        <>
          <div ref={imageRef} className={styles.featureImageContainer}>
            <ThemeImage
              width={395}
              height={275}
              alt={`Feature ${index + 1}`}
              src={`icons/home/feature-${index + 1}.svg`}
              className={styles.featureImage}
            />
          </div>
          <div className={styles.featureContent}>
            <div className={styles.featureItems}>
              <div className={cn(styles.featureItem, styles.featureId)}>
                {feature.id}
              </div>
              {feature.features.map((item, i) => (
                <FeatureItem key={i} item={item} index={i} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.featureContentLeft}>
            {feature.features.slice(0, 2).map((item, i) => (
              <FeatureItem key={i} item={item} index={i} />
            ))}
          </div>

          <div ref={imageRef} className={styles.featureImageContainer}>
            <ThemeImage
              width={395}
              height={275}
              alt={`Feature ${index + 1}`}
              src={`icons/home/feature-${index + 1}.svg`}
              className={styles.featureImage}
            />
          </div>

          <div className={styles.featureContentRight}>
            <div className={cn(styles.featureItem, styles.featureId)}>
              {feature.id}
            </div>
            {feature.features.slice(2, 4).map((item, i) => (
              <FeatureItem key={i + 2} item={item} index={i + 2} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeatureItem({
  item,
  index,
}: {
  item: (typeof PlatformFeatures)[0]['features'][0];
  index: number;
}) {
  return (
    <Link
      prefetch={false}
      target='_blank'
      href={item.link}
      className={styles.featureItem}
    >
      <h3 className={styles.itemTitle}>{item.title}</h3>
      <p className={styles.itemText}>{item.text}</p>
    </Link>
  );
}

export default FeaturesSection;