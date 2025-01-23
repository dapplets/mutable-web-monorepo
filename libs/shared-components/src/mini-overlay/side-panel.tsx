import React, { FC } from 'react'
import { Navigate, Route, Routes, MemoryRouter } from 'react-router'
import Header from './components/header'
import MainPage from './pages/main'
import ProfilePage from './pages/profile'
import EditMutationPage from './pages/edit-mutation'
import NotificationsPage from './pages/notifications'
import ApplicationsPage from './pages/applications'

export interface ISidePanelProps {}

export const SidePanel: FC<ISidePanelProps> = ({}) => {
  const modalContainerRef = React.useRef<HTMLDivElement>(null)

  return (
    <MemoryRouter>
      <div
        style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 10 }}
        ref={modalContainerRef} // ToDo: move to context to avoid props drilling?
      >
        {/* ToDo: move to pages? */}
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />
          <Route path="/main" element={<MainPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/notifications"
            element={<NotificationsPage modalContainerRef={modalContainerRef} />}
          />
          <Route
            path="/edit-mutation/:authorId/mutation/:localId"
            element={<EditMutationPage />}
          />
          <Route path="/applications" element={<ApplicationsPage />} />
        </Routes>
      </div>
    </MemoryRouter>
  )
}
