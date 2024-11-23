import styled from 'styled-components'

export const WrapperDropdown = styled.div`
  position: relative;

  display: flex;
  align-items: center;

  width: 266px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
`

export const SelectedMutationBlock = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 2px 6px;
  cursor: pointer;
  align-items: center;
  height: 100%;
`

export const SelectedMutationInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 181px;
`
export const SelectedMutationDescription = styled.div`
  font-size: 12px;
  line-height: 150%;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-flex;
  align-items: center;
`

export const SelectedMutationId = styled.div`
  font-size: 10px;
  line-height: 150%;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 180px;
  display: inline-block;
`

export const OpenListDefault = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  @keyframes rotateIsClose {
    0% {
      transform: rotate(180deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(0deg);
    }
  }
  animation: rotateIsClose 0.2s ease forwards;
  transition: all 0.3s;
  &:hover {
    svg {
      transform: scale(1.2);
    }
  }
`

export const OpenList = styled.span`
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  @keyframes rotateIsOpen {
    0% {
      transform: rotate(0deg);
    }

    50% {
      transform: rotate(90deg);
    }

    100% {
      transform: rotate(180deg);
    }
  }
  animation: rotateIsOpen 0.2s ease forwards;
  transition: all 0.3s;
  &:hover {
    svg {
      transform: scale(1.2);
    }
  }
`

export const StarSelectedMutationWrapper = styled.div`
  cursor: pointer;
  display: flex;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.2);
  }
  & > svg {
    vertical-align: initial;
  }
`

export const MutationsList = styled.div`
  position: absolute;
  outline: none;
  display: flex;
  flex-direction: column;
  background: #fff;
  box-shadow: 0 4px 5px rgb(45 52 60 / 10%), 0 4px 20px rgb(11 87 111 / 15%);
  width: 318px;
  left: -26px;
  top: 42px;
  padding: 0;
  border-radius: 0px 0px 10px 10px;

  @keyframes listVisible {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0.5;
    }

    100% {
      opacity: 1;
    }
  }

  animation: listVisible 0.2s ease forwards;
  transition: all 0.3s;
`

export const MutationsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 98%;
  padding: 6px;
  overflow: hidden;
  overflow-y: auto;
  max-height: 500px;
  gap: 10px;
  position: relative;
  margin-left: 1%;

  &::-webkit-scrollbar {
    cursor: pointer;
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    margin-bottom: 10px;
    margin-top: 40px;
    background: rgb(244 244 244);
    background: linear-gradient(
      90deg,
      rgb(244 244 244 / 0%) 10%,
      rgb(227 227 227 / 100%) 50%,
      rgb(244 244 244 / 0%) 90%
    );
  }

  &::-webkit-scrollbar-thumb {
    width: 4px;
    height: 2px;
    background: #384bff;
    border-radius: 2px;
    box-shadow: 0 2px 6px rgb(0 0 0 / 9%), 0 2px 2px rgb(38 117 209 / 4%);
  }
`
export const ButtonListBlock = styled.div`
  display: flex;
  border-radius: 0px, 0px, 10px, 10px;
  height: 40px;
  justify-content: space-evenly;
  width: 100%;
  align-items: center;
  top: 42px;
  left: 0;
  background: #f8f9ff;
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
  width: 100%;
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
  width: 100%;

  background: ${(props) => (props.isActive ? 'rgba(56, 75, 255, 0.1)' : '#fff')};
  border-radius: 4px;

  .inputMutation {
    background: ${(props) => (props.isActive ? 'rgba(56, 75, 255, 0.1)' : '#fff')};
  }

  &:hover {
    background: rgba(248, 249, 255, 1);
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
  width: 100%;
  background: rgba(248, 249, 255, 1);
  border-radius: 10px;
  gap: 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 10px;
  z-index: 1;

  .avalibleMutationsInput {
    background: rgba(248, 249, 255, 1);
    width: 100%;
    border-radius: 4px;
    padding: 2px 4px;
    margin-bottom: 3px;

    &:hover {
      background: rgba(24, 121, 206, 0.08);
    }
  }
`

export const AvalibleLableBlock = styled.div`
  display: flex;
  cursor: pointer;
  align-items: center;
  justify-content: space-between;
  width: 100%;
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

// version

export const DropdownContainer = styled.div<{ $expanded?: boolean }>`
  position: absolute;
  width: 100%;
  width: 50px;
  height: auto;
  top: 24px;
  left: 2px;
  padding: 2px;
  border-radius: 4px;
  background: #fff;
  display: flex;
  flex-direction: column;

  box-shadow: ${({ $expanded }) =>
    $expanded
      ? `0px 3px 7px 0px #2222221A, 
         0px 12px 12px 0px #22222217, 
         0px 27px 16px 0px #2222220D, 
         0px 48px 19px 0px #22222203, 
         0px 76px 21px 0px #22222200`
      : 'none'};

  cursor: pointer;
`

export const SpanStyled = styled.span<{ $isWhite?: boolean }>`
  display: flex;
  align-items: center;
  gap: 2px;
  position: relative;
  top: ${({ $isWhite }) => ($isWhite ? `0` : '-6px')};
  left: 2px;
  justify-content: center;
  padding: 2px 0;
  padding-left: 4px;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 400;
  text-align: left;
  color: #ffffff;
  background: ${({ $isWhite }) => ($isWhite ? `#FFFFFF` : '#384bff')};
  svg path {
    stroke: ${({ $isWhite }) => ($isWhite ? ` #7a818b` : '#FFFFFF')};
  }
`

export const DropdownItem = styled.div`
  font-size: 10px;
  font-weight: 400;
  text-align: center;
  color: #7a818b;
  padding: 4px;

  &:hover {
    background: #1879ce1a;
  }
`
