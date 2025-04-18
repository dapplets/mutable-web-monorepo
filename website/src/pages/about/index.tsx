import styles from './About.module.scss';
import { Layout } from '@/components/Layout';
import cn from 'classnames';
import { brand, mission, problem, title } from '@/constants/constantsTextAbout';
import { Button } from '@/components/Button';
import { ThemeImage } from '@/components/ThemeImage';

function About() {
  return (
    <Layout
      title='Empowering Web Communities with Dapplets and Mutable Web: Solving Centralization Issues.'
      description='Enhance web experiences with Dapplets and Mutable Web. Empowering web communities, fostering freedom, and enabling new business possibilities. Join us in building a more connected digital world.
    '
    >
      <div className={cn(styles.wrapper, 'fonts  mx-auto flex flex-col ')}>
        <div
          className={cn(
            styles.titleWrapper,
            'container-xl max-xl:container-lg max-lg:container-mob mx-auto flex justify-between max-xl:flex-col max-xl:items-center'
          )}
        >
          <div
            className={cn(
              styles.titleBlock,
              'flex w-6/12 flex-col max-xl:w-full max-xl:items-center'
            )}
          >
            <div className={cn(styles.titleTitle, '')}> {title.title}</div>
            <div className={cn(styles.titleMessage, '')}> {title.message}</div>
            <div className={cn(styles.titleButtons, 'flex justify-between')}>
              <Button
                classNames=''
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
            className={cn(
              styles.iconBlock,
              'flex w-6/12 items-center justify-center'
            )}
          >
            <ThemeImage
              className={cn(styles.supportedBlockIcon, 'noTransition')}
              width={439}
              height={411}
              alt='About'
              src='icons/about/bg-title.svg'
              style={{ transform: 'none', cursor: 'default' }}
            />
          </div>
        </div>
        <div
          className={cn(
            styles.problemWrapper,
            'container-xl max-xl:container-lg max-lg:container-mob mx-auto flex gap-x-40tab max-xl:flex-col'
          )}
        >
          <div className={cn(styles.problemDelimeter, '')}></div>
          <div className={cn(styles.problemTitle, 'flex items-center')}>
            problem statement
          </div>
          <div
            className={cn(
              styles.problemText,
              'flex flex-col gap-y-20 max-xl:gap-y-17'
            )}
          >
            {problem.map((x, i) => (
              <p className={cn(styles.problemTextItem, 'flex')} key={i}>
                {x.message}
              </p>
            ))}
          </div>
        </div>
        <div className={cn(styles.missionBg)}>
          <div
            className={cn(
              styles.missionWrapper,
              'container-xl max-xl:container-lg max-lg:container-mob mx-auto flex gap-x-40tab max-xl:flex-col'
            )}
          >
            <div className={cn(styles.missionTitleBlock, 'flex flex-col')}>
              <div className={cn(styles.missionTitle, 'flex')}>
                our&nbsp;{' '}
                <div className={cn(styles.missionHilight, '')}>mission</div>
              </div>
              <div className={cn(styles.missionMessage, '')}>
                {mission[0].message}
              </div>
            </div>
            <div
              className={cn(
                styles.missionText,
                'flex flex-wrap gap-x-40tab gap-y-45 max-xl:gap-y-40'
              )}
            >
              {mission
                .filter((x, i) => i !== 0)
                .map((x, i) => (
                  <div
                    key={i}
                    className={cn(styles.missionItem, 'flex flex-col')}
                  >
                    <div className={cn(styles.missionItemTitle, 'flex')}>
                      {x.title}
                    </div>
                    <div className={cn(styles.missionItemMessage, 'flex')}>
                      {x.message}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div
          className={cn(
            styles.brandWrapper,
            'container-xl max-xl:container-lg max-lg:container-mob mx-auto flex gap-x-40tab max-xl:flex-col'
          )}
        >
          <div className={cn(styles.brandTitleBlock, 'flex flex-col')}>
            <div className={cn(styles.brandTitle, 'flex')}>brand assets</div>
            <Button
              classNames='max-xl:hidden'
              link='https://www.figma.com/community/file/1123896455146409779/dapplets-project-brand-assets'
              text='Watch Files'
              isPrimary
              icon='icons/button/download.svg'
            />
          </div>
          <div
            className={cn(
              styles.brandMessageBlock,
              'flex justify-between max-xl:flex-col'
            )}
          >
            {brand.map((x, i) => (
              <div key={i} className={cn(styles.brandMessage, 'flex')}>
                {x.message}
              </div>
            ))}
          </div>
          <Button
            classNames={cn(styles.btnBrandMedia, 'xl:hidden')}
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
