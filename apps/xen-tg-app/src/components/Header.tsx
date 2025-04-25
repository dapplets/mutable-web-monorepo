import ArrayLeft from '@/assets/array-left'
import { Link } from 'react-router'
import ThemeButton from './ThemeButton'

const Header = () => (
  <div className="z-1 flex w-full items-center justify-between">
    <Link to="/">
      <div className="flex items-center justify-between gap-1 text-[22px]/[150%] font-semibold select-none">
        <div className="flex h-5 w-5 items-center justify-center">
          <ArrayLeft />
        </div>
        Back
      </div>
    </Link>
    <ThemeButton />
  </div>
)

export default Header
