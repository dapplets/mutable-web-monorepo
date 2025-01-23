import { ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons'
import { EntitySourceType, MutationDto } from '@mweb/backend'
import React, { FC } from 'react'
import {
  AuthorMutation,
  ImageBlock,
  InputBlock,
  InputIconWrapper,
  InputInfoWrapper,
  InputMutation,
} from '../assets/styles-dropdown'
import { StarMutationList, StarMutationListDefault } from '../assets/vectors'
import { Badge } from './badge'
import { Image } from './image'
import { usePreferredSource } from '@mweb/react-engine'

export const MutationDropdownItem: FC<{
  local?: MutationDto
  origin?: MutationDto
  isSelected: boolean
  isFavorite: boolean
  onFavoriteClick: () => void
  onDeleteClick: () => void
  onRemoveFromRecentClick: () => void
  onSelect: () => void
}> = ({
  local,
  origin,
  isSelected,
  isFavorite,
  onFavoriteClick,
  onDeleteClick,
  onRemoveFromRecentClick,
  onSelect,
}) => {
  const mutationId = origin?.id ?? local?.id ?? null

  const { preferredSource } = usePreferredSource(mutationId)

  const mut = preferredSource === EntitySourceType.Local ? local : origin

  if (!local && !origin) return null
  if (!mut) return null

  return (
    <InputBlock data-testid={mutationId} key={mutationId} isActive={isSelected}>
      <ImageBlock>
        <Image
          image={mut.metadata.image}
          // fallbackUrl={defaultIcon}
        />
      </ImageBlock>
      <InputInfoWrapper onClick={onSelect}>
        {/* todo: mocked classname */}
        <InputMutation className={isSelected ? 'inputMutationSelected' : ''}>
          {mut.metadata ? mut.metadata.name : ''}{' '}
          {local && origin ? (
            mut.source === EntitySourceType.Local ? (
              <Badge margin="0 0 0 4px" text="local on" theme="blue" />
            ) : (
              <Badge margin="0 0 0 4px" text="local off" theme="yellow" />
            )
          ) : mut.source === EntitySourceType.Local ? (
            <Badge margin="0 0 0 4px" text="local" theme="blue" />
          ) : null}
        </InputMutation>
        {/* todo: mocked classname */}
        {mut.authorId ? (
          <AuthorMutation className={isSelected && isFavorite ? 'authorMutationSelected' : ''}>
            by {mut.authorId}
          </AuthorMutation>
        ) : null}
      </InputInfoWrapper>
      {/* todo: mocked */}

      {isFavorite ? (
        <InputIconWrapper onClick={onFavoriteClick}>
          <StarMutationList />
        </InputIconWrapper>
      ) : isSelected ? (
        <InputIconWrapper onClick={onFavoriteClick}>
          <StarMutationListDefault />
        </InputIconWrapper>
      ) : null}

      {mut.source === EntitySourceType.Local ? (
        <InputIconWrapper onClick={onDeleteClick}>
          <DeleteOutlined />
        </InputIconWrapper>
      ) : !isSelected && !isFavorite && !preferredSource ? (
        <InputIconWrapper onClick={onRemoveFromRecentClick}>
          <ArrowDownOutlined />
        </InputIconWrapper>
      ) : null}
    </InputBlock>
  )
}
