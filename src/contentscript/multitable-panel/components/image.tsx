import React, { FC, useState } from 'react'

export interface Props {
  image?: {
    ipfs_cid?: string
    url?: string
  }

  fallbackUrl?: string
  alt?: string
}

export const Image: FC<Props> = ({ image, alt, fallbackUrl }) => {
  const [imageUrl, setImageUrl] = useState(
    (image?.ipfs_cid ? `https://ipfs.near.social/ipfs/${image.ipfs_cid}` : image?.url) ||
      fallbackUrl
  )

  return (
    <img
      src={imageUrl}
      alt={alt}
      onError={() => {
        if (imageUrl !== fallbackUrl) {
          setImageUrl(fallbackUrl)
        }
      }}
    />
  )
}
