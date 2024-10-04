import { useAppDocuments } from '@mweb/engine'
import { ApplicationDto, DocumentDto } from '@mweb/backend'
import React from 'react'
import styled from 'styled-components'
import { Image } from './image'
import { DocumentCard } from './document-card'
import { AppInMutation } from '@mweb/backend'
import { Spin } from 'antd'

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
  &.disabled {
    opacity: 0.7;
  }
  &.disabled:hover {
    background: #fff;
  }
`

const CardBody = styled.div`
  padding: 10px 6px;
  display: flex;
  gap: 6px;
  align-items: center;

  > * {
    min-width: 0;
  }
`

const CardContent = styled.div`
  width: 100%;
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

const Thumbnail = styled.div<{ $shape: 'circle' | 'default' }>`
  display: block;
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  border: 1px solid #eceef0;
  border-radius: ${(props) => (props.$shape === 'circle' ? '99em' : '8px')};
  overflow: hidden;
  outline: none;
  transition: border-color 200ms;

  &:focus,
  &:hover {
    border-color: #d0d5dd;
  }

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
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
  &.disabled {
    cursor: default;
  }
`

const DocumentsWrapper = styled.div`
  display: flex;
  padding-bottom: 10px;
`

const SideLine = styled.div`
  border: 1px solid #c1c6ce;
  margin: 0 10px;
`

const DocumentCardList = styled.div`
  width: 100%;
  margin-right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
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

const UncheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect
      x="3.75"
      y="3.75"
      width="16.5"
      height="16.5"
      rx="3.25"
      stroke="#7A818B"
      strokeWidth="1.5"
    />
    <path
      d="M12 8V16"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8 12H16"
      stroke="#7A818B"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const CheckedIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3.75 0C2.75544 0 1.80161 0.395088 1.09835 1.09835C0.395088 1.80161 0 2.75544 0 3.75V14.25C0 15.2446 0.395088 16.1984 1.09835 16.9016C1.80161 17.6049 2.75544 18 3.75 18H14.25C15.2446 18 16.1984 17.6049 16.9016 16.9016C17.6049 16.1984 18 15.2446 18 14.25V3.75C18 2.75544 17.6049 1.80161 16.9016 1.09835C16.1984 0.395088 15.2446 0 14.25 0H3.75ZM13.281 7.281L8.031 12.531C7.96133 12.6008 7.87857 12.6563 7.78745 12.6941C7.69633 12.7319 7.59865 12.7513 7.5 12.7513C7.40135 12.7513 7.30367 12.7319 7.21255 12.6941C7.12143 12.6563 7.03867 12.6008 6.969 12.531L4.719 10.281C4.64927 10.2113 4.59395 10.1285 4.55621 10.0374C4.51848 9.94627 4.49905 9.84862 4.49905 9.75C4.49905 9.65138 4.51848 9.55373 4.55621 9.46262C4.59395 9.37152 4.64927 9.28873 4.719 9.219C4.85983 9.07817 5.05084 8.99905 5.25 8.99905C5.34862 8.99905 5.44627 9.01848 5.53738 9.05622C5.62848 9.09395 5.71127 9.14927 5.781 9.219L7.5 10.9395L12.219 6.219C12.3598 6.07817 12.5508 5.99905 12.75 5.99905C12.9492 5.99905 13.1402 6.07817 13.281 6.219C13.4218 6.35983 13.5009 6.55084 13.5009 6.75C13.5009 6.94916 13.4218 7.14017 13.281 7.281Z"
      fill="#19CEAE"
    />
  </svg>
)

export interface ISimpleApplicationCardProps {
  src: string
  metadata: ApplicationDto['metadata']
  disabled: boolean
  isChecked: boolean
  onChange: (isChecked: boolean) => void
  iconShape?: 'circle'
  textColor?: string
  backgroundColor?: string
}

export interface IApplicationCardWithDocsProps {
  src: string
  metadata: ApplicationDto['metadata']
  disabled: boolean
  docsIds: AppInMutation['documentId'][]
  onDocCheckboxChange: (docId: string | null, isChecked: boolean) => void
  onOpenDocumentsModal: (docs: DocumentDto[]) => void
}

interface IApplicationCard
  extends ISimpleApplicationCardProps,
    Omit<IApplicationCardWithDocsProps, 'docsIds'> {
  hasDocuments: boolean
  usingDocs: (DocumentDto | null)[]
  allDocs: DocumentDto[]
}

const ApplicationCard: React.FC<IApplicationCard> = ({
  src,
  metadata,
  disabled,
  hasDocuments,
  iconShape,
  textColor,
  backgroundColor,
  isChecked,
  usingDocs,
  allDocs,
  onChange,
  onDocCheckboxChange,
  onOpenDocumentsModal,
}) => {
  const [accountId, , appId] = src.split('/')
  return (
    <Card $backgroundColor={backgroundColor ?? 'white'} className={disabled ? 'disabled' : ''}>
      <CardBody>
        <Thumbnail $shape={iconShape ?? 'default'}>
          <Image
            image={metadata.image}
            fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
            alt={metadata.name}
          />
        </Thumbnail>

        <CardContent>
          <TextLink $color={textColor} bold ellipsis>
            {metadata.name || appId}
          </TextLink>

          <TextLink small ellipsis>
            @{accountId}
          </TextLink>
        </CardContent>

        <ButtonLink
          className={disabled ? 'disabled' : ''}
          disabled={disabled}
          onClick={hasDocuments ? () => onOpenDocumentsModal(allDocs) : () => onChange(!isChecked)}
        >
          {hasDocuments ? <MoreIcon /> : isChecked ? <CheckedIcon /> : <UncheckedIcon />}
        </ButtonLink>
      </CardBody>

      {hasDocuments && usingDocs.length ? (
        <DocumentsWrapper>
          <SideLine />
          <DocumentCardList>
            {usingDocs.map((doc) => (
              <DocumentCard
                key={doc?.id || 'empty'}
                src={doc?.id ?? null}
                metadata={doc?.metadata ?? null}
                onChange={() => onDocCheckboxChange(doc?.id ?? null, false)}
                disabled={disabled}
                appMetadata={metadata}
              />
            ))}
          </DocumentCardList>
        </DocumentsWrapper>
      ) : null}
    </Card>
  )
}

export const SimpleApplicationCard: React.FC<ISimpleApplicationCardProps> = (props) => (
  <ApplicationCard
    {...props}
    hasDocuments={false}
    onOpenDocumentsModal={() => null}
    onDocCheckboxChange={() => null}
    usingDocs={[]}
    allDocs={[]}
  />
)

export const ApplicationCardWithDocs: React.FC<IApplicationCardWithDocsProps> = (props) => {
  const { src, docsIds } = props
  const { documents, isLoading } = useAppDocuments(src)
  const usingDocs: (DocumentDto | null)[] = documents?.filter((doc) => docsIds.includes(doc.id))
  if (docsIds.includes(null)) usingDocs.unshift(null)

  return isLoading ? (
    <Card>
      <CardBody>
        <Spin style={{ width: '100%' }} />
      </CardBody>
    </Card>
  ) : (
    <ApplicationCard
      {...props}
      hasDocuments={true}
      isChecked={false}
      onChange={() => null}
      usingDocs={usingDocs}
      allDocs={documents}
    />
  )
}
