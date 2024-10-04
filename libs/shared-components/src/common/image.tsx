import React, { FC, useEffect, useState } from 'react'

export interface Props {
  image?: {
    ipfs_cid?: string
    url?: string
  }

  fallbackUrl?: string
  alt?: string
}

export const Image: FC<Props> = ({ image, alt, fallbackUrl }) => {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)

  // todo: image can changed. need watch
  useEffect(() => {
    image?.ipfs_cid
      ? setImageUrl(`https://ipfs.near.social/ipfs/${image.ipfs_cid}`)
      : image?.url
        ? setImageUrl(image?.url)
        : setImageUrl(fallbackUrl)
  }, [image])

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
