import React, { FC } from 'react'
import { Navigate, Route, Routes, MemoryRouter } from 'react-router'
import Header from './components/header'
import MainPage from './pages/main'
import ProfilePage from './pages/profile'
import EditMutationPage from './pages/edit-mutation'
import NotificationsPage from './pages/notifications'
import ApplicationsPage from './pages/applications'
import { ModalProvider } from '../contexts/modal-context'

export interface ISidePanelProps {}

export const SidePanel: FC<ISidePanelProps> = ({}) => {
  return (
    <ModalProvider>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
        <MemoryRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/main" replace />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route
              path="/edit-mutation/:authorId/mutation/:localId"
              element={<EditMutationPage />}
            />
            <Route path="/applications" element={<ApplicationsPage />} />
          </Routes>
        </MemoryRouter>
      </div>
    </ModalProvider>
  )
}
