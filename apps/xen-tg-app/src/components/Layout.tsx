import { FullscreenProvider } from '@/hooks/fullscreen-provider.tsx'
import { ThemeProvider } from '@/hooks/theme-provider'
import { FC } from 'react'
import AnimatedBackground from './AnimatedBackground'

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider storageKey="vite-ui-theme">
    <FullscreenProvider storageKey="fullscreen-enabled">
      <div
        style={{ marginTop: 'calc(var(--tg-content-safe-area-inset-top) + 12px)' }}
        className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-(--color-main-text)"
      >
        <AnimatedBackground />
        {children}
      </div>
    </FullscreenProvider>
  </ThemeProvider>
)

export default Layout
