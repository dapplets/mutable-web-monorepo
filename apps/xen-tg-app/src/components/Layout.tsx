import { FullscreenProvider } from '@/hooks/fullscreen-provider.tsx'
import { ThemeProvider } from '@/hooks/theme-provider'
import { Outlet } from 'react-router'
import AnimatedBackground from './AnimatedBackground'
import { ErrorBoundary } from 'react-error-boundary'

const Layout = () => (
  <ErrorBoundary fallback={<p>⚠️Something went wrong</p>}>
    <ThemeProvider storageKey="vite-ui-theme">
      <FullscreenProvider storageKey="fullscreen-enabled">
        <div
          style={{ marginTop: 'calc(var(--tg-content-safe-area-inset-top) + 12px)' }}
          className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-(--color-main-text)"
        >
          <AnimatedBackground />
          <Outlet />
        </div>
      </FullscreenProvider>
    </ThemeProvider>
  </ErrorBoundary>
)

export default Layout
