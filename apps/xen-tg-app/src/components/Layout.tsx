import { ThemeProvider } from '@/components/theme-provider'
import { FC } from 'react'
import AnimatedBackground from './AnimatedBackground'

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
  const { contentSafeAreaInset } = window.Telegram.WebApp as any // eslint-disable-line -- wait for a new version of @types/telegram-web-app
  return (
    <ThemeProvider storageKey="vite-ui-theme">
      <div
        style={{ marginTop: contentSafeAreaInset ? contentSafeAreaInset.top + 14 : 60 }}
        className="relative flex w-full max-w-xl min-w-80 flex-col items-center justify-center gap-5 px-2.5 py-5 text-(--color-main-text)"
      >
        <AnimatedBackground />
        {children}
      </div>
    </ThemeProvider>
  )
}

export default Layout
