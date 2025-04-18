import styles from './About.module.scss';
import { Layout } from '@/components/Layout';
import { brand, mission, problem, title } from '@/constants/constantsTextAbout';
import { Button } from '@/components/Button';
import { ThemeImage } from '@/components/ThemeImage';

function About() {
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
                link='https://chrome.google.com/webstore/detail/dapplets/pjjnaojpjhgbhpfffnjleidmdbajagdj'
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
          <div className={styles.iconBlock}>
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
