import React, { FC } from 'react'
import { Space, Typography, Card, Tag, Collapse } from 'antd'
import { GenericNotification, PullRequestStatus } from '../types'
import {
  NotificationProvider,
  useNotifications,
  NotificationType,
  useAcceptPullRequest,
  useRejectPullRequest,
  useViewNotification,
  useHideNotification,
  NotificationDto,
} from '@mweb/engine'

const CollapseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="9" height="3" viewBox="0 0 9 3" fill="none">
    <path
      d="M0 1.50684C0 1.29264 0.0660807 1.11263 0.198242 0.966797C0.334961 0.816406 0.530924 0.741211 0.786133 0.741211C1.04134 0.741211 1.23503 0.816406 1.36719 0.966797C1.50391 1.11263 1.57227 1.29264 1.57227 1.50684C1.57227 1.71647 1.50391 1.89421 1.36719 2.04004C1.23503 2.18587 1.04134 2.25879 0.786133 2.25879C0.530924 2.25879 0.334961 2.18587 0.198242 2.04004C0.0660807 1.89421 0 1.71647 0 1.50684Z"
      fill="#7A818B"
    />
    <path
      d="M3.69141 1.50684C3.69141 1.29264 3.75749 1.11263 3.88965 0.966797C4.02637 0.816406 4.22233 0.741211 4.47754 0.741211C4.73275 0.741211 4.92643 0.816406 5.05859 0.966797C5.19531 1.11263 5.26367 1.29264 5.26367 1.50684C5.26367 1.71647 5.19531 1.89421 5.05859 2.04004C4.92643 2.18587 4.73275 2.25879 4.47754 2.25879C4.22233 2.25879 4.02637 2.18587 3.88965 2.04004C3.75749 1.89421 3.69141 1.71647 3.69141 1.50684Z"
      fill="#7A818B"
    />
    <path
      d="M7.38281 1.50684C7.38281 1.29264 7.44889 1.11263 7.58105 0.966797C7.71777 0.816406 7.91374 0.741211 8.16895 0.741211C8.42415 0.741211 8.61784 0.816406 8.75 0.966797C8.88672 1.11263 8.95508 1.29264 8.95508 1.50684C8.95508 1.71647 8.88672 1.89421 8.75 2.04004C8.61784 2.18587 8.42415 2.25879 8.16895 2.25879C7.91374 2.25879 7.71777 2.18587 7.58105 2.04004C7.44889 1.89421 7.38281 1.71647 7.38281 1.50684Z"
      fill="#7A818B"
    />
  </svg>
)

const IconBlue = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
    <g clipPath="url(#clip0_452_740)">
      <path
        d="M0 7.5C0 5.64348 0.737498 3.86301 2.05025 2.55025C3.36301 1.2375 5.14348 0.5 7 0.5C8.85652 0.5 10.637 1.2375 11.9497 2.55025C13.2625 3.86301 14 5.64348 14 7.5C14 9.35652 13.2625 11.137 11.9497 12.4497C10.637 13.7625 8.85652 14.5 7 14.5C5.14348 14.5 3.36301 13.7625 2.05025 12.4497C0.737498 11.137 0 9.35652 0 7.5ZM5.90625 9.6875C5.90625 8.99362 5.44513 8.40825 4.8125 8.21925V6.562C5.16329 6.45519 5.46417 6.22618 5.66056 5.91652C5.85695 5.60686 5.93584 5.23706 5.88292 4.87421C5.83 4.51137 5.64876 4.17951 5.3721 3.93885C5.09544 3.69818 4.74168 3.56466 4.375 3.5625C4.0067 3.56183 3.65049 3.69392 3.37168 3.93457C3.09287 4.17522 2.91014 4.5083 2.85698 4.87274C2.80382 5.23719 2.8838 5.60858 3.08226 5.91885C3.28071 6.22911 3.58435 6.45744 3.9375 6.562V8.21925C3.58671 8.32606 3.28583 8.55507 3.08944 8.86473C2.89305 9.17439 2.81416 9.54419 2.86708 9.90703C2.92 10.2699 3.10124 10.6017 3.3779 10.8424C3.65456 11.0831 4.00832 11.2166 4.375 11.2188C4.78111 11.2188 5.17059 11.0574 5.45776 10.7703C5.74492 10.4831 5.90625 10.0936 5.90625 9.6875ZM8.75 5.3125H8.96875C9.08478 5.3125 9.19606 5.35859 9.27811 5.44064C9.36016 5.52269 9.40625 5.63397 9.40625 5.75V8.21925C9.05546 8.32606 8.75458 8.55507 8.55819 8.86473C8.3618 9.17439 8.28291 9.54419 8.33583 9.90703C8.38875 10.2699 8.56999 10.6017 8.84665 10.8424C9.12331 11.0831 9.47707 11.2166 9.84375 11.2188C10.2121 11.2194 10.5683 11.0873 10.8471 10.8467C11.1259 10.606 11.3086 10.273 11.3618 9.90851C11.4149 9.54406 11.3349 9.17267 11.1365 8.8624C10.938 8.55214 10.6344 8.3238 10.2812 8.21925V5.75C10.2812 5.4019 10.143 5.06806 9.89683 4.82192C9.65069 4.57578 9.31685 4.4375 8.96875 4.4375H8.75V3.23787C8.75008 3.19455 8.73729 3.15218 8.71326 3.11614C8.68923 3.08009 8.65504 3.052 8.61502 3.03541C8.575 3.01882 8.53095 3.01449 8.48847 3.02296C8.44598 3.03143 8.40697 3.05233 8.37638 3.083L6.73925 4.72013C6.71888 4.74045 6.70272 4.76458 6.69169 4.79116C6.68066 4.81774 6.67498 4.84623 6.67498 4.875C6.67498 4.90377 6.68066 4.93226 6.69169 4.95884C6.70272 4.98542 6.71888 5.00955 6.73925 5.02987L8.37638 6.667C8.40697 6.69767 8.44598 6.71857 8.48847 6.72704C8.53095 6.73551 8.575 6.73118 8.61502 6.71459C8.65504 6.698 8.68923 6.66991 8.71326 6.63386C8.73729 6.59782 8.75008 6.55545 8.75 6.51213V5.3125Z"
        fill="#384BFF"
      />
    </g>
    <defs>
      <clipPath id="clip0_452_740">
        <rect width="14" height="14" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
)

