import React from 'react';
import styles from './GetStartedSection.module.scss';
import { getStartedLinks, getStartedMessage } from '@/constants/constantsText';
import { LinkBlock } from '../LinkBlock';

const GetStartedSection = () => {
  return (
    <section className={styles.wrapper}>
      <header className={styles.container}>
        <h2 className={styles.title}>{getStartedMessage.title}</h2>
        <p className={styles.text}>{getStartedMessage.content}</p>
      </header>
      {getStartedLinks.map((x, i) => (
        <LinkBlock key={i} content={x} />
      ))}
    </section>
  );
};

export default GetStartedSection;
