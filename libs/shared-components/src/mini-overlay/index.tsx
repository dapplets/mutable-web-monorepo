import { AppWithSettings, Mutation } from '@mweb/engine'
import { useAccountId } from 'near-social-vm'
import React, { FC, ReactElement, useState, useRef, useCallback } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from '../common/Image'
import Profile, { IWalletConnect } from './Profile'
import { Button, Space, notification, Typography, Card } from 'antd'
import { version } from 'os'
import { log } from 'console'
const { Text } = Typography

const Context = React.createContext({ name: 'Default' })

const SidePanelWrapper = styled.div<{ $isApps: boolean }>`
  position: fixed;
  z-index: 5000;
  display: flex;
  width: 58px;
  top: 55px;
  right: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 4px 0px 0px 4px;
  background: ${(props) => (props.$isApps ? '#EEEFF5' : '#F8F9FF')};
  box-shadow: 0 4px 20px 0 rgba(11, 87, 111, 0.15);
  font-family: sans-serif;
  box-sizing: border-box;
`

const TopBlock = styled.div<{ $open?: boolean; $noMutations: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 6px;
  background: ${(props) => (props.$open ? '#fff' : 'transparent')};
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: ${(props) => (props.$noMutations ? '4px 0 0 4px' : '4px 0 0 0')};
  position: relative;
`

const MutationIconWrapper = styled.button<{ $isStopped?: boolean; $isButton: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  width: 46px;
  height: 46px;
  outline: none;
  border: none;
  background: #fff;
  padding: 0;
  border-radius: 50%;
  transition: all 0.15s ease-in-out;
  position: relative;
  box-shadow: 0 4px 5px 0 rgba(45, 52, 60, 0.2);
  cursor: ${(props) => (props.$isButton ? 'pointer' : 'default !important')};

  .labelAppCenter {
    opacity: 0;
  }

  img {
    box-sizing: border-box;
    object-fit: cover;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    filter: ${(props) => (props.$isStopped ? 'grayscale(1)' : 'grayscale(0)')};
    transition: all 0.15s ease-in-out;
  }

  &:hover {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(115%)' : 'none')};
    }
  }

  &:active {
    box-shadow: ${(props) =>
      props.$isButton ? '0px 4px 20px 0px #0b576f26, 0px 4px 5px 0px #2d343c1a' : 'initial'};

    img {
      filter: ${(props) => (props.$isButton ? 'brightness(125%)' : 'none')};
    }
  }

  &:hover .labelAppTop {
    opacity: ${(props) => (props.$isStopped ? '0' : '1')};
  }

  &:hover .labelAppCenter {
    opacity: 1;
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  box-sizing: content-box !important;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 46px;
  margin-top: -7px;
  padding: 0 5px 5px;
`

const Loading = styled.div`
  display: flex;
  box-sizing: border-box;
  width: 46px;
  height: 46px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #fff;
  opacity: 0.8;
`

const AppsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 5px 6px;
  gap: 10px;
`

const LabelAppCenter = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 23px;
  height: 23px;
  cursor: pointer;
  box-sizing: border-box;
`

const LabelAppTop = styled.div`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  top: 0;
  right: 0;
  width: 14px;
  height: 14px;
  cursor: pointer;
`

const ButtonOpenWrapper = styled.div<{ $open?: boolean }>`
  display: flex;
  box-sizing: border-box;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 32px;
  background: ${(props) => (props.$open ? '#fff' : 'transparent')};
  padding-left: 6px;
  padding-right: 6px;
  border-width: 1px 0 1px 1px;
  border-style: solid;
  border-color: #e2e2e5;
  border-radius: 0 0 0 4px;

  .svgTransform {
    svg {
      transform: rotate(180deg);
    }
  }
`

const ButtonOpen = styled.button<{ $open?: boolean }>`
  display: flex;
  box-sizing: border-box;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 22px;
  outline: none;
  background: transparent;
  border-radius: 4px;
  border: ${(props) => (props.$open ? 'none' : '1px solid #e2e2e5')};
  padding: 0;

  path {
    stroke: #7a818b;
  }

  &:hover {
    background: #fff;

    path {
      stroke: #384bff;
    }
  }

  &:active {
    background: #384bff;

    path {
      stroke: #fff;
    }
  }
`

const MutationFallbackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
    <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" fill="#F8F9FF" />
    <rect x="0.5" y="0.5" width="43" height="43" rx="21.5" stroke="#E2E2E5" />
    <g clipPath="url(#clip0_352_10)">
      <path
        d="M32 26.1425C32 27.0292 31.796 27.8418 31.3886 28.5809C30.9807 29.32 30.4355 29.9079 29.7522 30.3446C29.0689 30.7819 28.3075 31 27.4685 31C26.7251 31 26.0356 30.8265 25.4005 30.4796C24.765 30.1326 24.2374 29.6639 23.8181 29.0724C23.4102 29.6639 22.8887 30.1326 22.2536 30.4796C21.6181 30.8265 20.9286 31 20.1857 31C19.3585 31 18.6004 30.7819 17.9109 30.3446C17.2215 29.9079 16.673 29.32 16.2656 28.5809C15.8577 27.8423 15.6542 27.0292 15.6542 26.1425V18.4708C15.6542 17.9387 16.0569 17.507 16.5533 17.507C17.0497 17.507 17.4524 17.9387 17.4524 18.4708V26.1425C17.4524 26.6822 17.575 27.1738 17.821 27.6171C18.0666 28.0605 18.3965 28.414 18.8101 28.6773C19.2236 28.9411 19.6822 29.0724 20.1857 29.0724C20.6892 29.0724 21.1264 28.9471 21.5344 28.6966C21.9418 28.446 22.2688 28.1087 22.5144 27.6846C22.76 27.2605 22.8949 26.7918 22.919 26.2775V18.4708C22.919 17.9387 23.3217 17.507 23.8181 17.507H23.8361C24.3325 17.507 24.7352 17.9387 24.7352 18.4708V26.1425C24.7352 26.6822 24.8578 27.1738 25.1038 27.6171C25.3494 28.0605 25.6793 28.414 26.0928 28.6773C26.5064 28.9411 26.965 29.0724 27.4685 29.0724C27.972 29.0724 28.4305 28.9411 28.8441 28.6773C29.2577 28.414 29.5871 28.0605 29.8331 27.6171C30.0787 27.1738 30.2018 26.6822 30.2018 26.1425V18.4708C30.2018 17.9387 30.6045 17.507 31.1009 17.507C31.5973 17.507 32 17.9387 32 18.4708V26.1425Z"
        fill="#7A818B"
      />
      <path
        d="M12 17.8575C12 16.9708 12.204 16.1582 12.6114 15.4191C13.0193 14.68 13.5645 14.0921 14.2478 13.6554C14.9311 13.2181 15.6925 13 16.5315 13C17.2749 13 17.9644 13.1735 18.5995 13.5204C19.235 13.8674 19.7626 14.3361 20.1819 14.9276C20.5898 14.3361 21.1113 13.8674 21.7464 13.5204C22.3819 13.1735 23.0714 13 23.8143 13C24.6415 13 25.3996 13.2181 26.0891 13.6554C26.7785 14.0921 27.327 14.68 27.7344 15.4191C28.1423 16.1577 28.3458 16.9708 28.3458 17.8575V25.5292C28.3458 26.0613 27.9431 26.493 27.4467 26.493C26.9503 26.493 26.5476 26.0613 26.5476 25.5292V17.8575C26.5476 17.3178 26.425 16.8262 26.179 16.3829C25.9334 15.9396 25.6035 15.586 25.1899 15.3227C24.7764 15.059 24.3178 14.9276 23.8143 14.9276C23.3108 14.9276 22.8736 15.0529 22.4656 15.3035C22.0582 15.554 21.7312 15.8914 21.4856 16.3154C21.24 16.7395 21.1051 17.2082 21.081 17.7226V25.5292C21.081 26.0613 20.6783 26.493 20.1819 26.493H20.1639C19.6675 26.493 19.2648 26.0613 19.2648 25.5292V17.8575C19.2648 17.3178 19.1422 16.8262 18.8962 16.3829C18.6506 15.9396 18.3207 15.586 17.9072 15.3227C17.4936 15.059 17.035 14.9276 16.5315 14.9276C16.028 14.9276 15.5695 15.059 15.1559 15.3227C14.7423 15.586 14.4129 15.9396 14.1669 16.3829C13.9213 16.8262 13.7982 17.3178 13.7982 17.8575V25.5292C13.7982 26.0613 13.3955 26.493 12.8991 26.493C12.4027 26.493 12 26.0613 12 25.5292V17.8575Z"
        fill="#7A818B"
      />
    </g>
    <defs>
      <clipPath id="clip0_352_10">
        <rect width="20" height="18" fill="white" transform="translate(12 13)" />
      </clipPath>
    </defs>
  </svg>
)

const ArrowSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="8" viewBox="0 0 14 8" fill="none">
    <path
      d="M1.5 1.25L7 6.75L12.5 1.25"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const StopTopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <mask
      id="path-1-outside-1_257_34"
      maskUnits="userSpaceOnUse"
      x="0.166687"
      y="0.166672"
      width="16"
      height="16"
      fill="black"
    >
      <rect fill="white" x="0.166687" y="0.166672" width="16" height="16" />
      <path d="M8.00002 2.16667C7.23398 2.16667 6.47543 2.31756 5.7677 2.61071C5.05997 2.90386 4.41691 3.33354 3.87523 3.87522C2.78127 4.96918 2.16669 6.45291 2.16669 8.00001C2.16669 9.5471 2.78127 11.0308 3.87523 12.1248C4.41691 12.6665 5.05997 13.0962 5.7677 13.3893C6.47543 13.6825 7.23398 13.8333 8.00002 13.8333C9.54712 13.8333 11.0308 13.2188 12.1248 12.1248C13.2188 11.0308 13.8334 9.5471 13.8334 8.00001C13.8334 7.23396 13.6825 6.47542 13.3893 5.76769C13.0962 5.05995 12.6665 4.41689 12.1248 3.87522C11.5831 3.33354 10.9401 2.90386 10.2323 2.61071C9.52461 2.31756 8.76607 2.16667 8.00002 2.16667ZM6.25002 6.25001H9.75002V9.75001H6.25002" />
      <path d="M5.66669 5.66667H10.3334V10.3333H5.66669V5.66667Z" />
    </mask>
    <path
      d="M8.00002 2.16667C7.23398 2.16667 6.47543 2.31756 5.7677 2.61071C5.05997 2.90386 4.41691 3.33354 3.87523 3.87522C2.78127 4.96918 2.16669 6.45291 2.16669 8.00001C2.16669 9.5471 2.78127 11.0308 3.87523 12.1248C4.41691 12.6665 5.05997 13.0962 5.7677 13.3893C6.47543 13.6825 7.23398 13.8333 8.00002 13.8333C9.54712 13.8333 11.0308 13.2188 12.1248 12.1248C13.2188 11.0308 13.8334 9.5471 13.8334 8.00001C13.8334 7.23396 13.6825 6.47542 13.3893 5.76769C13.0962 5.05995 12.6665 4.41689 12.1248 3.87522C11.5831 3.33354 10.9401 2.90386 10.2323 2.61071C9.52461 2.31756 8.76607 2.16667 8.00002 2.16667ZM6.25002 6.25001H9.75002V9.75001H6.25002"
      fill="#F43024"
    />
    <path d="M5.66669 5.66667H10.3334V10.3333H5.66669V5.66667Z" fill="white" />
    <path
      d="M2.16669 8.00001H0.166687H2.16669ZM8.00002 13.8333V15.8333V13.8333ZM9.75002 6.25001H11.75V4.25001H9.75002V6.25001ZM9.75002 9.75001V11.75H11.75V9.75001H9.75002ZM5.66669 5.66667V3.66667H3.66669V5.66667H5.66669ZM10.3334 5.66667H12.3334V3.66667H10.3334V5.66667ZM10.3334 10.3333V12.3333H12.3334V10.3333H10.3334ZM5.66669 10.3333H3.66669V12.3333H5.66669V10.3333ZM8.00002 0.166672C6.97133 0.166672 5.95272 0.369287 5.00233 0.762949L6.53307 4.45847C6.99815 4.26582 7.49662 4.16667 8.00002 4.16667L8.00002 0.166672ZM5.00233 0.762949C4.05195 1.15661 3.18841 1.73361 2.46102 2.461L5.28944 5.28943C5.6454 4.93347 6.06799 4.65111 6.53307 4.45847L5.00233 0.762949ZM2.46102 2.461C0.991982 3.93004 0.166687 5.92248 0.166687 8.00001L4.16669 8.00001C4.16669 6.98334 4.57055 6.00832 5.28944 5.28943L2.46102 2.461ZM0.166687 8.00001C0.166687 10.0775 0.991982 12.07 2.46102 13.539L5.28944 10.7106C4.57055 9.99169 4.16669 9.01667 4.16669 8.00001L0.166687 8.00001ZM2.46102 13.539C3.18841 14.2664 4.05195 14.8434 5.00233 15.2371L6.53307 11.5415C6.06799 11.3489 5.6454 11.0665 5.28944 10.7106L2.46102 13.539ZM5.00233 15.2371C5.95272 15.6307 6.97133 15.8333 8.00002 15.8333L8.00002 11.8333C7.49662 11.8333 6.99815 11.7342 6.53307 11.5415L5.00233 15.2371ZM8.00002 15.8333C10.0775 15.8333 12.07 15.008 13.539 13.539L10.7106 10.7106C9.99171 11.4295 9.01668 11.8333 8.00002 11.8333L8.00002 15.8333ZM13.539 13.539C15.0081 12.07 15.8334 10.0775 15.8334 8.00001H11.8334C11.8334 9.01667 11.4295 9.99169 10.7106 10.7106L13.539 13.539ZM15.8334 8.00001C15.8334 6.97132 15.6307 5.9527 15.2371 5.00232L11.5416 6.53305C11.7342 6.99813 11.8334 7.4966 11.8334 8.00001H15.8334ZM15.2371 5.00232C14.8434 4.05193 14.2664 3.18839 13.539 2.461L10.7106 5.28943C11.0666 5.64539 11.3489 6.06797 11.5416 6.53305L15.2371 5.00232ZM13.539 2.461C12.8116 1.73361 11.9481 1.15661 10.9977 0.762949L9.46697 4.45847C9.93206 4.65111 10.3546 4.93347 10.7106 5.28943L13.539 2.461ZM10.9977 0.762949C10.0473 0.369287 9.02871 0.166672 8.00002 0.166672L8.00002 4.16667C8.50342 4.16667 9.00189 4.26582 9.46697 4.45847L10.9977 0.762949ZM6.25002 8.25001H9.75002V4.25001H6.25002V8.25001ZM7.75002 6.25001V9.75001H11.75V6.25001H7.75002ZM9.75002 7.75001H6.25002V11.75H9.75002V7.75001ZM5.66669 7.66667H10.3334V3.66667H5.66669V7.66667ZM8.33335 5.66667V10.3333H12.3334V5.66667H8.33335ZM10.3334 8.33334H5.66669V12.3333H10.3334V8.33334ZM7.66669 10.3333V5.66667H3.66669V10.3333H7.66669Z"
      fill="white"
      mask="url(#path-1-outside-1_257_34)"
    />
  </svg>
)

const PlayCenterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_194_475)">
      <path
        d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2Z"
        fill="#02193A"
      />
      <path d="M16.7 12L9.95 16.3301L9.95 7.66987L16.7 12Z" fill="white" />
      <path
        d="M12 1C10.5555 1 9.12506 1.28452 7.79048 1.83733C6.4559 2.39013 5.24327 3.20038 4.22183 4.22183C2.15893 6.28473 1 9.08262 1 12C1 14.9174 2.15893 17.7153 4.22183 19.7782C5.24327 20.7996 6.4559 21.6099 7.79048 22.1627C9.12506 22.7155 10.5555 23 12 23C14.9174 23 17.7153 21.8411 19.7782 19.7782C21.8411 17.7153 23 14.9174 23 12C23 10.5555 22.7155 9.12506 22.1627 7.79048C21.6099 6.4559 20.7996 5.24327 19.7782 4.22183C18.7567 3.20038 17.5441 2.39013 16.2095 1.83733C14.8749 1.28452 13.4445 1 12 1Z"
        stroke="white"
        strokeWidth="2"
      />
    </g>
    <defs>
      <clipPath id="clip0_194_475">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const StopCenterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_194_487)">
      <mask
        id="path-1-outside-1_194_487"
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="24"
        height="24"
        fill="black"
      >
        <rect fill="white" width="24" height="24" />
        <path d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM9 9H15V15H9" />
        <path d="M8 8H16V16H8V8Z" />
      </mask>
      <path
        d="M12 2C10.6868 2 9.38642 2.25866 8.17317 2.7612C6.95991 3.26375 5.85752 4.00035 4.92893 4.92893C3.05357 6.8043 2 9.34784 2 12C2 14.6522 3.05357 17.1957 4.92893 19.0711C5.85752 19.9997 6.95991 20.7362 8.17317 21.2388C9.38642 21.7413 10.6868 22 12 22C14.6522 22 17.1957 20.9464 19.0711 19.0711C20.9464 17.1957 22 14.6522 22 12C22 10.6868 21.7413 9.38642 21.2388 8.17317C20.7362 6.95991 19.9997 5.85752 19.0711 4.92893C18.1425 4.00035 17.0401 3.26375 15.8268 2.7612C14.6136 2.25866 13.3132 2 12 2ZM9 9H15V15H9"
        fill="#02193A"
      />
      <path d="M8 8H16V16H8V8Z" fill="white" />
      <path
        d="M2 12H0H2ZM12 22V24V22ZM15 9H17V7H15V9ZM15 15V17H17V15H15ZM8 8V6H6V8H8ZM16 8H18V6H16V8ZM16 16V18H18V16H16ZM8 16H6V18H8V16ZM12 0C10.4241 0 8.86371 0.310389 7.4078 0.913446L8.93853 4.60896C9.90914 4.20693 10.9494 4 12 4V0ZM7.4078 0.913446C5.95189 1.5165 4.62902 2.40042 3.51472 3.51472L6.34315 6.34315C7.08601 5.60028 7.96793 5.011 8.93853 4.60896L7.4078 0.913446ZM3.51472 3.51472C1.26428 5.76516 0 8.8174 0 12H4C4 9.87827 4.84285 7.84344 6.34315 6.34315L3.51472 3.51472ZM0 12C0 15.1826 1.26428 18.2348 3.51472 20.4853L6.34315 17.6569C4.84285 16.1566 4 14.1217 4 12H0ZM3.51472 20.4853C4.62902 21.5996 5.95189 22.4835 7.4078 23.0866L8.93853 19.391C7.96793 18.989 7.08602 18.3997 6.34315 17.6569L3.51472 20.4853ZM7.4078 23.0866C8.86371 23.6896 10.4241 24 12 24V20C10.9494 20 9.90914 19.7931 8.93853 19.391L7.4078 23.0866ZM12 24C15.1826 24 18.2348 22.7357 20.4853 20.4853L17.6569 17.6569C16.1566 19.1571 14.1217 20 12 20V24ZM20.4853 20.4853C22.7357 18.2348 24 15.1826 24 12H20C20 14.1217 19.1571 16.1566 17.6569 17.6569L20.4853 20.4853ZM24 12C24 10.4241 23.6896 8.86371 23.0866 7.4078L19.391 8.93853C19.7931 9.90914 20 10.9494 20 12H24ZM23.0866 7.4078C22.4835 5.95189 21.5996 4.62902 20.4853 3.51472L17.6569 6.34315C18.3997 7.08602 18.989 7.96793 19.391 8.93853L23.0866 7.4078ZM20.4853 3.51472C19.371 2.40042 18.0481 1.5165 16.5922 0.913446L15.0615 4.60896C16.0321 5.011 16.914 5.60028 17.6569 6.34315L20.4853 3.51472ZM16.5922 0.913446C15.1363 0.310389 13.5759 0 12 0V4C13.0506 4 14.0909 4.20693 15.0615 4.60896L16.5922 0.913446ZM9 11H15V7H9V11ZM13 9V15H17V9H13ZM15 13H9V17H15V13ZM8 10H16V6H8V10ZM14 8V16H18V8H14ZM16 14H8V18H16V14ZM10 16V8H6V16H10Z"
        fill="white"
        mask="url(#path-1-outside-1_194_487)"
      />
    </g>
    <defs>
      <clipPath id="clip0_194_487">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
)

