import * as React from 'react'

const _DappletFileDownloader: React.FC<{
  onClick: () => File
  className?: string
  disabled?: boolean
  children?: React.ReactNode
}> = ({ onClick, className, disabled, children }) => {
  const handleClick = () => {
    const file = onClick()
    if (!file) return

    const url = URL.createObjectURL(file)

    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button disabled={disabled} className={className} onClick={handleClick}>
      {children}
    </button>
  )
}

export const DappletFileDownloader: React.FC<any> = (props) => {
  return <_DappletFileDownloader {...props} />
}
