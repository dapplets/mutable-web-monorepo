import React, { FC, useMemo } from 'react'
import { Button, Modal } from 'antd'
import toJson from 'json-stringify-deterministic'
import { useAcceptPullRequest, useMutation, useRejectPullRequest } from '@mweb/engine'
import { PrReviewer } from './pr-reviewer'
import { NotificationDto, NotificationType, PullRequestPayload } from '@mweb/backend'
import { Decline, Branch } from './assets/icons'

const leaveMergableProps = (mutation: any): any => {
  return {
    apps: mutation.apps,
    targets: mutation.targets,
    metadata: {
      description: mutation.metadata.description,
    },
  }
}

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

  const { acceptPullRequest, isLoading: isLoadingAccept } = useAcceptPullRequest(notification.id)
  const { rejectPullRequest, isLoading: isLoadingReject } = useRejectPullRequest(notification.id)

  const sourceJson = useMemo(() => toJson(leaveMergableProps(source), { space: '  ' }), [])
  const targetJson = useMemo(() => toJson(leaveMergableProps(target), { space: '  ' }), [])

  const handleAcceptClick = () => {
    // ToDo: replace .then() with useEffect?
    acceptPullRequest().then(() => onClose())
  }

  const handleDeclineClick = () => {
    // ToDo: replace .then() with useEffect?
    rejectPullRequest().then(() => onClose())
  }

  return (
    <Modal
      title="Review Changes"
      open
      centered
      getContainer={containerRef.current ?? false}
      zIndex={10000}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button
          key="decline"
          loading={isLoadingReject}
          disabled={isLoadingAccept || isLoadingReject}
          type="default"
          size="middle"
          onClick={handleDeclineClick}
          icon={<Decline />}
          iconPosition="start"
        >
          Decline
        </Button>,
        <Button
          key="accept"
          loading={isLoadingAccept}
          disabled={isLoadingAccept || isLoadingReject}
          type="primary"
          size="middle"
          onClick={handleAcceptClick}
          icon={<Branch />}
          iconPosition="start"
        >
          Accept
        </Button>,
      ]}
    >
      <PrReviewer modifiedCode={sourceJson} originalCode={targetJson} />
    </Modal>
  )
}
