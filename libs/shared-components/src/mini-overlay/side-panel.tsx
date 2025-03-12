import React, { FC, useState } from 'react'
import { MemoryRouter, Navigate, Route, Routes } from 'react-router'
import { ModalProvider } from '../contexts/modal-context'
import Header from './components/header'
import ApplicationPage from './pages/application'
import ApplicationsPage from './pages/applications'
import EditMutationPage from './pages/edit-mutation'
import MainPage from './pages/main'
import NotificationsPage from './pages/notifications'
import ProfilePage from './pages/profile'

export interface ISidePanelProps {}

export const SidePanel: FC<ISidePanelProps> = ({}) => {
  const [isHeaderOpened, setIsHeaderOpened] = useState(false)
  console.log('isHeaderOpened', isHeaderOpened)

  const handleOpenHeader = () => setIsHeaderOpened(true)
  const handleCloseHeader = () => setIsHeaderOpened(false)
  return (
    <ModalProvider>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
        <MemoryRouter>
          <Header onOpenHeader={handleOpenHeader} />
          <Routes>
            <Route path="/">
              <Route index element={<Navigate to="/main" replace />} />
              <Route path="main" element={<MainPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route
                path="edit-mutation/:authorId/mutation/:localId"
                element={<EditMutationPage />}
              />
              <Route path="applications">
                <Route index element={<ApplicationsPage />} />
                <Route path=":authorId/app/:localId" element={<ApplicationPage />} />
              </Route>
            </Route>
          </Routes>
        </MemoryRouter>
      </div>
    </ModalProvider>
  )
}
