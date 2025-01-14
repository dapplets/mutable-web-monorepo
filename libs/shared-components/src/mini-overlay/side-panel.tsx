import React, { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Header from './components/header'
import MainPage from './pages/main'
import ProfilePage from './pages/profile'

export interface ISidePanelProps {
  loggedInAccountId: string | null
  nearNetwork: string
  trackingRefs?: Set<React.RefObject<HTMLDivElement>>
  overlayRef: React.RefObject<HTMLDivElement>
  onCloseOverlay: () => void
  onMutateButtonClick: () => void
  onConnectWallet: () => Promise<void>
  onDisconnectWallet: () => Promise<void>
}

export const SidePanel: FC<ISidePanelProps> = ({
  loggedInAccountId,
  nearNetwork,
  trackingRefs,
  overlayRef,
  onMutateButtonClick,
  onCloseOverlay,
  onConnectWallet,
  onDisconnectWallet,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* ToDo: move to pages? */}
      <Header
        accountId={loggedInAccountId}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
        nearNetwork={nearNetwork!}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/system/main" replace />} />
        <Route
          path="/system/main"
          element={
            // ToDo: avoid props drilling
            <MainPage
              loggedInAccountId={loggedInAccountId}
              modalContainerRef={overlayRef}
              onMutateButtonClick={onMutateButtonClick}
              onCloseOverlay={onCloseOverlay}
              connectWallet={onConnectWallet}
            />
          }
        />
        <Route
          path="/system/profile"
          element={
            // ToDo: avoid props drilling
            <ProfilePage
              loggedInAccountId={loggedInAccountId}
              nearNetwork={nearNetwork!}
              trackingRefs={trackingRefs}
            />
          }
        />
      </Routes>
    </div>
  )
}
