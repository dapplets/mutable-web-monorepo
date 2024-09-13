import {
  GenericNotification,
  NotificationApiType,
  NotificationType,
  PullRequestStatus,
} from './types'
import React from 'react'

const IconNotificationClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="10" viewBox="0 0 9 10" fill="none">
    <path
      d="M8 1.5L1 8.5M1 1.5L8 8.5"
      stroke="#7A818B"
      stroke-width="1.16667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const IconRewiew = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" fill="none">
    <path
      d="M4.16667 1.08331L1.25 3.99998L4.16667 6.91665M7.83333 6.91665L10.75 3.99998L7.83333 1.08331"
      stroke="#7A818B"
      stroke-width="1.16667"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
)

const IconBranchButton = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="14" viewBox="0 0 12 14" fill="none">
    <path
      d="M2.50066 11.4294C2.08738 11.43 1.68722 11.2844 1.37105 11.0182C1.05488 10.7521 0.843108 10.3826 0.77324 9.97528C0.703372 9.56794 0.779917 9.14903 0.989319 8.79273C1.19872 8.43643 1.52746 8.16573 1.91732 8.02859V4.33026C1.52795 4.19264 1.19977 3.92181 0.990781 3.56562C0.781793 3.20943 0.705457 2.79083 0.775268 2.3838C0.845078 1.97677 1.05654 1.60752 1.37227 1.34133C1.68801 1.07514 2.08768 0.929138 2.50066 0.929138C2.91363 0.929138 3.31331 1.07514 3.62904 1.34133C3.94478 1.60752 4.15624 1.97677 4.22605 2.3838C4.29586 2.79083 4.21952 3.20943 4.01053 3.56562C3.80155 3.92181 3.47336 4.19264 3.08399 4.33026V4.42942C3.08399 4.73884 3.20691 5.03559 3.4257 5.25438C3.64449 5.47317 3.94124 5.59609 4.25066 5.59609H7.75066C8.3695 5.59609 8.96299 5.84192 9.40057 6.27951C9.83816 6.71709 10.084 7.31058 10.084 7.92942V8.02859C10.4734 8.1662 10.8015 8.43704 11.0105 8.79323C11.2195 9.14942 11.2959 9.56802 11.226 9.97505C11.1562 10.3821 10.9448 10.7513 10.629 11.0175C10.3133 11.2837 9.91363 11.4297 9.50066 11.4297C9.08768 11.4297 8.68801 11.2837 8.37227 11.0175C8.05654 10.7513 7.84508 10.3821 7.77527 9.97505C7.70546 9.56802 7.78179 9.14942 7.99078 8.79323C8.19977 8.43704 8.52795 8.1662 8.91732 8.02859V7.92942C8.91732 7.62 8.79441 7.32326 8.57561 7.10447C8.35682 6.88567 8.06008 6.76276 7.75066 6.76276H4.25066C3.84112 6.76292 3.43875 6.65528 3.08399 6.45067V8.02917C3.47275 8.16722 3.80027 8.43812 4.00876 8.79409C4.21726 9.15007 4.29334 9.56824 4.22359 9.97484C4.15384 10.3814 3.94273 10.7503 3.6275 11.0165C3.31228 11.2826 2.9132 11.4288 2.50066 11.4294Z"
      fill="white"
    />
  </svg>
)

export const notifications: GenericNotification[] = [
  {
    apiType: NotificationApiType.Info,
    id: '1',
    type: NotificationType.Regular,
    payload: {
      subject: 'Welcome to the platform!',
      body: 'We are glad to have you with us.',
    },
    isRead: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    createdBy: 'nikter.near',
  },
  {
    apiType: NotificationApiType.Info,
    id: '2',
    type: NotificationType.PullRequest,
    payload: {
      commitMessage: 'Fixed the issue with authentication',
      committer: 'nikter.near',
      commitName: 'fix',
      sourceMutationId: 'nikter.near/mutation/Sandbox',
      targetMutationId: 'dapplets.near/mutation/Sandbox',
      status: PullRequestStatus.Accepted,
    },
    isRead: true,
    createdAt: '2024-01-02T00:00:00.000Z',
    createdBy: 'dapplets.near',

    actions: [
      {
        label: 'Decline',

        onClick: () => console.log('Decline'),
        icon: <IconNotificationClose />,
      },
      {
        label: 'Review',

        onClick: () => console.log('Review'),
        icon: <IconRewiew />,
      },
      {
        label: 'Accept',
        type: 'primary',
        onClick: () => console.log('Accept'),
        icon: <IconBranchButton />,
      },
    ],
  },
]
