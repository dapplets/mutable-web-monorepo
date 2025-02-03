import styled from 'styled-components'

export const MutationsList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  border-radius: 10px;
  border: 1px solid #e2e2e5;
`

export const MutationsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 6px;
  gap: 10px;
`

export const ButtonListBlock = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`

export const ButtonBack = styled.div`
  display: flex;
  background: #f8f9ff;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 400;
  line-height: 20.86px;
  color: #7a818b;
  cursor: pointer;
  z-index: 1;
  width: 40%;
  height: 70%;
  padding-bottom: 10px;
  padding-top: 10px;
  transition: all 0.2s ease;
  svg {
    margin-right: 5px;
  }
  &:hover {
    background: rgba(56, 75, 255, 0.1);
    border-radius: 4px;
  }
`

export const ButtonMutation = styled.div`
  display: flex;
  background: #f8f9ff;
  align-items: center;
  justify-content: center;
  color: #384bff;
  font-size: 14px;
  font-weight: 400;
  line-height: 20.86px;
  cursor: pointer;
  z-index: 1;
  width: 40%;
  height: 70%;
  padding-bottom: 10px;
  padding-top: 10px;
  transition: all 0.2s ease;
  svg {
    margin-left: 5px;
  }
  &:hover {
    background: rgba(56, 75, 255, 0.1);
    border-radius: 4px;
  }
`

export const ListMutations = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  z-index: 1;
`

export const InputBlock = styled.div<{ isActive?: boolean }>`
  display: flex;

  padding: 2px 4px;
  cursor: pointer;

  align-items: center;

  background: ${(props) => (props.isActive ? '#e9e9ea' : undefined)};
  color: ${(props) => (props.isActive ? '#384BFF' : '#7A818B')};
  border-radius: 4px;

  .inputMutation {
    color: ${(props) => (props.isActive ? '#384BFF' : '#7A818B')};
  }

  &:hover {
    background: #384bff;

    div,
    span {
      color: #fff;
    }

    svg {
      fill: #fff;

      path {
        stroke: #fff;
      }
    }
  }
`
export const InputIconWrapper = styled.div`
  display: flex;
  padding-right: 3px;
  transition: all 0.15s ease;
  color: #a0a2a7;
  justify-content: center;
  padding: 0;
  width: 30px;

  & svg {
    vertical-align: initial;
  }

  &:hover {
    color: #656669;

    svg {
      transform: scale(1.2);
    }
  }

  &:active {
    color: #4f5053;
  }
`

export const InputInfoWrapper = styled.div`
  display: flex;

  padding: 4px;
  padding-left: 6px;
  cursor: pointer;

  position: relative;

  flex-direction: column;
  align-items: flex-start;
  flex: 1;

  .inputMutationSelected {
    color: rgba(34, 34, 34, 1);
  }

  .authorMutationSelected {
    color: #384bff;
  }
`
export const ImageBlock = styled.div`
  width: 30px;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

export const AvalibleMutations = styled.div`
  background: #f8f9ff;
  border-radius: 10px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 10px;
  z-index: 1;

  .avalibleMutationsInput {
    background: rgba(248, 249, 255, 1);
    border-radius: 4px;
    padding: 2px 4px;
    margin-bottom: 3px;

    &:hover {
      background: #384bff;
    }
  }
`

export const AvalibleLableBlock = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  .iconRotate {
    svg {
      transform: rotate(0deg);
    }
  }
`

export const AvalibleLable = styled.span`
  font-size: 8px;
  font-weight: 700;
  line-height: 8px;
  text-transform: uppercase;
  color: #7a818b;
`

export const AvalibleArrowBlock = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.2s ease;
  cursor: pointer;
  svg {
    margin-left: 10px;
    transform: rotate(180deg);
  }
`

export const AvalibleArrowLable = styled.span`
  font-size: 8px;
  font-weight: 700;
  line-height: 11.92px;
  color: #7a818b;
`

export const InputMutation = styled.span`
  font-size: 12px;
  line-height: 149%;

  color: rgba(34, 34, 34, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-flex;
  align-items: center;
`

export const AuthorMutation = styled.div`
  font-size: 10px;
  line-height: 100%;
  color: rgba(34, 34, 34, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-flex;
  align-items: center;
`
