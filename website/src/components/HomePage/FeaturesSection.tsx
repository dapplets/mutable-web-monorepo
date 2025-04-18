import React from 'react';
import Link from 'next/link';
import cn from 'classnames';
import { ThemeImage } from '@/components/ThemeImage';
import {
  PlatformFeatures,
  PlatformFeaturesMessage,
} from '@/constants/constantsText';
import styles from './FeaturesSection.module.scss';

const FeaturesSection = () => {
  return (
    <section className={styles.wrapper}>
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
  return (
    <Link
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
  const isSecondFeature = index === 1;

  return (
    <div
      className={cn(styles.featureBlock, styles[`featureBlock--${index + 1}`], {
        [styles.featureBlockSpecial]: isSecondFeature,
      })}
    >
      {!isSecondFeature ? (
        <>
          <div className={styles.featureImageContainer}>
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
                <FeatureItem key={i} item={item} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.featureContentLeft}>
            {feature.features.slice(0, 2).map((item, i) => (
              <FeatureItem key={i} item={item} />
            ))}
          </div>

          <div className={styles.featureImageContainer}>
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
              <FeatureItem key={i} item={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FeatureItem({
  item,
}: {
  item: (typeof PlatformFeatures)[0]['features'][0];
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
