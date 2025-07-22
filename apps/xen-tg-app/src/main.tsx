import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Fallback from './components/Fallback'
import Layout from './components/Layout.tsx'
import './index.css'

const queryClient = new QueryClient()

const App = lazy(() => import('./App.tsx'))
const Memories = lazy(() => import('./components/Memories.tsx'))
const NewsMonitor = lazy(() => import('./components/NewsMonitor.tsx'))
const Settings = lazy(() => import('./components/Settings.tsx'))
const History = lazy(() => import('./components/History.tsx'))

const router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: '/',
        element: (
          <Suspense fallback={<Fallback />}>
            <App />
          </Suspense>
        ),
      },
      {
        path: 'memories',
        element: (
          <Suspense fallback={<Fallback />}>
            <Memories />
          </Suspense>
        ),
      },
      {
        path: 'history',
        element: (
          <Suspense fallback={<Fallback />}>
            <History />
          </Suspense>
        ),
      },
      {
        path: 'news-monitor',
        element: (
          <Suspense fallback={<Fallback />}>
            <NewsMonitor />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<Fallback />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      {/* <ReactQueryDevtools initialIsOpen={false} /> */}
    </QueryClientProvider>
  </StrictMode>
)
