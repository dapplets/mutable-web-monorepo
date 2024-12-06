import { BaseDto } from '@mweb/backend'
import { EntityMetadata } from '@mweb/backend/lib/common/entity-metadata'
import React, { FC } from 'react'
import styled from 'styled-components'
import { Alert, AlertProps } from './alert'
import { Button } from './button'
import { ButtonsGroup } from './buttons-group'
import { DropdownButton } from './dropdown-button'
import { Image } from './image'
import { InputImage } from './upload-image'

const ModalConfirmWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 300px;
  max-height: calc(100% - 40px);
  padding: 20px;
  gap: 10px;
  border-radius: 10px;
  z-index: 5;
  background: #fff;
  box-shadow: 0px 5px 11px 0px rgba(2, 25, 58, 0.1), 0px 19px 19px 0px rgba(2, 25, 58, 0.09),
    0px 43px 26px 0px rgba(2, 25, 58, 0.05), 0px 77px 31px 0px rgba(2, 25, 58, 0.01),
    0px 120px 34px 0px rgba(2, 25, 58, 0);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu',
    'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;

  input[type='checkbox'] {
    accent-color: #384bff;
  }
`

const HeaderTitle = styled.h1`
  margin: 0;
  text-align: center;
  color: #02193a;
  font-family: inherit;
  font-size: 22px;
  font-weight: 600;
  line-height: 150%;
`

const Label = styled.div`
  color: #7a818b;
  font-size: 8px;
  text-transform: uppercase;
  font-weight: 700;
`

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const ImgWrapper = styled.div`
  width: 42px;
  height: 42px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
  }
`

const TextWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: calc(100% - 52px);

  p {
    font-size: 14px;
    font-weight: 600;
    color: #02193a;
    margin: 0;
    overflow-wrap: break-word;
  }

  span {
    font-size: 10px;
    color: #7a818b;
    overflow-wrap: break-word;
  }
`

const FloatingLabelContainer = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  width: 100%;
`

const StyledInput = styled.input`
  padding: 20px 10px 9px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 12px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  border: none;
`

const StyledLabel = styled.label`
  top: 0.5rem;
  left: 10px;
  font-size: 10px;
  color: #7a818b;
  position: absolute;
  user-select: none;

  span {
    color: #db504a;
  }
`

const FloatingLabelContainerArea = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  position: relative;
  flex: 1 1 auto;
  display: flex;
  border-radius: 10px;
`

const StyledTextarea = styled.textarea`
  padding: 25px 10px 10px;
  background: inherit;
  color: #02193a;
  line-height: 100%;
  font-size: 13px;
  border-radius: 10px;
  width: 100%;
  outline: none;
  min-height: 77px;
  position: relative;
  border: none;
`

const CheckboxBlock = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  span {
    font-size: 12px;
    color: #02193a;
  }
`

const CheckboxInput = styled.input`
  width: 16px;
  height: 16px;
  border-radius: 5px;
  border: 1px solid #384bff;