const IconBranch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
    <g clip-path="url(#clip0_273_2428)">
      <path
        d="M0 7.5C0 5.64348 0.737498 3.86301 2.05025 2.55025C3.36301 1.2375 5.14348 0.5 7 0.5C8.85652 0.5 10.637 1.2375 11.9497 2.55025C13.2625 3.86301 14 5.64348 14 7.5C14 9.35652 13.2625 11.137 11.9497 12.4497C10.637 13.7625 8.85652 14.5 7 14.5C5.14348 14.5 3.36301 13.7625 2.05025 12.4497C0.737498 11.137 0 9.35652 0 7.5ZM5.90625 9.6875C5.90625 8.99362 5.44513 8.40825 4.8125 8.21925V6.562C5.16329 6.45519 5.46417 6.22618 5.66056 5.91652C5.85695 5.60686 5.93584 5.23706 5.88292 4.87421C5.83 4.51137 5.64876 4.17951 5.3721 3.93885C5.09544 3.69818 4.74168 3.56466 4.375 3.5625C4.0067 3.56183 3.65049 3.69392 3.37168 3.93457C3.09287 4.17522 2.91014 4.5083 2.85698 4.87274C2.80382 5.23719 2.8838 5.60858 3.08226 5.91885C3.28071 6.22911 3.58435 6.45744 3.9375 6.562V8.21925C3.58671 8.32606 3.28583 8.55507 3.08944 8.86473C2.89305 9.17439 2.81416 9.54419 2.86708 9.90703C2.92 10.2699 3.10124 10.6017 3.3779 10.8424C3.65456 11.0831 4.00832 11.2166 4.375 11.2188C4.78111 11.2188 5.17059 11.0574 5.45776 10.7703C5.74492 10.4831 5.90625 10.0936 5.90625 9.6875ZM8.75 5.3125H8.96875C9.08478 5.3125 9.19606 5.35859 9.27811 5.44064C9.36016 5.52269 9.40625 5.63397 9.40625 5.75V8.21925C9.05546 8.32606 8.75458 8.55507 8.55819 8.86473C8.3618 9.17439 8.28291 9.54419 8.33583 9.90703C8.38875 10.2699 8.56999 10.6017 8.84665 10.8424C9.12331 11.0831 9.47707 11.2166 9.84375 11.2188C10.2121 11.2194 10.5683 11.0873 10.8471 10.8467C11.1259 10.606 11.3086 10.273 11.3618 9.90851C11.4149 9.54406 11.3349 9.17267 11.1365 8.8624C10.938 8.55214 10.6344 8.3238 10.2812 8.21925V5.75C10.2812 5.4019 10.143 5.06806 9.89683 4.82192C9.65069 4.57578 9.31685 4.4375 8.96875 4.4375H8.75V3.23787C8.75008 3.19455 8.73729 3.15218 8.71326 3.11614C8.68923 3.08009 8.65504 3.052 8.61502 3.03541C8.575 3.01882 8.53095 3.01449 8.48847 3.02296C8.44598 3.03143 8.40697 3.05233 8.37638 3.083L6.73925 4.72013C6.71888 4.74045 6.70272 4.76458 6.69169 4.79116C6.68066 4.81774 6.67498 4.84623 6.67498 4.875C6.67498 4.90377 6.68066 4.93226 6.69169 4.95884C6.70272 4.98542 6.71888 5.00955 6.73925 5.02987L8.37638 6.667C8.40697 6.69767 8.44598 6.71857 8.48847 6.72704C8.53095 6.73551 8.575 6.73118 8.61502 6.71459C8.65504 6.698 8.68923 6.66991 8.71326 6.63386C8.73729 6.59782 8.75008 6.55545 8.75 6.51213V5.3125Z"
        fill="#384BFF"
      />
    </g>
    <defs>
      <clipPath id="clip0_273_2428">
        <rect width="14" height="14" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
)

