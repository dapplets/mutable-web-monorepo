declare let EXTENSION_VERSION: string

declare module 'near-social-vm' {
  export function useAccountId(): string | null
  export function useInitNear(): { initNear: (config: any) => void }
}

declare module 'chrome-extension-message-wrapper'

declare module '*.svg' {
  const content: string
  export default content
}
declare module '*.png' {
  const content: string
  export default content
}
