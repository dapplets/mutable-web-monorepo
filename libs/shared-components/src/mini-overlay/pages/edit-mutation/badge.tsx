import React, { FC } from 'react'
import styled from 'styled-components'

const SizeMap = {
  tiny: {
    gap: '2px',
    height: undefined,
    padding: '2px',
    iconSize: undefined,
  },
  small: {
    gap: '3px',
    height: '18px',
    padding: '3px',
    iconSize: '12px',
  },
}

const Wrapper = styled.span<{
  $theme: 'yellow' | 'blue' | 'white'
  $margin: string
  $isClickable: boolean
  $size: keyof typeof SizeMap
}>`
  display: inline-flex;
  text-transform: uppercase;
  padding: ${(props) => SizeMap[props.$size].padding};
  border-radius: 4px;
  line-height: 1;
  background: ${(props) =>
    props.$theme === 'yellow' ? '#FAC20A' : props.$theme === 'blue' ? '#384BFF' : '#fff'};
  color: ${(props) => (props.$theme === 'yellow' || props.$theme === 'blue' ? '#fff' : '#384BFF')};
  font-size: 8px;
  font-weight: 600;
  margin: ${(props) => props.$margin};
  align-items: center;
  justify-content: center;
  gap: ${(props) => SizeMap[props.$size].gap};
  height: ${(props) => SizeMap[props.$size].height};

  ${(props) =>
    props.$isClickable
      ? `
          &:hover:not(:disabled) {
            opacity: 0.75;
          }

          &:active:not(:disabled) {
            opacity: 0.5;
          }
        `
      : ''}
`

export interface IBadgeProps {
  text: string
  theme: 'yellow' | 'blue' | 'white'
  margin: string
  size?: keyof typeof SizeMap
  icon?: React.JSX.Element
  onClick?: React.MouseEventHandler<HTMLSpanElement>
  style?: React.CSSProperties
}

export const Badge: FC<IBadgeProps> = ({
  text,
  theme,
  margin,
  icon,
  onClick,
  size = 'tiny',
  style,
}) => {
  return (
    <Wrapper
      $margin={margin}
      $theme={theme}
      onClick={onClick}
      $isClickable={!!onClick}
      $size={size}
      style={style}
    >
      {icon ? <span style={{ fontSize: SizeMap[size].iconSize }}>{icon}</span> : null}
      <span>{text}</span>
    </Wrapper>
  )
}
