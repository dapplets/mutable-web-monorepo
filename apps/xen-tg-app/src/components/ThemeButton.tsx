import { useTheme } from '@/components/theme-provider'
import DesktopIcon from '../assets/desktop'
import MoonIcon from '../assets/moon'
import SunIcon from '../assets/sun'

const ThemeButton = () => {
  const { setTheme, theme } = useTheme()
  return (
    <div className="z-1 flex w-full flex-col items-start justify-between px-2.5">
      <div className="py-2.5 text-[18px]/[150%] font-normal text-(--color-main-text)">
        Color scheme
      </div>
      <div className="flex w-full grow gap-2.5 p-1 select-none">
        <div className="flex w-full grow flex-col items-center justify-center gap-1.5">
          <button
            className={`flex h-20 w-full max-w-30 grow cursor-pointer items-center justify-center rounded-xl ${theme === 'system' ? 'backdrop-brightness-150' : 'backdrop-brightness-100'} ${theme === 'system' ? 'dark:backdrop-brightness-50' : 'dark:backdrop-brightness-100'} ${theme === 'system' ? 'border-2' : 'border'} ${theme === 'system' ? 'backdrop-blur-3xl' : 'backdrop-blur-none'} p-1 backdrop-opacity-80 select-none ${theme === 'system' ? 'text-(--color-my-primary)' : 'text-(--color-gray-text)'} ${theme === 'system' ? 'border-(--color-my-primary)' : 'border-(--color-gray-text)'}`}
            onClick={() => setTheme('system')}
          >
            <DesktopIcon />
          </button>
          <div>System</div>
        </div>
        <div className="flex w-full grow flex-col items-center justify-center gap-1.5">
          <button
            className={`flex h-20 w-full max-w-30 grow cursor-pointer items-center justify-center rounded-xl ${theme === 'dark' ? 'backdrop-brightness-150' : 'backdrop-brightness-100'} ${theme === 'dark' ? 'dark:backdrop-brightness-50' : 'dark:backdrop-brightness-100'} ${theme === 'dark' ? 'border-2' : 'border'} p-1 ${theme === 'dark' ? 'backdrop-blur-3xl' : 'backdrop-blur-none'} backdrop-opacity-80 select-none ${theme === 'dark' ? 'text-(--color-my-primary)' : 'text-(--color-gray-text)'} ${theme === 'dark' ? 'border-(--color-my-primary)' : 'border-(--color-gray-text)'}`}
            onClick={() => setTheme('dark')}
          >
            <MoonIcon />
          </button>
          <div>Dark</div>
        </div>
        <div className="flex w-full grow flex-col items-center justify-center gap-1.5">
          <button
            className={`flex h-20 w-full max-w-30 grow cursor-pointer items-center justify-center rounded-xl ${theme === 'light' ? 'backdrop-brightness-150' : 'backdrop-brightness-100'} ${theme === 'light' ? 'dark:backdrop-brightness-50' : 'dark:backdrop-brightness-100'} ${theme === 'light' ? 'border-2' : 'border'} p-1 ${theme === 'light' ? 'backdrop-blur-3xl' : 'backdrop-blur-none'} backdrop-opacity-80 select-none ${theme === 'light' ? 'text-(--color-my-primary)' : 'text-(--color-gray-text)'} ${theme === 'light' ? 'border-(--color-my-primary)' : 'border-(--color-gray-text)'}`}
            onClick={() => setTheme('light')}
          >
            <SunIcon />
          </button>
          <div>Light</div>
        </div>
      </div>
    </div>
  )
}

export default ThemeButton