const IconRed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
    <g clipPath="url(#clip0_452_830)">
      <path
        d="M7 0.5C8.85652 0.5 10.637 1.2375 11.9497 2.55025C13.2625 3.86301 14 5.64348 14 7.5C14 9.35652 13.2625 11.137 11.9497 12.4497C10.637 13.7625 8.85652 14.5 7 14.5C5.14348 14.5 3.36301 13.7625 2.05025 12.4497C0.737498 11.137 0 9.35652 0 7.5C0 5.64348 0.737498 3.86301 2.05025 2.55025C3.36301 1.2375 5.14348 0.5 7 0.5ZM4.8125 11.2188C5.1808 11.2194 5.53701 11.0873 5.81582 10.8467C6.09463 10.606 6.27736 10.273 6.33052 9.90851C6.38368 9.54406 6.3037 9.17267 6.10524 8.8624C5.90679 8.55214 5.60315 8.3238 5.25 8.21925V6.562C5.60079 6.45519 5.90167 6.22618 6.09806 5.91652C6.29445 5.60686 6.37334 5.23706 6.32042 4.87421C6.2675 4.51137 6.08626 4.17951 5.8096 3.93885C5.53294 3.69818 5.17918 3.56466 4.8125 3.5625C4.4442 3.56183 4.08799 3.69392 3.80918 3.93457C3.53037 4.17522 3.34764 4.5083 3.29448 4.87274C3.24132 5.23719 3.3213 5.60858 3.51976 5.91885C3.71822 6.22911 4.02185 6.45744 4.375 6.562V8.21925C4.02421 8.32606 3.72333 8.55507 3.52694 8.86473C3.33055 9.17439 3.25166 9.54419 3.30458 9.90703C3.3575 10.2699 3.53874 10.6017 3.8154 10.8424C4.09206 11.0831 4.44582 11.2166 4.8125 11.2188ZM9.1875 6.84375C9.07147 6.84375 8.96019 6.88984 8.87814 6.97189C8.79609 7.05394 8.75 7.16522 8.75 7.28125V8.21925C8.39921 8.32606 8.09833 8.55507 7.90194 8.86473C7.70555 9.17439 7.62666 9.54419 7.67958 9.90703C7.7325 10.2699 7.91374 10.6017 8.1904 10.8424C8.46706 11.0831 8.82082 11.2166 9.1875 11.2188C9.5558 11.2194 9.91201 11.0873 10.1908 10.8467C10.4696 10.606 10.6524 10.273 10.7055 9.90851C10.7587 9.54406 10.6787 9.17267 10.4802 8.8624C10.2818 8.55214 9.97815 8.3238 9.625 8.21925V7.28125C9.625 7.16522 9.57891 7.05394 9.49686 6.97189C9.41481 6.88984 9.30353 6.84375 9.1875 6.84375ZM10.2856 4.42613C10.3653 4.34361 10.4094 4.2331 10.4084 4.11839C10.4074 4.00368 10.3614 3.89395 10.2803 3.81283C10.1992 3.73171 10.0894 3.6857 9.97474 3.68471C9.86003 3.68371 9.74951 3.72781 9.667 3.8075L9.20325 4.27212L8.73863 3.8075C8.65611 3.72781 8.5456 3.68371 8.43089 3.68471C8.31618 3.6857 8.20645 3.73171 8.12533 3.81283C8.04421 3.89395 7.9982 4.00368 7.9972 4.11839C7.99621 4.2331 8.04031 4.34361 8.12 4.42613L8.58463 4.89075L8.12 5.3545C8.04031 5.43701 7.99621 5.54753 7.9972 5.66224C7.9982 5.77695 8.04421 5.88668 8.12533 5.9678C8.20645 6.04891 8.31618 6.09492 8.43089 6.09592C8.5456 6.09692 8.65611 6.05282 8.73863 5.97312L9.20325 5.50938L9.667 5.97312C9.74951 6.05282 9.86003 6.09692 9.97474 6.09592C10.0894 6.09492 10.1992 6.04891 10.2803 5.9678C10.3614 5.88668 10.4074 5.77695 10.4084 5.66224C10.4094 5.54753 10.3653 5.43701 10.2856 5.3545L9.82188 4.89075L10.2856 4.42613Z"
        fill="#DB504A"
      />
    </g>
    <defs>
      <clipPath id="clip0_452_830">
        <rect width="14" height="14" fill="white" transform="translate(0 0.5)" />
      </clipPath>
    </defs>
  </svg>
)

