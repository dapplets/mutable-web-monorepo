import { AppInstanceWithSettings, EntitySourceType } from '@mweb/backend'
import { useDisableApp, useEnableApp } from '@mweb/react-engine'
import React from 'react'
import Spinner from 'react-bootstrap/Spinner'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { PlayCenterIcon, StopCenterIcon, StopTopIcon } from '../assets/icons'
import { Badge } from '../../common/badge-with-icon'
import { Image } from '../../common/image'

const Card = styled.div<{ $backgroundColor?: string }>`
  position: relative;
  width: 100%;
  border-radius: 10px;
  background: ${(p) => p.$backgroundColor};
  border: 1px solid #eceef0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  &:hover {
    background: rgba(24, 121, 206, 0.1);
  }
`

const CardBody = styled.div`
  padding: 10px 6px;
  display: flex;
  gap: 10px;
  align-items: center;

  > * {
    min-width: 0;
  }
`

const CardContent = styled.div`
  flex: 1 0;
`

type TTextLink = {
  bold?: boolean
  small?: boolean
  ellipsis?: boolean
  $color?: string
}

const TextLink = styled.div<TTextLink>`
  display: block;
  margin: 0;
  font-size: 14px;
  line-height: 18px;
  color: ${(p) =>
    p.$color ? `${p.$color} !important` : p.bold ? '#11181C !important' : '#687076 !important'};
  font-weight: ${(p) => (p.bold ? '600' : '400')};
  font-size: ${(p) => (p.small ? '12px' : '14px')};
  overflow: ${(p) => (p.ellipsis ? 'hidden' : 'visible')};
  text-overflow: ${(p) => (p.ellipsis ? 'ellipsis' : 'unset')};
  white-space: nowrap;
  outline: none;
`

const ButtonLink = styled.button`
  padding: 8px;
  cursor: pointer;
  text-decoration: none;
  outline: none;
  border: none;
  background: inherit;
  &:hover,
  &:focus {
    text-decoration: none;
    outline: none;
    border: none;
    background: inherit;
  }
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

const MoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10 8L14 12L10 16"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x="3.75"
      y="3.75"
      width="16.5"
      height="16.5"
      rx="3.25"
      stroke="#7A818B"
      strokeWidth="1.5"
    />
  </svg>
)

export interface ISimpleApplicationCardProps {
  app: AppInstanceWithSettings
  mutationId: string
}

const ApplicationCard: React.FC<ISimpleApplicationCardProps> = ({ app, mutationId }) => {
  const navigate = useNavigate()
  const { enableApp, isLoading: isAppEnabling } = useEnableApp(mutationId, app.instanceId)
  const { disableApp, isLoading: isAppDisabling } = useDisableApp(mutationId, app.instanceId)

  const handleOpenAppPage = () => navigate('/applications/' + app.id)

  const [accountId, , appId] = app.id.split('/')
  const docMeta = (app as any).documentId?.split('/')
  const isLoading = isAppEnabling || isAppDisabling

  return (
    <>
      {isLoading ? (
        <Loading>
          <Spinner animation="border" variant="primary"></Spinner>
        </Loading>
      ) : (
        <Card $backgroundColor={'white'}>
          <CardBody>
            <MutationIconWrapper
              title={
                (app as any).documentId
                  ? `${app.localId}:\n${docMeta?.[2]}\nby ${docMeta?.[0]}`
                  : app.localId
              }
              $isStopped={!app.settings.isEnabled}
              $isButton={true}
            >
              <Image
                image={app.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={app.metadata.name}
              />

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

            <CardContent>
              <TextLink bold ellipsis>
                {app.metadata.name || appId}
              </TextLink>

              <TextLink small ellipsis>
                {app.source === EntitySourceType.Local && (
                  <Badge margin="0 8px 0 0" text={app.source} theme={'yellow'} />
                )}{' '}
                {accountId ? `@${accountId}` : null}
              </TextLink>
            </CardContent>

            <ButtonLink onClick={handleOpenAppPage}>
              <MoreIcon />
            </ButtonLink>
          </CardBody>
        </Card>
      )}
    </>
  )
}

export default ApplicationCard
