import styled from 'styled-components'

export const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(226, 226, 229, 1);
  color: rgba(2, 25, 58, 1);
  width: 175px;
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20.86px;
  text-align: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: auto;
  }

  &:hover:not(:disabled) {
    opacity: 0.75;
  }

  &:active:not(:disabled) {
    opacity: 0.5;
  }
`
