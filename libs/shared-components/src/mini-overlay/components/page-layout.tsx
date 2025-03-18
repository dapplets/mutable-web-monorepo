import React, { forwardRef } from 'react'
import { useNavigate } from 'react-router'
import styled from 'styled-components'
import { ArrowIcon, Home } from '../assets/icons'

const Container = styled.div`
  --primary: oklch(53% 0.26 269.37); // rgb(56, 75, 255)
  --primary-hover: oklch(47.4% 0.2613 267.51); // rgb(36, 55, 235)
  --primary-pressed: oklch(42.2% 0.2585 265.62); // rgb(16, 35, 215)

  --main-grey: rgb(145, 145, 145);
  --content-black: rgb(116, 115, 118);

  --gray: rgb(122, 129, 139);
  --gray-hover: rgb(69, 71, 75);
  --gray-active: rgb(21, 21, 22);

  --pure-white: white;
  --muddy-white: rgb(248, 249, 255);
  --web-bg: rgb(234, 240, 240);

  --pure-black: black;
  --main-black: rgb(2, 25, 58);

  --warning: rgba(246, 133, 27, 1);
  --success: rgba(25, 206, 174, 1);
  --error: rgba(217, 48, 79, 1);

  --font-default: system-ui, Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue',
    sans-serif;
  --transition-default: all 0.1s ease;

  * {
    margin: 0;
    padding: 0;
    border: 0;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :focus,
  :active {
    outline: none;
  }

  a:focus,
  a:active {
    outline: none;
  }

  input,
  button,
  textarea {
    font-family: inherit;
  }

  input::-ms-clear {
    display: none;
  }

  button {
    cursor: pointer;
  }

  button::-moz-focus-inner {
    padding: 0;
    border: 0;
  }

  /* stylelint-disable-next-line no-descending-specificity */
  a,
  a:visited {
    text-decoration: none;
  }

  a:hover {
    text-decoration: none;
  }

  ul {
    list-style: none;
  }

  li {
    list-style: none;
  }

  img {
    vertical-align: top;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: inherit;
    font-weight: 400;
  }

  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 0;
  gap: 10px;
  font-family: var(--font-default);
`

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  margin: 6px 10px 0 !important;
`

const HomeIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  width: 20px;
  height: 20px;
  color: var(--gray);

  svg {
    width: 22px;
    height: 22px;
  }
`

const BackButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  width: 20px;
  height: 20px;
  padding: 0 !important;
  color: var(--gray);
  background: none;
  transform: rotate(90deg);
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: #4096ff;
  }

  &:active {
    color: #0958d9;
  }
`

const H1 = styled.h1`
  margin: 0 !important;
  font-family: system-ui, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  color: #02193a;
  font-size: 22px !important;
  font-weight: 600 !important;
  line-height: 120%;
  text-align: center;
  text-underline-position: from-font;
  text-decoration-skip-ink: none;
  user-select: none;
`

interface PageLayoutProps {
  title: string
  children: React.ReactNode | null
  backPath?: string | -1
}

const PageLayout = forwardRef<HTMLDivElement, PageLayoutProps>(
  ({ title, children, backPath }, ref) => {
    const navigate = useNavigate()
    return (
      <Container ref={ref} data-testid={`${title.toLowerCase()}-page`}>
        <Header>
          {title === 'Main' ? (
            <HomeIcon>
              <Home />
            </HomeIcon>
          ) : (
            <BackButton onClick={() => navigate((backPath as string) ?? '/main')}>
              <ArrowIcon />
            </BackButton>
          )}
          <H1>{title}</H1>
        </Header>
        {children}
      </Container>
    )
  }
)

export default PageLayout
