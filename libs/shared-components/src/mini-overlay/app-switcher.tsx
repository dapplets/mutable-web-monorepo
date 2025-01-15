import { AppInstanceWithSettings, AppWithSettings } from '@mweb/backend'
import React, { FC } from 'react'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'
import { Image } from '../common/image'
import { MutationFallbackIcon, PlayCenterIcon, StopCenterIcon, StopTopIcon } from './assets/icons'
import { useMutationApp } from '@mweb/engine'

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

interface IAppSwitcherProps {
  app: AppInstanceWithSettings
}

export const AppSwitcher: FC<IAppSwitcherProps> = ({ app }) => {
  const docMeta = (app as any).documentId?.split('/')

  const { enableApp, disableApp, isLoading } = useMutationApp(app.instanceId)

  return (
    <>
      {isLoading ? (
        <Loading>
          <Spinner animation="border" variant="primary"></Spinner>
        </Loading>
      ) : (
        <MutationIconWrapper
          title={
            (app as any).documentId
              ? `${app.localId}:\n${docMeta?.[2]}\nby ${docMeta?.[0]}`
              : app.localId
          }
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
}
