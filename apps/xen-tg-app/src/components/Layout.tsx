import { ThemeProvider } from '@/components/theme-provider'
import { FC } from 'react'
import AnimatedBackground from './AnimatedBackground'

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider storageKey="vite-ui-theme">
    <div
      style={{ marginTop: 'calc(var(--tg-content-safe-area-inset-top) + 12px)' }}
      className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-(--color-main-text)"
    >
      <AnimatedBackground />
      {children}
    </div>
  </ThemeProvider>
)

export default Layout
