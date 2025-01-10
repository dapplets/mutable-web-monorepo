import cn from 'classnames'
import React, { ReactElement, ReactNode } from 'react'
import styled from 'styled-components'

const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  height: 100%;

  .title,
  .subtitle {
    margin-right: auto;
    margin-left: auto;
  }

  .title {
    padding: 0 0 4px;
    font-size: 22px;
    font-weight: 700;
    line-height: 26px;
    color: #2a2a2a;
  }

  .otherTitle {
    width: 252px;
    padding-bottom: 20px;
    text-align: center;
  }

  .subtitle {
    display: block;
    padding: 0 20px 10px;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
    color: #919191;
    text-align: center;
  }

  .otherSubtitle {
    padding-bottom: 20px;
  }

  .children {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 0 30px;
  }

  .link {
    display: block;
    margin-top: 9px;
    font-size: 14px;
    font-weight: 400;
    line-height: 100%;
    color: #d9304f;
    text-align: center;

    &:hover {
      color: #eb9dab;
    }

    &:active {
      color: #a6253c;
    }
  }
`

export interface MessageProps {
  title: string
  subtitle?: string | ReactElement
  link?: string
  linkText?: string
  children?: ReactNode
  className?: string
  otherSubtitle?: boolean
}

export const Message = ({
  title,
  subtitle,
  link,
  linkText,
  children,
  className,
  otherSubtitle,
}: MessageProps): ReactElement => {
  return (
    <MessageContainer className={cn(className)}>
      <h6
        className={cn('title', {
          otherTitle: otherSubtitle,
        })}
      >
        {title}
      </h6>
      {subtitle && typeof subtitle === 'string'
        ? subtitle?.length > 0 && (
            <p
              className={cn('subtitle', {
                otherSubtitle: otherSubtitle,
              })}
            >
              {subtitle}
            </p>
          )
        : subtitle}
      {children && <div className="children">{children}</div>}
      {link?.length ? (
        <a href={link} className="link">
          {linkText}
        </a>
      ) : null}
    </MessageContainer>
  )
}