const IconBranchButton = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
    <path
      d="M2.50066 11.4294C2.08738 11.43 1.68722 11.2844 1.37105 11.0182C1.05488 10.7521 0.843108 10.3826 0.77324 9.97528C0.703372 9.56794 0.779917 9.14903 0.989319 8.79273C1.19872 8.43643 1.52746 8.16573 1.91732 8.02859V4.33026C1.52795 4.19264 1.19977 3.92181 0.990781 3.56562C0.781793 3.20943 0.705457 2.79083 0.775268 2.3838C0.845078 1.97677 1.05654 1.60752 1.37227 1.34133C1.68801 1.07514 2.08768 0.929138 2.50066 0.929138C2.91363 0.929138 3.31331 1.07514 3.62904 1.34133C3.94478 1.60752 4.15624 1.97677 4.22605 2.3838C4.29586 2.79083 4.21952 3.20943 4.01053 3.56562C3.80155 3.92181 3.47336 4.19264 3.08399 4.33026V4.42942C3.08399 4.73884 3.20691 5.03559 3.4257 5.25438C3.64449 5.47317 3.94124 5.59609 4.25066 5.59609H7.75066C8.3695 5.59609 8.96299 5.84192 9.40057 6.27951C9.83816 6.71709 10.084 7.31058 10.084 7.92942V8.02859C10.4734 8.1662 10.8015 8.43704 11.0105 8.79323C11.2195 9.14942 11.2959 9.56802 11.226 9.97505C11.1562 10.3821 10.9448 10.7513 10.629 11.0175C10.3133 11.2837 9.91363 11.4297 9.50066 11.4297C9.08768 11.4297 8.68801 11.2837 8.37227 11.0175C8.05654 10.7513 7.84508 10.3821 7.77527 9.97505C7.70546 9.56802 7.78179 9.14942 7.99078 8.79323C8.19977 8.43704 8.52795 8.1662 8.91732 8.02859V7.92942C8.91732 7.62 8.79441 7.32326 8.57561 7.10447C8.35682 6.88567 8.06008 6.76276 7.75066 6.76276H4.25066C3.84112 6.76292 3.43875 6.65528 3.08399 6.45067V8.02917C3.47275 8.16722 3.80027 8.43812 4.00876 8.79409C4.21726 9.15007 4.29334 9.56824 4.22359 9.97484C4.15384 10.3814 3.94273 10.7503 3.6275 11.0165C3.31228 11.2826 2.9132 11.4288 2.50066 11.4294Z"
      fill="white"
    />
  </svg>
)

