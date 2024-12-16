declare module 'near-social-vm'

declare module '*.svg' {
  const value: any
  export default value
}

declare module '*.css' {
  const value: any
  export default value
}

declare module '*.svg' {
  const content: any
  export default content
}

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module '*.module.scss' {
  const value: any
  export default value
}
