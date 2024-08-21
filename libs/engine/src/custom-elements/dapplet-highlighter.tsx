import React, { ReactElement } from 'react'
import { InjectableTarget } from '../app/contexts/engine-context/engine-context'
import { useHighlighter, THighlighterTask } from '../app/contexts/highlighter-context'
import { FirstTargetTransformerHoc } from './dapplet-portal'

const _DappletHighlighter: React.FC<{
  target: InjectableTarget
  styles?: React.CSSProperties
  filled?: boolean
  icon?: ReactElement
  action?: () => void
}> = FirstTargetTransformerHoc(({ target, styles, filled, icon, action }) => {
  const { setHighlighterTask } = useHighlighter()

  React.useEffect(() => {
    setHighlighterTask({
      target,
      styles,
      isFilled: filled,
      icon,
      action,
    })
    return () => setHighlighterTask(null)
  }, [target, styles, filled, icon, action])

  return null
})

export const DappletHighlighter = (props: THighlighterTask) => {
  return <_DappletHighlighter {...props} />
}
