import React, { FC } from 'react'
import styled from 'styled-components'
import { ipfsUpload } from '../../helpers'
import { Image } from './image'

const InputContainer = styled.div`
  display: flex;
  gap: 6px;
  align-self: center;
`

const CustomFileUpload = styled.label`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 42px;
  height: 42px;
  border: none;
  background: #f8f9ff;
  cursor: pointer;
  box-sizing: border-box;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
  }
`

const UploadInput = styled.input`
  display: none;
`

const UploadIcon = styled.div``

const IconImage = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.77778 16C1.28889 16 0.870518 15.8261 0.522667 15.4782C0.174815 15.1304 0.000592593 14.7117 0 14.2222V1.77778C0 1.28889 0.174222 0.870518 0.522667 0.522667C0.871111 0.174815 1.28948 0.000592593 1.77778 0H14.2222C14.7111 0 15.1298 0.174222 15.4782 0.522667C15.8267 0.871111 16.0006 1.28948 16 1.77778V14.2222C16 14.7111 15.8261 15.1298 15.4782 15.4782C15.1304 15.8267 14.7117 16.0006 14.2222 16H1.77778ZM2.66667 12.4444H13.3333L10 8L7.33333 11.5556L5.33333 8.88889L2.66667 12.4444Z"
      fill="#7A818B"
    />
  </svg>
)

interface Props {
  onImageChange: (event: any) => Promise<void>
  ipfsCid: string | undefined
  isDisabled: boolean
}

export const InputImage: FC<Props> = ({ onImageChange, ipfsCid, isDisabled }) => {
  const image = {
    ipfs_cid: ipfsCid,
  }

  const handleImageChange = async (event: any) => {
    const file = event.target.files[0]
    try {
      const cid = await ipfsUpload(file)
      await onImageChange(cid)
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  return (
    <InputContainer>
      <CustomFileUpload>
        <UploadInput
          value={''}
          onChange={handleImageChange}
          type="file"
          accept=".png, .jpeg, .jpg, .svg"
          disabled={isDisabled}
        />
        {image?.ipfs_cid ? (
          <Image image={image} />
        ) : (
          <UploadIcon title="Upload the image">
            <IconImage />
          </UploadIcon>
        )}
      </CustomFileUpload>
    </InputContainer>
  )
}
