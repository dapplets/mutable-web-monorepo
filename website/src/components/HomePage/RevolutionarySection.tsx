import React, { FC } from 'react';
import styles from './RevolutionarySection.module.scss';
import cn from 'classnames';


const RevolutionarySection:FC = () => {
    return (
        <section className={styles.wrapper}>
            <header className={styles.titleBlock}>
                <h2 className={styles.title}>
                    why is&nbsp;it<br />
                    <span className={cn(styles.title, styles['title--color'])}>revolutionary</span>

                </h2>
                <p className={styles.subtitle}>It&nbsp;enables applications you have never seen before,
                    all without asking anyone&rsquo;s permission!</p>
            </header>
            <article className={styles.article}>
                <p className={styles.text}><b className={styles['text--bold']}>Users&nbsp;</b>&mdash; can now customize existing sites as&nbsp;they wish and follow custom&nbsp;UX created by&nbsp;developers.</p>
                <p className={styles.text}><b>Developers&nbsp;</b>&mdash; can add new contextual services to&nbsp;these sites and customize the&nbsp;UX as&nbsp;they see fit.</p>
                <p className={styles.text}><b>Communities&nbsp;</b>&mdash; can embed their workflows directly into other people&amp;apos;s websites, run their own economies, and earn their own money. This makes communities economically self-sustaining and resilient.</p>
                <p className={cn(styles.text, styles['text--hilight'])}>The Mutable Web initiates a&nbsp;permissionless, global shift from the traditional legacy Web toward Web3, driven by&nbsp;token-based incentives and decentralized governance.</p>
            </article>
        </section>
    );
};

export default RevolutionarySection;