`

export enum ModalMode {
  Editing = 'editing',
  Creating = 'creating',
  Forking = 'forking',
}

export type ModalsConfirmProps = {
  entityType: string
  editingEntity: BaseDto & { metadata: EntityMetadata<string> }
  loggedInAccountId: string
  mode: ModalMode
  alert: AlertProps | null
  isFormDisabled: boolean
  isApplyToOriginChecked: boolean
  newName: string
  newImage?: { ipfs_cid?: string }
  newDescription: string
  forkedEntity?: BaseDto & { metadata: EntityMetadata<string> }
  onChangeModalMode: (itemId: string) => void
  setIsApplyToOriginChecked: React.Dispatch<React.SetStateAction<boolean>>
  setName: (name: string) => void
  setImage: (image: { ipfs_cid?: string }) => void
  setDescription: (description: string) => void
  onSaveClick: () => void
  onCloseCurrent: () => void
}

export const ModalsConfirm: FC<ModalsConfirmProps> = ({
  entityType,
  editingEntity,
  loggedInAccountId,
  mode,
  alert,
  isFormDisabled,
  isApplyToOriginChecked,
  newName,
  newImage,
  newDescription,
  forkedEntity,
  onChangeModalMode,
  setIsApplyToOriginChecked,
  setName,
  setImage,
  setDescription,
  onSaveClick,
  onCloseCurrent,
}) => {
  return (
    <ModalConfirmWrapper data-testid="popup-confirm">
      <HeaderTitle>
        {mode === ModalMode.Creating
          ? `Create your ${entityType}`
          : mode === ModalMode.Editing
          ? `Publish your ${entityType}`
          : mode === ModalMode.Forking
          ? 'Publish as a fork'
          : null}
      </HeaderTitle>

      {alert ? <Alert severity={alert.severity} text={alert.text} /> : null}

      {mode === ModalMode.Creating ? (
        <>
          <Label>My item ({loggedInAccountId})</Label>
          <CardWrapper>
            <InputImage
              ipfsCid={newImage?.ipfs_cid}
              onImageChange={async (ipfs_cid: string) => setImage({ ipfs_cid })}
              isDisabled={isFormDisabled}
            />
            <FloatingLabelContainer>
              <StyledInput
                id={'name'}
                type={'text'}
                value={newName}
                placeholder={`Enter your ${entityType} name`}
                onChange={(e) => setName(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'name'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
              placeholder={`Describe your ${entityType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : mode === ModalMode.Forking ? (
        <>
          <Label>from</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={editingEntity.metadata.image}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={editingEntity.metadata.name}
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{editingEntity.metadata.name}</p>
              <span>
                by{' '}
                {editingEntity.authorId === loggedInAccountId
                  ? `me (${loggedInAccountId})`
                  : editingEntity.authorId}
              </span>
            </TextWrapper>
          </CardWrapper>

          {editingEntity.authorId === loggedInAccountId ? null : (
            <CheckboxBlock>
              <span>Ask Origin to apply changes</span>
              <CheckboxInput
                type="checkbox"
                checked={isApplyToOriginChecked}
                disabled={isFormDisabled}
                onChange={() => setIsApplyToOriginChecked((val) => !val)}
              />
            </CheckboxBlock>
          )}
          <Label>As my item ({loggedInAccountId})</Label>
          <CardWrapper>
            <InputImage
              ipfsCid={newImage?.ipfs_cid}
              onImageChange={async (ipfs_cid: string) => setImage({ ipfs_cid })}
              isDisabled={isFormDisabled}
            />
            <FloatingLabelContainer>
              <StyledInput
                id={'name'}
                type={'text'}
                value={newName}
                placeholder={`Enter your ${entityType} name`}
                onChange={(e) => setName(e.target.value)}
                disabled={isFormDisabled}
              />
              <StyledLabel htmlFor={'name'}>
                Name<span>*</span>
              </StyledLabel>
            </FloatingLabelContainer>
          </CardWrapper>

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
              placeholder={`Describe your ${entityType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : mode === ModalMode.Editing ? (
        <>
          <Label>My item</Label>
          <CardWrapper>
            <ImgWrapper>
              <Image
                image={newImage}
                fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                alt={newName} // ToDo: why?
              />
            </ImgWrapper>
            <TextWrapper>
              <p>{newName}</p>
              <span>by me ({loggedInAccountId})</span>
            </TextWrapper>
          </CardWrapper>

          {forkedEntity ? (
            <>
              <Label>Originally Forked from</Label>
              <CardWrapper>
                <ImgWrapper>
                  <Image
                    image={forkedEntity.metadata.image}
                    fallbackUrl="https://ipfs.near.social/ipfs/bafkreifc4burlk35hxom3klq4mysmslfirj7slueenbj7ddwg7pc6ixomu"
                    alt={forkedEntity.metadata.name}
                  />
                </ImgWrapper>
                <TextWrapper>
                  <p>{forkedEntity.metadata.name}</p>
                  <span>
                    by{' '}
                    {forkedEntity.authorId === loggedInAccountId
                      ? `me (${loggedInAccountId})`
                      : forkedEntity.authorId}
                  </span>
                </TextWrapper>
              </CardWrapper>

              <CheckboxBlock>
                <span>
                  {forkedEntity.authorId === loggedInAccountId
                    ? 'Apply changes to Origin'
                    : 'Ask Origin to apply changes'}
                </span>
                <CheckboxInput
                  type="checkbox"
                  checked={isApplyToOriginChecked}
                  disabled={isFormDisabled}
                  onChange={() => setIsApplyToOriginChecked((val) => !val)}
                />
              </CheckboxBlock>
            </>
          ) : null}

          <FloatingLabelContainerArea>
            <StyledTextarea
              id={'description'}
              value={newDescription}
              placeholder={`Describe your ${entityType} here`}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isFormDisabled}
            />
            <StyledLabel htmlFor={'description'}>Description</StyledLabel>
          </FloatingLabelContainerArea>
        </>
      ) : null}

      <ButtonsGroup>
        <Button onClick={onCloseCurrent}>Cancel</Button>
        <DropdownButton
          value={mode}
          items={[
            {
              value: ModalMode.Forking,
              title: 'Fork',
              visible: !!editingEntity.authorId,
            },
            {
              value: ModalMode.Editing,
              title: 'Save',
              visible: !!editingEntity.authorId && editingEntity.authorId === loggedInAccountId,
            },
            {
              value: ModalMode.Creating,
              title: 'Create',
              visible: !editingEntity.authorId,
            },
          ]}
          onClick={onSaveClick}
          onChange={onChangeModalMode}
          disabled={isFormDisabled}
          disabledAll={isFormDisabled}
        />
      </ButtonsGroup>
    </ModalConfirmWrapper>
  )
}
