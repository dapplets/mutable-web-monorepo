import * as React from 'react'
import { Overlay } from '../bos/overlay'

export const DappletOverlay = ({ children }: { children: React.ReactNode[] }) => {
  const child = children.filter((c) => typeof c !== 'string' || !!c.trim())[0]
  return <Overlay>{child}</Overlay>
}
