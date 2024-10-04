import React, { FC, useId } from 'react'
import FloatingLabel from 'react-bootstrap/FloatingLabel'
import Form from 'react-bootstrap/Form'
import styled from 'styled-components'
const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 14px;
  }
  .form-floating > .form-control {
    height: 48px;
    min-height: 48px;
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
  onChange?: (value: string) => void
  readonly?: boolean
}

export const Input: FC<Props> = ({ value, label, placeholder, disabled, onChange, readonly }) => {
  const inputId = useId()
  return (
    <InputContainer>
      <FloatingLabel controlId={inputId} label={label} className="mb-3">
        <Form.Control
          onChange={(e) => onChange && onChange(e.target.value)}
          value={value}
          disabled={disabled}
          type="text"
          placeholder={placeholder}
          readOnly={readonly}
        />
      </FloatingLabel>
    </InputContainer>
  )
}
