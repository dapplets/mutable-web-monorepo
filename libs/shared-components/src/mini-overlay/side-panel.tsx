import React, { FC } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import Header from './components/header'
import MainPage from './pages/main'
import ProfilePage from './pages/profile'
import EditMutationPage from './pages/edit-mutation'

export interface ISidePanelProps {}

export const SidePanel: FC<ISidePanelProps> = ({}) => {
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
            <MainPage modalContainerRef={modalContainerRef} />
          }
        />
        <Route path="/system/profile" element={<ProfilePage />} />
        <Route path="/system/edit-mutation/:mutationId" element={<EditMutationPage />} />
      </Routes>
    </div>
  )
}
