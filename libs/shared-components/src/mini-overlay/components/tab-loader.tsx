import cn from 'classnames'
import React, { FC } from 'react'
import styles from './tab-loader.module.scss'
export interface TabLoaderProps {
  isGrayPageColor?: boolean
}
export const TabLoader: FC<TabLoaderProps> = (props) => {
  const { isGrayPageColor } = props
  return (
    <div
      className={cn(styles.loadingListDapplets, {
        [styles.isGrayPageColor]: isGrayPageColor,
      })}
    ></div>
  )
}
