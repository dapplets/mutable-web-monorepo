import React from 'react'
import { FC, useState } from 'react'
import styled from 'styled-components'
import { DeleteWidgetButton } from './delete-widget-button'
import { TransferableContext } from '@mweb/backend'
import { BosWidget } from '../components/bos-widget'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 12px;
  gap: 10px;
`

const WidgetWrapper = styled.div`
  position: relative;
`

const WidgetBadgeWrapper = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1200;
  background: rgba(255, 255, 255, 0.35);
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4%;
  backdrop-filter: blur(1px);
`

export type VerticalLayoutManagerProps = {
  notify: () => void
  attachContextRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  attachInsPointRef: (callback: (r: React.Component | Element | null | undefined) => void) => void
  widgets: any[]
  components: any[]
  isEditMode: boolean
  deleteUserLink: (linkId: string) => Promise<void>
  context: TransferableContext
  accountId: string | null
}

export const VerticalLayoutManager: FC<VerticalLayoutManagerProps> = (props) => {
  const context = { accountId: props.accountId }

  const [waitingAppIdsSet, changeWaitingAppIdsSet] = useState(new Set())

  if (
    (!props.widgets || props.widgets.length === 0) &&
    (!props.components || props.components.length === 0)
  ) {
    return null
  }

  const handleRemoveWidget = (linkId: string) => {
    changeWaitingAppIdsSet((val) => val.add(linkId))
    const callback = () => {
      waitingAppIdsSet.delete(linkId)
      changeWaitingAppIdsSet((val) => {
        val.delete(linkId)
        return val
      })
    }
    props.deleteUserLink(linkId).then(callback).catch(callback)
  }

  return (
    <Container id="vertical-layout-manager">
      {props.widgets
        .filter((w) => w.isSuitable === undefined || w.isSuitable === true)
        .map((widget) => (
          <WidgetWrapper key={widget.linkId}>
            {props.isEditMode ? (
              <WidgetBadgeWrapper
                title={
                  widget.linkAuthorId === context.accountId && !widget.static
                    ? `Remove ${widget.src.split('widget/').pop()}`
                    : 'disable in edit mode'
                }
                style={{
                  opacity: widget.linkAuthorId === context.accountId && !widget.static ? '1' : '0',
                }}
              >
                {widget.linkAuthorId === context.accountId && !widget.static ? (
                  waitingAppIdsSet.has(widget.linkId) ? (
                    <span
                      role="status"
                      aria-hidden="true"
                      className="spinner-grow spinner-grow-sm"
                    />
                  ) : (
                    <DeleteWidgetButton onClick={() => handleRemoveWidget(widget.linkId)} />
                  )
                ) : null}
              </WidgetBadgeWrapper>
            ) : null}
            <div
              data-mweb-context-type="injected-widget"
              data-mweb-context-parsed={JSON.stringify({
                id: `${props.context.id}/${widget.linkId}`,
                parentContextId: props.context.id,
                widgetSrc: widget.src,
              })}
            >
              <BosWidget src={widget.src} props={{ ...widget.props, notify: props.notify }} />
              <div data-mweb-insertion-point="hidden" style={{ display: 'none' }} />
            </div>
          </WidgetWrapper>
        ))}

      {props.components
        ? props.components.map((cmp, i) => {
            const WrapperComponent = cmp.component
            return (
              <WidgetWrapper key={i}>
                <WrapperComponent
                  context={props.context}
                  attachContextRef={props.attachContextRef}
                  attachInsPointRef={props.attachInsPointRef}
                />
              </WidgetWrapper>
            )
          })
        : null}
    </Container>
  )
}
