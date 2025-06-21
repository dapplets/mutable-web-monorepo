import { Switch } from '@/components/ui/switch'
import { useFullscreen } from '@/hooks/use-fullscreen'

const FullscreenMode = () => {
  const { isFullscreenEnabled, switchFullscreen } = useFullscreen()
  return (
    <div className="z-1 flex w-full flex-col items-center justify-between gap-2.5 rounded-xl border border-(--color-opposite-text) p-2.5 backdrop-blur-3xl backdrop-opacity-80 dark:border-(--color-main-text)/30">
      <div className="z-1 flex w-full items-center justify-between ps-2.5 pe-6">
        <span className="py-2.5 text-[18px]/[150%] font-normal text-(--color-main-text)">
          Fullscreen mode
        </span>
        <Switch
          disabled={isFullscreenEnabled === undefined}
          onCheckedChange={() => switchFullscreen()}
          checked={isFullscreenEnabled}
        />
      </div>
    </div>
  )
}

export default FullscreenMode
