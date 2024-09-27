import React, { FC, useMemo } from 'react'
import { Modal } from 'antd'
import serializeToDeterministicJson from 'json-stringify-deterministic'
import { NotificationDto, NotificationType, PullRequestPayload, useMutation } from '@mweb/engine'
import { PrReviewer } from './pr-reviewer'

export interface Props {
  notification: NotificationDto
  containerRef: React.RefObject<HTMLElement>
  onClose: () => void
}

export const PrReviewerModal: FC<Props> = ({ notification, containerRef, onClose }) => {
  if (notification.type !== NotificationType.PullRequest) {
    throw new Error('Only PullRequest notifications are supported')
  }

  const { sourceMutationId, targetMutationId } = notification.payload as PullRequestPayload

  const { mutation: source } = useMutation(sourceMutationId)
  const { mutation: target } = useMutation(targetMutationId)

  const sourceJson = useMemo(() => serializeToDeterministicJson(source, { space: '  ' }), [])
  const targetJson = useMemo(() => serializeToDeterministicJson(target, { space: '  ' }), [])

  return (
    <Modal
      title="Review Changes"
      open
      centered
      getContainer={containerRef.current ?? false}
      zIndex={10000}
      onCancel={onClose}
      width={1000}
    >
      <PrReviewer modifiedCode={sourceJson} originalCode={targetJson} />
    </Modal>
  )
}
