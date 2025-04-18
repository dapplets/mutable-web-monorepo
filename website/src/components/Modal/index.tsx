'use client';
import styles from './Modal.module.scss';
import Image from 'next/image';
import { Button } from '../Button';
import { ThemeImage } from '../ThemeImage';

export interface ModalProps {
  isModalOpen: boolean;
  setModalOpen: (x: boolean) => void;
}

export function Modal({ isModalOpen, setModalOpen }: ModalProps) {
  if (!isModalOpen) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>
            MWM - the Mutable Web
            <br className={styles.titleBr} /> Manifesto
          </h2>
          <ThemeImage
            onClick={() => setModalOpen(false)}
            className={styles.close}
            width={24}
            height={24}
            alt='close'
            src='icons/modal/x.svg'
          />
        </div>

        <div className={styles.scrollBlock}>
          <div className={styles.imgBlock}>
            <Image
              src='/img/modal.png'
              width={820}
              height={350}
              alt='Mutable Web Manifesto'
              priority
            />
          </div>

          <div className={styles.textBlock}>
            <div className={styles.subtitle}>
              <strong>Web3 needs a new decentralized UI/UX layer.</strong>
            </div>

            <p className={styles.text}>
              <strong>The flaw</strong> of the current paradigm
              <strong>
                {' '}
                is in the website owner&apos;s ability to control
              </strong>{' '}
              what
              <strong> the community</strong> can see, say, and use. The current
              Web3 paradigm hopes to solve the problem by making the owner
              resilient, decentralized, and inclusive. Nevertheless, it changes
              nothing in the owner&apos;s ability to control the user experience
              and, thereby, the community. Still, in the end, it only makes the
              owner&apos;s role even more resilient and powerful in the hope of
              his benevolence. We need to find a new balance of power between
              the owner and the user community.
              <strong> No matter who the owner is.</strong>
            </p>

            <p className={styles.text}>
              Currently, the browser displays the website exactly as specified
              by the owner. The website owner can reject any request from the
              community and enforce any change.
              <strong>
                {' '}
                This monopoly over the UX layer is the root cause of the
                owner&apos;s power.
              </strong>
              However, the browser runs on the user&apos;s computer and under
              his physical control. Therefore, the user always has the power to
              customize the UX and share it within the community. It is what the
              Mutable Web is for.
            </p>

            <p className={styles.text}>
              Mutable Web is a<strong> new user-centric web paradigm</strong>{' '}
              where every sub-community can customize the website to fit their
              specific needs and, at the same time, stay in the whole community.
              <strong> Communities become self-sovereign</strong> and resilient,
              <strong> can earn their own money</strong>, and set their own
              rules.
              <strong>
                {' '}
                No owner can enforce rules against the community will
              </strong>{' '}
              in the long term anymore. Website owners can now focus on the main
              functionality and don&apos;t need to bother with the feature
              requests - communities will take care of themselves. Mutable Web
              is the future of web3 we are building.
            </p>
          </div>

          <div className={styles.buttonBlock}>
            <Button
              onClick={() => setModalOpen(false)}
              text='Join us'
              isPrimary
            />
          </div>
        </div>
      </div>
    </div>
  );
}
