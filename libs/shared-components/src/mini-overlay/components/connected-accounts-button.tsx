import cn from 'classnames'
import React from 'react'
import { ReactComponent as XIcon } from '../assets/resources/social/x.svg'
import { resources } from './resources'
import { ReactComponent as GitHubIcon } from '../assets/resources/social/github.svg'
import { IConnectedAccountUser } from './types'
import { Copy16 } from '../assets/icons'
import useCopied from '../../hooks/useCopyed'
import styles from './connected-accounts-button.module.scss'

const iconForSocial = {
  twitter: XIcon,
  x: XIcon,
  github: GitHubIcon,
}

export const CAUserButton = ({
  user,
  onClick,
  maxLength = 32,
  color = 'white',
  copyButton = false,
  info = false,
}: {
  user?: IConnectedAccountUser
  onClick?: (account: IConnectedAccountUser) => Promise<void>
  maxLength?: number
  color?: string
  copyButton?: boolean
  info?: boolean
}) => {
  const [, copy] = useCopied(user?.name)
  let InfoIcon: React.FC<React.SVGProps<SVGSVGElement>>
  if (info) {
    InfoIcon = iconForSocial[user.origin]
  }
  return (
    <div
      className={cn(styles.account, {
        [styles.nameUserActive]: user?.accountActive,
        [styles.pointer]: !!onClick,
        [styles.info]: info,
      })}
      style={{ backgroundColor: color }}
      onClick={onClick && (() => user && onClick(user))}
    >
      {user ? (
        <>
          {info && InfoIcon ? (
            <div className={styles.imgUser}>
              <InfoIcon />
            </div>
          ) : (
            <img src={resources[user.origin].icon} className={styles.imgUser} />
          )}
          <h4 className={styles.nameUser}>
            {!info && user.name.length > maxLength
              ? user.name.slice(0, (maxLength - 2) / 2) +
                '...' +
                user.name.slice(-(maxLength - 4) / 2)
              : user.name}
          </h4>
          {copyButton && (
            <button className={styles.copyButton} onClick={() => copy()}>
              <Copy16 />
            </button>
          )}
        </>
      ) : (
        <>
          <div className={cn(styles.imgUser, styles.empty)}></div>
          <h4 className={styles.nameUser}>None</h4>
        </>
      )}
    </div>
  )
}