const IconNotificationMessage = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path
      d="M1.5 3.5C1.5 3.23478 1.60536 2.98043 1.79289 2.79289C1.98043 2.60536 2.23478 2.5 2.5 2.5H9.5C9.76522 2.5 10.0196 2.60536 10.2071 2.79289C10.3946 2.98043 10.5 3.23478 10.5 3.5V8.5C10.5 8.76522 10.3946 9.01957 10.2071 9.20711C10.0196 9.39464 9.76522 9.5 9.5 9.5H2.5C2.23478 9.5 1.98043 9.39464 1.79289 9.20711C1.60536 9.01957 1.5 8.76522 1.5 8.5V3.5Z"
      stroke="#7A818B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M1.5 3.5L6 6.5L10.5 3.5"
      stroke="#7A818B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)
const IconNotificationClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
    <path
      d="M1.5 3.5L6 6.5L10.5 3.5"
      stroke="#7A818B"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

interface IMutationAppsControl {
  enableApp: () => Promise<void>
  disableApp: () => Promise<void>
  isLoading: boolean
}

interface IAppSwitcherProps extends IMutationAppsControl {
  app: AppWithSettings
}

interface IMiniOverlayProps extends Partial<IWalletConnect> {
  baseMutation: Mutation | null
  mutationApps: AppWithSettings[]
  children: ReactElement
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}

