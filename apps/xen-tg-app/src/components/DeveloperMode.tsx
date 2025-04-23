import { Switch } from '@/components/ui/switch'
import { useState } from 'react'

const DeveloperMode = () => {
  // ToDo: hardcoded
  const [isDevModeTurnedOn, setIsDevModeTurnedOn] = useState(false)
  console.log('isDevModeTurnedOn', isDevModeTurnedOn)
  const switchDveloperMode = () => {
    setIsDevModeTurnedOn((v) => !v)
  }
  return (
    <div className="z-1 flex w-full items-center justify-between ps-2.5 pe-5">
      <span className="text-[18px]/[150%] font-normal text-(--color-main-text)">
        Developer mode
      </span>
      <Switch onCheckedChange={switchDveloperMode} checked={isDevModeTurnedOn} />
    </div>
  )
}

export default DeveloperMode
