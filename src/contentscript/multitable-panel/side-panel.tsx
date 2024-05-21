import { Mutation } from 'mutable-web-engine'
import React, { FC } from 'react'
import styled from 'styled-components'
import { Image } from '../multitable-panel/components/image'

const SidePanelWrapper = styled.div`
  display: flex;
  width: 58px;
  padding: 6px;
  position: absolute;
  top: 55px;
  right: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px 0px 0px 4px;
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #E2E2E5;
  background: #F8F9FF;
  box-shadow: 0 4px 20px 0 rgba(11, 87, 111, 0.15)
  font-family: sans-serif;
  box-sizing: border-box;
`

const ButtonIconWrapper = styled.button`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  width: 46px;
  height: 46px;
  outline: none;
  border: none;
  background: transparent;
  padding: 0;
  border-radius: 50%;
  transition: all 0.2s ease;
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  &:hover {
    transform: scale(1.1);
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  box-sizing: border-box;
  overlow: hidden;
  justify-content: center;
  align-items: center;
  width: 46px;
  padding: 0;
`

// todo: replace on iconDefault. Now - from layout
const IconDefaultProfile = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="46" height="46" viewBox="0 0 46 46" fill="none">
    <rect x="0.5" y="0.5" width="45" height="45" rx="22.5" fill="#02193A" />
    <rect x="0.5" y="0.5" width="45" height="45" rx="22.5" stroke="#E2E2E5" />
    <path
      d="M19.4547 36C19.1732 36 18.8908 35.8999 18.6645 35.696C18.1791 35.2602 18.1398 34.512 18.5765 34.0275C18.7009 33.8891 18.8216 33.7498 18.9385 33.6095L16.2553 30.9262C15.7933 30.4642 15.7933 29.7169 16.2553 29.2549C16.7173 28.7929 17.4646 28.7929 17.9266 29.2549L20.2983 31.6267C20.6097 31.0543 20.8669 30.4614 21.0755 29.8366L19.8017 28.5628C19.3397 28.1008 19.3397 27.3535 19.8017 26.8915C20.2637 26.4295 21.011 26.4295 21.473 26.8915L21.7404 27.159C21.9724 26.7437 22.4493 26.4865 22.9422 26.566C23.5884 26.6596 24.0364 27.2581 23.9429 27.9044C23.8475 28.5609 23.7184 29.1922 23.5538 29.8011C23.552 29.8076 23.5501 29.8151 23.5482 29.8226C22.9581 31.9821 21.9134 33.8536 20.3348 35.6081C20.1019 35.8681 19.7793 35.9991 19.4557 35.9991L19.4547 36ZM11.1826 27.7267C10.859 27.7267 10.5373 27.5948 10.3035 27.3358C9.86674 26.8513 9.90602 26.1031 10.3914 25.6672C16.1599 20.4738 21.8676 22.305 27.2134 21.6475C27.0525 21.2257 27.1433 20.7309 27.4827 20.3914C27.9448 19.9294 28.692 19.9294 29.154 20.3914L29.8339 21.0704C30.4315 20.8694 31.0273 20.6159 31.623 20.2932L31.6193 20.2895C31.1573 19.8275 31.1573 19.0802 31.6193 18.6182C32.0813 18.1562 32.8285 18.1562 33.2905 18.6182L33.6104 18.9371C33.7488 18.8211 33.8881 18.7005 34.0284 18.5752C34.5129 18.1375 35.2611 18.1777 35.6969 18.6631C36.1327 19.1485 36.0944 19.8958 35.609 20.3316C29.8386 25.5251 24.1243 23.6939 18.787 24.3513C18.9469 24.7731 18.8571 25.2679 18.5176 25.6074C18.0556 26.0694 17.3084 26.0694 16.8464 25.6074L16.1674 24.9284C15.5688 25.1276 14.9731 25.3829 14.3783 25.7056L14.3811 25.7093C14.8431 26.1714 14.8431 26.9186 14.3811 27.3806C13.9191 27.8427 13.1718 27.8427 12.7098 27.3806L12.3909 27.0617C12.2516 27.1768 12.1122 27.2974 11.9729 27.4227C11.7475 27.6257 11.4641 27.7267 11.1826 27.7267ZM25.3635 19.4534C25.0614 19.4534 24.7584 19.3383 24.5284 19.1073L24.2609 18.8399C24.028 19.2551 23.5529 19.5001 23.0591 19.4337C22.4129 19.3402 21.9649 18.7407 22.0584 18.0954C22.4933 15.0923 23.6399 12.6447 25.6675 10.3907C26.1052 9.90625 26.8505 9.86697 27.3359 10.3028C27.8204 10.7386 27.8596 11.4868 27.4238 11.9713C27.2994 12.1097 27.1779 12.2491 27.0619 12.3894L29.7451 15.0726C30.2071 15.5346 30.2071 16.2819 29.7451 16.7439C29.2831 17.206 28.5358 17.206 28.0738 16.7439L25.7021 14.3721C25.3897 14.9464 25.1316 15.5421 24.923 16.1688C24.9558 16.1949 24.9876 16.2239 25.0175 16.2539L26.1996 17.436C26.6616 17.898 26.6616 18.6453 26.1996 19.1073C25.9686 19.3383 25.6665 19.4534 25.3644 19.4534H25.3635Z"
      fill="white"
    />
  </svg>
)

interface SidePanelProps {
  baseMutation: Mutation | null
}

export const SidePanel: FC<SidePanelProps> = ({ baseMutation }) => {
  return (
    <SidePanelWrapper
      data-mweb-context-type="mweb-overlay"
      data-mweb-context-parsed={JSON.stringify({ id: 'mweb-overlay' })}
    >
      <ButtonIconWrapper>
        {baseMutation?.metadata.image ? (
          <Image image={baseMutation?.metadata.image} />
        ) : (
          <IconDefaultProfile />
        )}
      </ButtonIconWrapper>

      <ButtonWrapper
        data-mweb-insertion-point="mweb-actions-panel"
        data-mweb-layout-manager="bos.dapplets.near/widget/VerticalLayoutManager"
      />
    </SidePanelWrapper>
  )
}

export default SidePanel
