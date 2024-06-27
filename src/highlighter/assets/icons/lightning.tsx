import React from 'react'

const Lightning = ({ color = '#384BFF' }) => (
  <svg width="20" height="20" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M274.175 72.1535C274.547 69.181 270.812 67.5595 268.894 69.8608L85.1005 290.413C83.4721 292.367 84.8616 295.333 87.4051 295.333H252.602C254.406 295.333 255.802 296.915 255.578 298.705L237.825 440.735C237.453 443.708 241.188 445.329 243.106 443.028L426.9 222.476C428.528 220.522 427.138 217.556 424.595 217.556H259.398C257.594 217.556 256.198 215.974 256.422 214.183L274.175 72.1535Z"
      fill={color}
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export default Lightning
