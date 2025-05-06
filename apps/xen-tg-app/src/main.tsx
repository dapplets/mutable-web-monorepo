import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import App from './App.tsx'
import Memories from './components/Memories.tsx'
import History from './components/History.tsx'
import NewsMonitor from './components/NewsMonitor.tsx'
import './index.css'
import Settings from './components/Settings.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: 'memories',
    element: <Memories />,
  },
  {
    path: 'history',
    element: <History />,
  },
  {
    path: 'news-monitor',
    element: <NewsMonitor />,
  },
  {
    path: 'settings',
    element: <Settings />,
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
)
