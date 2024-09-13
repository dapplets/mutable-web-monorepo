import React, { FC, ReactNode, useCallback, useEffect, useRef } from 'react'
import { ModalContext, ModalContextState, ModalProps, NotificationType } from './modal-context'
import { Button, Space, notification } from 'antd'
import { useViewport } from '../viewport-context'

type Props = {
  children?: ReactNode
  onModalApiReady: (modalApi: ModalContextState) => void
}

const ModalProvider: FC<Props> = ({ children, onModalApiReady }) => {
  const { viewportRef } = useViewport()
  const counterRef = useRef(0)
  const [api, contextHolder] = notification.useNotification({
    getContainer: () => {
      if (!viewportRef.current) throw new Error('Viewport is not initialized')
      return viewportRef.current
    },
  })

  const notify = useCallback(
    (modalProps: ModalProps) => {
      if (!Object.values(NotificationType).includes(modalProps.type)) {
        console.error('Unknown notification type: ' + modalProps.type)
        return
      }

      const modalId = counterRef.current++
      const duration = modalProps.duration ?? 4.5

      api[modalProps.type]({
        key: modalId,
        message: modalProps.subject,
        description: modalProps.body,
        placement: 'bottomRight',
        duration: duration,
        showProgress: duration !== 0,
        pauseOnHover: false,
        btn:
          modalProps.actions && modalProps.actions.length
            ? modalProps.actions.map((action, i) => (
                <Space key={i} style={{ marginRight: '10px', marginBottom: '10px' }}>
                  <Button
                    type={action.type ?? 'primary'}
                    size="small"
                    onClick={() => {
                      action.onClick?.()
                      api.destroy(modalId)
                    }}
                  >
                    {action.label}
                  </Button>
                </Space>
              ))
            : null,
      })
    },
    [api]
  )

  useEffect(() => {
    onModalApiReady({ notify })
  }, [notify, onModalApiReady])

  const state: ModalContextState = {
    notify,
  }

  return (
    <ModalContext.Provider value={state}>
      <>{contextHolder}</>
      <>{children}</>
    </ModalContext.Provider>
  )
}

export { ModalProvider }