export const AppSwitcher: FC<IAppSwitcherProps> = ({ app, enableApp, disableApp, isLoading }) => (
  <>
    {isLoading ? (
      <Loading>
        <Spinner animation="border" variant="primary"></Spinner>
      </Loading>
    ) : (
      <MutationIconWrapper
        title={app.appLocalId}
        $isStopped={!app.settings.isEnabled}
        $isButton={true}
      >
        {app?.metadata.image ? <Image image={app?.metadata.image} /> : <MutationFallbackIcon />}

        {!app.settings.isEnabled ? (
          <LabelAppTop className="labelAppTop">
            <StopTopIcon />
          </LabelAppTop>
        ) : null}

        {app.settings.isEnabled ? (
          <LabelAppCenter className="labelAppCenter" onClick={disableApp}>
            <StopCenterIcon />
          </LabelAppCenter>
        ) : (
          <LabelAppCenter className="labelAppCenter" onClick={enableApp}>
            <PlayCenterIcon />
          </LabelAppCenter>
        )}
      </MutationIconWrapper>
    )}
  </>
)

export enum NotificationType {
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface NotificationData {
  author?: string
  number?: string
  date?: string
  time?: string
  name?: string
  applicationCommitData?: {
    name: string
    version: string
  }
  targetApplication?: string
  near?: string
}

export interface NotificationActions {
  label: string
  type?: 'primary' | 'default'
  onClick?: () => void
  icon?: React.ReactNode
}

export type NotificationProps = {
  subject: NotificationData
  body: NotificationData
  type: NotificationType

  actions: NotificationActions[]
  duration: number
}

export const MiniOverlay: FC<IMiniOverlayProps> = ({
  baseMutation,
  mutationApps,
  connectWallet,
  disconnectWallet,
  nearNetwork,
  children,
  trackingRefs = new Set(),
}) => {
  const [api, contextHolder] = notification.useNotification({
    getContainer: () => {
      if (!rootRef.current) throw new Error('Viewport is not initialized')
      return rootRef.current
    },
  })

  const openNotify = useCallback(
    (notificationProps: NotificationProps, id: string) => {
      api[notificationProps.type]({
        key: id,
        duration: 0,
        message: createSingleNotification('message', id, notificationProps.subject),
        description: createSingleNotification('description', id, notificationProps.body),
        btn: createSingleNotification(
          'btn',
          id,
          notificationProps.body,
          notificationProps.actions,
          () => api.destroy(id)
        ),
        placement: 'bottomRight',
        icon: <IconBranch />,
        closeIcon: <IconNotificationMessage />,
      })
    },
    [api]
  )

  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setProfileOpen] = useState(false)
  const loggedInAccountId = useAccountId()

  const rootRef = useRef<HTMLDivElement>(null)
  const openCloseWalletPopupRef = useRef<HTMLButtonElement>(null)
  trackingRefs.add(rootRef)

  const handleMutationIconClick = () => {
    openNotify(
      {
        subject: {
          author: 'author',
          number: 'number',
          date: 'date',
          time: 'time',
          name: 'name',
        },
        body: {
          author: 'author',
          number: undefined,
          date: undefined,
          time: undefined,
          name: undefined,
          applicationCommitData: {
            name: 'applicationCommitData name',
            version: 'applicationCommitData version',
          },
          targetApplication: 'targetApplication',
          near: 'near',
        },
        type: NotificationType.Info,
        actions: [
          {
            label: 'Decline',

            onClick: () => console.log('Decline'),
            icon: <IconNotificationClose />,
          },
          {
            label: 'Review',

            onClick: () => console.log('Review'),
          },
          {
            label: 'Accept',
            type: 'primary',
            onClick: () => console.log('Accept'),
            icon: <IconBranchButton />,
          },
        ],
        duration: 0,
      },
      `${Date.now()}`
    )
    setProfileOpen((val) => !val)
  }

