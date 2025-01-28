import React from 'react'
import styled from 'styled-components'
import { RequestStatus } from '@mweb/engine'

const Loader = styled.div`
  width: 10px;
  aspect-ratio: 1;
  --_g: no-repeat
    radial-gradient(farthest-side, hsl(0deg 0% 100% / 86%) 94%, hsl(0deg 0% 100% / 0%));
  background:
    var(--_g) 0 0,
    var(--_g) 100% 0,
    var(--_g) 100% 100%,
    var(--_g) 0 100%;
  background-size: 40% 40%;
  animation: l38 0.5s infinite;

  @keyframes l38 {
    100% {
      background-position:
        100% 0,
        100% 100%,
        0 100%,
        0 0;
    }
  }
`

export const StatusBadge: React.FC<{ status: RequestStatus }> = ({ status }) => {
  return (
    <div
      className="mainAccount"
      style={{
        color: 'var(--pure-white)',
        backgroundColor: `var(${status === RequestStatus.SUCCESS ? '--success' : status === RequestStatus.FAILED ? '--error' : '--primary'})`,
        borderColor: `var(${status === RequestStatus.SUCCESS ? '--success' : status === RequestStatus.FAILED ? '--error' : '--primary'})`,
      }}
    >
      {status === RequestStatus.CLAIMING || status === RequestStatus.VERIFICATION ? (
        <Loader />
      ) : null}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </div>
  )
}