const IconGreen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="15" viewBox="0 0 14 15" fill="none">
    <rect y="0.5" width="14" height="14" rx="7" fill="#19CEAE" />
    <path
      d="M4.83492 11.4998C4.52013 11.5003 4.21534 11.3893 3.97452 11.1865C3.73371 10.9837 3.57241 10.7023 3.51919 10.3919C3.46597 10.0816 3.52427 9.76244 3.68377 9.49098C3.84327 9.21953 4.09366 9.0133 4.39061 8.90881V6.09119C4.09403 5.98635 3.84406 5.78001 3.68488 5.50864C3.5257 5.23727 3.46756 4.91835 3.52073 4.60825C3.57391 4.29815 3.73497 4.01684 3.97546 3.81403C4.21594 3.61123 4.52037 3.5 4.83492 3.5C5.14947 3.5 5.45389 3.61123 5.69438 3.81403C5.93486 4.01684 6.09593 4.29815 6.1491 4.60825C6.20227 4.91835 6.14413 5.23727 5.98495 5.50864C5.82577 5.78001 5.5758 5.98635 5.27923 6.09119V6.16674C5.27923 6.40247 5.37285 6.62855 5.5395 6.79524C5.70614 6.96193 5.93217 7.05558 6.16784 7.05558H8.8337C9.30505 7.05558 9.7571 7.24287 10.0904 7.57625C10.4237 7.90963 10.6109 8.36179 10.6109 8.83326V8.90881C10.9075 9.01365 11.1575 9.21999 11.3167 9.49136C11.4758 9.76273 11.534 10.0816 11.4808 10.3917C11.4276 10.7018 11.2666 10.9832 11.0261 11.186C10.7856 11.3888 10.4812 11.5 10.1666 11.5C9.85208 11.5 9.54765 11.3888 9.30717 11.186C9.06668 10.9832 8.90562 10.7018 8.85244 10.3917C8.79927 10.0816 8.85741 9.76273 9.01659 9.49136C9.17577 9.21999 9.42574 9.01365 9.72232 8.90881V8.83326C9.72232 8.59753 9.62869 8.37145 9.46205 8.20476C9.2954 8.03807 9.06937 7.94442 8.8337 7.94442H6.16784C5.85591 7.94454 5.54944 7.86254 5.27923 7.70666V8.90926C5.57533 9.01443 5.82479 9.22082 5.9836 9.49202C6.14241 9.76323 6.20036 10.0818 6.14723 10.3916C6.0941 10.7014 5.9333 10.9824 5.6932 11.1852C5.45311 11.3879 5.14914 11.4993 4.83492 11.4998Z"
      fill="white"
    />
  </svg>
)

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }
  const formattedDate = date.toLocaleString('en-US', options)
  const [monthDay, time] = formattedDate.split(', ')

  return `${monthDay} in ${time}`
}

const { Text } = Typography

