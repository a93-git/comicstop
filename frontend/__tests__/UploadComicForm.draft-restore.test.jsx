import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import UploadComicForm from '../src/components/UploadComicForm/UploadComicForm.jsx'

test('restores saved draft from localStorage', () => {
  const draft = {
    title: 'Saved Title',
    description: 'Saved description',
    genre: ['Action'],
    tags: 'a,b',
    isAdultContent: true,
    contributors: [{ role: 'Writer', names: ['Alice'] }]
  }
  localStorage.setItem('upload:draft', JSON.stringify(draft))

  render(<UploadComicForm onSubmit={() => {}} mySeriesOptions={[]} />)

  expect(screen.getByDisplayValue('Saved Title')).toBeInTheDocument()
  expect(screen.getByDisplayValue('Saved description')).toBeInTheDocument()
})
