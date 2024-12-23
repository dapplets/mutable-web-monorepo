import cn from 'classnames'
import { FC } from 'react'
import styled from 'styled-components'

const LoadingListDapplets = styled.div`
  z-index: 3;

  display: flex;

  width: 100%;
  height: calc(100vh - 140px);
  margin: 0 auto;

  background: #fff;
  background-image: url('../assets/icons/svg/loaderSettings.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: 139px 139px;

  &.isGrayPageColor {
    background: #f4f4f4;
  }

  @media (min-width: 320px) and (max-width: 640px) {
    .loadingListDapplets {
      width: 80%;
      height: 80%;
      background-size: 100px 100px;
    }
  }
`

export interface TabLoaderProps {
  isGrayPageColor?: boolean
}

export const TabLoader: FC<TabLoaderProps> = (props) => {
  const { isGrayPageColor } = props
  return (
    <LoadingListDapplets
      className={cn({
        isGrayPageColor: isGrayPageColor,
      })}
    />
  )
}
