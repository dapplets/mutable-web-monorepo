import React, { FC, useId } from 'react'
import styled from 'styled-components'

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 14px;
  }

  input {
    flex: 1;

    padding: 10px 10px;
    border-radius: 10px;
    border: 1px solid #e2e2e5;
    font-size: 14px;

    &:focus {
      border: 1px solid rgba(56, 75, 255, 1);
      outline: none;
    }
  }
`

interface Props {
  label: string
  value: string
  placeholder: string
  disabled?: boolean
  onChange: (value: string) => void
}

export const Input: FC<Props> = ({ value, label, placeholder, disabled, onChange }) => {
  const inputId = useId()
  return (
    <InputContainer>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    </InputContainer>
  )
}
