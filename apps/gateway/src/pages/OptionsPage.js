import React, { useCallback, useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'

export default function OptionsPage(props) {
  const [devServerUrl, setDevServerUrl] = useState(localStorage.getItem('devServerUrl') ?? '')

  const handleFormSubmit = useCallback(
    (e) => {
      e.preventDefault()

      if (devServerUrl) {
        localStorage.setItem('devServerUrl', devServerUrl)
      } else {
        localStorage.removeItem('devServerUrl')
      }
    },
    [devServerUrl]
  )

  const handleInputChange = useCallback((e) => {
    setDevServerUrl(e.target.value)
  }, [])

  return (
    <div className="container mt-4">
      <h1>Options</h1>

      <Form onSubmit={handleFormSubmit}>
        <Form.Group className="mb-3" controlId="devServerUrl">
          <Form.Label>Dev Server URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="http://localhost:3030"
            value={devServerUrl}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Button className="btn btn-primary" type="submit">
          Save
        </Button>
      </Form>
    </div>
  )
}
