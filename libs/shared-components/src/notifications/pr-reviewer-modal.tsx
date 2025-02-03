import React, { FC, useMemo } from 'react'
import { Button, Modal } from 'antd'
import toJson from 'json-stringify-deterministic'
import { useAcceptPullRequest, useMutation, useRejectPullRequest } from '@mweb/react-engine'
import { PrReviewer } from './pr-reviewer'
import { NotificationDto, NotificationType, PullRequestPayload } from '@mweb/backend'
import { Decline, Branch } from './assets/icons'
import { useModal } from '../contexts/modal-context'

const leaveMergableProps = (mutation: any | null): any => {
  if (!mutation) return {}
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
  onClose: () => void
}

export const PrReviewerModal: FC<Props> = ({ notification, onClose }) => {
  if (notification.type !== NotificationType.PullRequest) {
    throw new Error('Only PullRequest notifications are supported')
  }

  const { sourceMutationId, targetMutationId } = notification.payload as PullRequestPayload

  const { modalContainerRef } = useModal()

  const { mutation: source, isMutationLoading: isSourceLoading } = useMutation(sourceMutationId)
  const { mutation: target, isMutationLoading: isTargetLoading } = useMutation(targetMutationId)

  const { acceptPullRequest, isLoading: isLoadingAccept } = useAcceptPullRequest(notification.id)
  const { rejectPullRequest, isLoading: isLoadingReject } = useRejectPullRequest(notification.id)

  const sourceJson = useMemo(() => toJson(leaveMergableProps(source), { space: '  ' }), [source])
  const targetJson = useMemo(() => toJson(leaveMergableProps(target), { space: '  ' }), [target])

  const areMutationsLoading = isSourceLoading || isTargetLoading

  if (areMutationsLoading) {
    return null
  }

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
      getContainer={modalContainerRef.current ?? false}
      zIndex={10000}
      onCancel={onClose}
      width={1000}
      footer={[
        <Button
          key="decline"
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
