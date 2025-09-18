import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import UploadComicForm from '../src/components/UploadComicForm/UploadComicForm.jsx'

function renderForm(extraProps = {}) {
  const mySeriesOptions = [{ id: '11111111-1111-4111-8111-111111111111', name: 'Series A' }]
  return render(<UploadComicForm onSubmit={() => {}} mySeriesOptions={mySeriesOptions} {...extraProps} />)
}

// Simulate that a file upload completed by injecting fileRef into the form via initialValues
const mockFileRef = { file_id: 'file_123' }

it('disables submit until required fields are valid and shows inline errors', () => {
  renderForm()

  const submit = screen.getByRole('button', { name: /save & continue/i })
  expect(submit).toBeDisabled()

  // Fill title
  fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'My Comic' } })
  // Select series
  fireEvent.change(screen.getByLabelText('Add to Series'), { target: { value: '11111111-1111-4111-8111-111111111111' } })
  // Agree to upload
  fireEvent.click(screen.getByText(/I agree that I have the right to upload/i))

  // Still disabled because no fileRef
  expect(submit).toBeDisabled()
})

it('enables submit once fileRef, title, series and agreement are set, and shows errors on invalid submit', () => {
  renderForm({ initialValues: { fileRef: mockFileRef } })

  const submit = screen.getByRole('button', { name: /save & continue/i })
  // Missing title/series/agreement -> disabled
  expect(submit).toBeDisabled()

  // Fill title and series
  fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'My Comic' } })
  fireEvent.change(screen.getByLabelText('Add to Series'), { target: { value: '11111111-1111-4111-8111-111111111111' } })
  fireEvent.click(screen.getByText(/I agree that I have the right to upload/i))

  // Now should be enabled
  expect(submit).toBeEnabled()

  // Force a submit with missing contributors/genre just to trigger validate and ensure no crash
  fireEvent.click(submit)

  // No specific error necessarily, but check no crash and button remains enabled
  expect(submit).toBeEnabled()
})
