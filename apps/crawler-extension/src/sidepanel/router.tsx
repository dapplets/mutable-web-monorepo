import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CollectedData } from './pages/collected-data'
import { Default } from './pages/default'
import { NoParsers } from './pages/no-parsers'

export const Router: React.FC = () => {
  return (
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" Component={Default} />
        <Route path="collected-data" Component={CollectedData} />
        <Route path="no-parsers" Component={NoParsers} />
      </Routes>
    </MemoryRouter>
  )
}