export const CreateSingleNotification: FC<{ notification: NotificationDto }> = ({
  notification,
}) => {
  const {
    viewNotification,
    isLoading: isLoadingView,
    error: errorView,
  } = useViewNotification(notification.id)
  const {
    hideNotification,
    isLoading: isLoadingHide,
    error: errorHide,
  } = useHideNotification(notification.id)
  const {
    acceptPullRequest,
    isLoading: isLoadingAccept,
    error: errorAccept,
  } = useAcceptPullRequest(notification.id)
  const {
    rejectPullRequest,
    isLoading: isLoadingReject,
    error: errorReject,
  } = useRejectPullRequest(notification.id)

  return notification.type === NotificationType.Regular ? (
    <Space direction="vertical">
      <Space size="large" direction="horizontal">
        {/* <Text type="secondary" style={{ fontSize: '12px' }}>
          #{payload.id}&ensp;{payload.createdBy}&ensp; on&ensp;
          {formatDate(payload.createdAt)}
        </Text> */}
      </Space>
      {/* {payload.isRead ? (
        <Collapse
          expandIcon={() => <CollapseIcon />}
          expandIconPosition={'end'}
          ghost
          items={[
            {
              key: id,
              label: (
                <Space direction="horizontal">
                  <IconBlue />
                  <Text strong underline>
                    {payload.payload.subject as string}
                  </Text>
                </Space>
              ),
              children: (
                <Card
                  style={{
                    borderRadius: '10px',
                    padding: '10px',
                    background: '#F8F9FF',
                    width: '100%',
                    display: 'inline-flex',
                  }}
                >
                  <Text underline type="secondary">
                    {payload.payload.body}
                  </Text>
                </Card>
              ),
            },
          ]}
        />
      ) : (
        <>
          <Space direction="horizontal">
            <IconBlue />
            <Text strong underline>
              {payload.payload.subject as string}
            </Text>
          </Space>
          <Card
            style={{
              borderRadius: '10px',
              padding: '10px',
              background: '#F8F9FF',
              width: '100%',
              display: 'inline-flex',
            }}
          >
            <Text underline type="secondary">
              {payload.payload.body}
            </Text>
          </Card>
        </>
      )} */}
      {notification.authorId}
    </Space>
  ) : (
    <Space direction="vertical">
      <Space size="large" direction="horizontal">
        {/* <Text type="secondary" style={{ fontSize: '12px' }}>
          #{payload.id}&ensp;{payload.payload.committer}&ensp;committed &ensp;on&ensp;
          {formatDate(payload.createdAt)}
        </Text> */}
        {notification.status}
      </Space>

      {/* {payload.isRead ? (
        <Collapse
          expandIcon={() => <CollapseIcon />}
          expandIconPosition={'end'}
          ghost
          items={[
            {
              key: id,
              label: (
                <Space direction="horizontal">
                  <Space direction="horizontal">
                    {' '}
                    {payload.payload.status === PullRequestStatus.Accepted ? (
                      <IconGreen />
                    ) : payload.payload.status === PullRequestStatus.Rejected ? (
                      <IconRed />
                    ) : (
                      <IconBlue />
                    )}
                    <Text strong underline>
                      {payload.payload.commitName}
                    </Text>
                  </Space>

                  {payload.payload.status !== 'open' ? (
                    <Tag color={payload.payload.status === 'rejected' ? ' #DB504A' : '#384BFF'}>
                      {payload.payload.status}
                    </Tag>
                  ) : null}
                </Space>
              ),
              children: (
                <Space direction="vertical">
                  <Card
                    style={{
                      borderRadius: '10px',
                      padding: '10px',
                      background: '#F8F9FF',
                      width: '100%',
                      display: 'inline-flex',
                    }}
                  >
                    <Text underline type="secondary">
                      {payload.payload.committer} asks you to accept changes from{' '}
                      {payload.payload.sourceMutationId} ({payload.payload.committer}){' '}
                      {payload.payload.targetMutationId}
                    </Text>
                  </Card>
                </Space>
              ),
            },
          ]}
        />
      ) : (
        <>
          <Space direction="horizontal">
            <Space direction="horizontal">
              {' '}
              {payload.payload.status === PullRequestStatus.Accepted ? (
                <IconGreen />
              ) : payload.payload.status === PullRequestStatus.Rejected ? (
                <IconRed />
              ) : (
                <IconBlue />
              )}
              <Text strong underline>
                {payload.payload.commitName}
              </Text>
            </Space>

            {payload.payload.status !== 'open' ? (
              <Tag color={payload.payload.status === 'rejected' ? ' #DB504A' : '#384BFF'}>
                {payload.payload.status}
              </Tag>
            ) : null}
          </Space>
          <Space direction="vertical">
            <Card
              style={{
                borderRadius: '10px',
                padding: '10px',
                background: '#F8F9FF',
                width: '100%',
                display: 'inline-flex',
              }}
            >
              <Text underline type="secondary">
                {`${payload.payload.committer} asks you to accept changes
            from ${payload.payload.sourceMutationId}  (${payload.payload.committer}) ${payload.payload.targetMutationId}`}
              </Text>
            </Card>
          </Space>
        </>
      )} */}
    </Space>
  )
}