  const isMutationIconButton = !!connectWallet && !!disconnectWallet && !!nearNetwork

  return (
    <SidePanelWrapper
      ref={rootRef}
      $isApps={mutationApps.length > 0}
      data-mweb-context-type="mweb-overlay"
      data-mweb-context-parsed={JSON.stringify({ id: 'mweb-overlay' })}
    >
      <Context.Provider value={{ name: 'Default' }}>{contextHolder}</Context.Provider>
      <TopBlock $open={isOpen || mutationApps.length > 0} $noMutations={!mutationApps.length}>
        <MutationIconWrapper
          $isButton={isMutationIconButton}
          title={baseMutation?.metadata.name}
          onClick={handleMutationIconClick}
          ref={openCloseWalletPopupRef}
          data-mweb-context-type="mweb-overlay"
          data-mweb-context-parsed={JSON.stringify({
            id: isMutationIconButton ? 'mutation-button' : 'mutation-icon',
          })}
        >
          {baseMutation?.metadata.image ? (
            <Image image={baseMutation?.metadata.image} />
          ) : (
            <MutationFallbackIcon />
          )}
          <div data-mweb-insertion-point="mutation-icon" style={{ display: 'none' }} />
        </MutationIconWrapper>
      </TopBlock>
      {isOpen || !mutationApps.length ? null : (
        <ButtonWrapper
          data-mweb-insertion-point="mweb-actions-panel"
          data-mweb-layout-manager="vertical"
        />
      )}
      {isOpen ? <AppsWrapper>{children}</AppsWrapper> : null}
      {mutationApps.length > 0 ? (
        <ButtonOpenWrapper
          $open={isOpen || mutationApps.length > 0}
          data-mweb-context-type="mweb-overlay"
          data-mweb-context-parsed={JSON.stringify({ id: 'open-apps-button' })}
        >
          <ButtonOpen
            $open={isOpen}
            className={isOpen ? 'svgTransform' : ''}
            onClick={() => setIsOpen(!isOpen)}
          >
            <ArrowSvg />
          </ButtonOpen>
          <div data-mweb-insertion-point="open-apps-button" style={{ display: 'none' }} />
        </ButtonOpenWrapper>
      ) : null}
      {isProfileOpen && isMutationIconButton ? (
        <Profile
          accountId={loggedInAccountId}
          closeProfile={() => {
            setProfileOpen(false)
          }}
          connectWallet={connectWallet}
          disconnectWallet={disconnectWallet}
          nearNetwork={nearNetwork}
          trackingRefs={trackingRefs}
          openCloseWalletPopupRef={openCloseWalletPopupRef}
        />
      ) : null}
      <div data-mweb-insertion-point="mweb-overlay" style={{ display: 'none' }} />
    </SidePanelWrapper>
  )
}

export const createSingleNotification = (
  type: 'description' | 'message' | 'btn',
  id: string,

  data: NotificationData,
  actions?: NotificationActions[],
  destroy?: any
) => {
  return type === 'message' ? (
    <Space direction="vertical">
      <Space size="large" direction="horizontal">
        <Text type="secondary">
          #{data.number}
          &ensp; {data.name}&ensp; {data.author}&ensp; on&ensp;{data.date} &ensp; at&ensp;{' '}
          {data.time}
        </Text>
      </Space>

      <Space direction="horizontal">
        <Text strong underline>
          {data.name}
        </Text>
      </Space>
    </Space>
  ) : type === 'description' ? (
    <Space direction="vertical">
      <Card
        style={{
          borderRadius: '10px',
          padding: '10px',
          background: '#F8F9FF',
          width: '100%',
          display: 'inline-flex',
        }}
      >
        <Text type="secondary">
          <Text underline>{data.author}&ensp;</Text> asks you to accept changes from&ensp;
          <Text underline> {data.applicationCommitData?.name} </Text>&ensp;
          <Text underline> {data.applicationCommitData?.version} </Text>&ensp;
          {data.applicationCommitData?.version} &ensp;({data.near})&ensp; into your&ensp;
          <Text underline> {data.targetApplication} </Text>.
        </Text>
      </Card>
    </Space>
  ) : (
    <Space direction="horizontal">
      {actions && actions.length
        ? actions.map((action, i) => (
            <Button
              key={i}
              type={action.type ?? 'primary'}
              size="middle"
              onClick={() => {
                action.onClick?.()
                destroy(id)
              }}
            >
              {action.icon}
              {action.label}
            </Button>
          ))
        : null}
    </Space>
  )
}
