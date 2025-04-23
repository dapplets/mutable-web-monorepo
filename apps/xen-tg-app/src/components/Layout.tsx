import { ThemeProvider } from '@/components/theme-provider'
import { FC } from 'react'
import AnimatedBackground from './AnimatedBackground'

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
    <div className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 pt-5 pb-30 text-[var(--color-main-text)]">
      <AnimatedBackground />
      {children}
    </div>
  </ThemeProvider>
)

export default Layout
