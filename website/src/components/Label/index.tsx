import React, { FC, } from 'react';
import styles from './Label.module.scss';

export interface LabelProps {
  title: string
  subtitle: string
}

export const Label: FC<LabelProps> = ({ title, subtitle }) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.title}>{title}</span>
      <span className={styles.subtitle}>{subtitle}</span>
      </div>
  )
};

export default Label

