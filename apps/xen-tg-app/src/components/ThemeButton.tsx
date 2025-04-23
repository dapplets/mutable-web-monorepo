import moonIcon from '../assets/moon.svg'
import sunIcon from '../assets/sun.svg'
import { useTheme } from '@/components/theme-provider'

const ThemeButton = () => {
  const { setTheme, theme } = useTheme()
  return (
    <button
      className="flex cursor-pointer p-1 select-none"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <img src={theme === 'dark' ? moonIcon : sunIcon} alt="theme" />
    </button>
  )
}

export default ThemeButton
