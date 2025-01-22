import styled from 'styled-components'

export const Button = styled.button<{ primary?: boolean; danger?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  border: ${(p) => (p.primary || p.danger ? 'none' : '1px solid rgba(226, 226, 229, 1)')};
  color: ${(p) => (p.primary || p.danger ? '#fff' : 'rgba(2, 25, 58, 1)')};
  background: ${(p) =>
    p.primary ? 'rgba(56, 75, 255, 1)' : p.danger ? 'rgba(219, 80, 74, 1)' : 'inherit'};
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
