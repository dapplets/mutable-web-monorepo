import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { Logotype } from '../Logotype'
import { NavigationButton } from '../NavigationButton'
import { ArrowUpRight } from '../../icons/ArrowUpRight'
import { SignInButton } from '../SignInButton'
import { UserDropdown } from './UserDropdown'
import { DevActionsDropdown } from './DevActionsDropdown'
import { NotificationWidget } from '../NotificationWidget'
import { MutationDropdown } from './MutationDropdown'
import { StarButton } from '../StarButton'

const StyledNavigation = styled.div`
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  background-color: var(--slate-dark-1);
  z-index: 900;
  padding: 12px 0;

  .user-section {
    margin-left: auto;
    > button {
      font-size: 14px;
    }
  }

  .container-xl {
    display: flex;
    align-items: center;

    .navigation-section {
      margin-left: 50px;
      display: flex;

      > div {
        > a {
          margin-right: 20px;
        }
      }
    }

    .user-section {
      display: flex;
      align-items: center;

      .nav-create-btn {
        margin-left: 10px;
      }

      .nav-sign-in-btn {
        margin-left: 10px;
      }
    }

    .arrow-up-right {
      margin-left: 4px;
    }

    .mutable-section {
      margin-left: auto;
      transform: translate(-16px);
      flex: 1;
      max-width: 292px;
    }
  }
`

export function DesktopNavigation(props) {
  return (
    <StyledNavigation>
      <div className="container-xl">
        <Link
          to="/"
          className="logo-link"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        >
          <Logotype />
        </Link>
        <div className="navigation-section">
          <NavigationButton route="/">Home</NavigationButton>
          <NavigationButton route="/edit">Editor</NavigationButton>
          <NavigationButton href={props.documentationHref}>
            Docs
            <ArrowUpRight />
          </NavigationButton>
        </div>
        <div className="mutable-section">
          <MutationDropdown imageSrc={props.widgets.image} />
        </div>
        <div className="user-section">
          <StarButton {...props} />
          <DevActionsDropdown {...props} />
          {!props.signedIn && <SignInButton onSignIn={() => props.requestSignIn()} />}
          {props.signedIn && (
            <>
              <NotificationWidget notificationButtonSrc={props.widgets.notificationButton} />
              <UserDropdown {...props} />
            </>
          )}
        </div>
      </div>
    </StyledNavigation>
  )
}
