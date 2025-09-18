import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import UploadComicForm from '../src/components/UploadComicForm/UploadComicForm.jsx'

function noop() {}

function renderForm(extraProps = {}) {
  return render(
    <UploadComicForm
      onSubmit={noop}
      mySeriesOptions={[{ id: 1, name: 'Series A' }]}
      {...extraProps}
    />
  )
}

test('shows error when contributor has names but no role', () => {
  // Provide a fileRef to satisfy required file
  renderForm({ initialValues: { fileRef: { file_id: 'file_123' } } })

  // Add a contributor row
  fireEvent.click(screen.getByText('+ Add Contributor'))
  // Type a name and press Enter
  const input = screen.getByPlaceholderText('Type a name and press Enter')
  fireEvent.change(input, { target: { value: 'Alice' } })
  fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

  // Fill required fields: title, series, agreement
  fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'My Comic' } })
  fireEvent.change(screen.getByLabelText('Add to Series'), { target: { value: '1' } })
  fireEvent.click(screen.getByText(/I agree that I have the right to upload/i))

  // Submit should trigger contributors rule now
  fireEvent.click(screen.getByText('Save & Continue'))

  expect(screen.getByText('Select a role for each contributor with names')).toBeInTheDocument()
})

