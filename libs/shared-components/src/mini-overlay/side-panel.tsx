import React, { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Header from './components/header'
import MainPage from './pages/main'
import ProfilePage from './pages/profile'

export interface ISidePanelProps {
  onMutateButtonClick: () => void
}

export const SidePanel: FC<ISidePanelProps> = ({ onMutateButtonClick }) => {
  const modalContainerRef = React.useRef<HTMLDivElement>(null)

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
      ref={modalContainerRef} // ToDo: move to context to avoid props drilling?
    >
      {/* ToDo: move to pages? */}
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/system/main" replace />} />
        <Route
          path="/system/main"
          element={
            // ToDo: avoid props drilling
            <MainPage
              modalContainerRef={modalContainerRef}
              onMutateButtonClick={onMutateButtonClick}
            />
          }
        />
        <Route path="/system/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  )
}
