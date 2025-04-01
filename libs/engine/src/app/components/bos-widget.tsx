import { FC } from 'react'
import { Widget } from 'near-social-vm'
import * as React from 'react'
import { VerticalLayoutManager } from '../layout-managers/vertical-layout-manager'
import { HorizontalLayoutManager } from '../layout-managers/horizontal-layout-manager'
import { SvalWidget } from './sval-widget'

interface BosWidgetProps {
  src: string
  props: any
  redirectMap?: any
}

export const BosWidget: FC<BosWidgetProps> = ({ src, props, redirectMap }) => {
  if (src === 'bos.dapplets.testnet/widget/VerticalLayoutManager') {
    return <VerticalLayoutManager {...props} />
  }

  if (src === 'bos.dapplets.testnet/widget/DefaultLayoutManager') {
    return <HorizontalLayoutManager {...props} />
  }

  if (src === 'bos.dapplets.testnet/widget/BlinkExample.Main') {
    return <SvalWidget />
  }

  return <Widget src={src} props={props} loading={<></>} config={{ redirectMap }} />
}
