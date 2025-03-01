import { NearNetworks } from '@mweb/backend'
import React, { FC } from 'react'
import { ConnectedAccount } from '../../connected-accounts'
import { useEngine } from '../../contexts/engine-context'
import PageLayout from '../components/page-layout'

const Profile: FC<{
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
}> = ({ trackingRefs }) => {
  const { loggedInAccountId, nearNetwork } = useEngine()
  const profileRef = React.useRef<HTMLDivElement>(null)

  return (
    <PageLayout ref={profileRef} title="Profile">
      {loggedInAccountId ? (
        <ConnectedAccount
          loggedInAccountId={loggedInAccountId}
          nearNetwork={nearNetwork as NearNetworks}
          trackingRefs={trackingRefs}
          profileRef={profileRef}
        />
      ) : null}
    </PageLayout>
  )
}

export default Profile
