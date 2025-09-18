import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React, { useState } from 'react'
import { ThumbnailField } from '../src/components/ThumbnailField'

function Harness({ initial }) {
  const [value, setValue] = useState(initial || { mode: 'url', url: '', file: null, previewUrl: '' })
  return (
    <div>
      <ThumbnailField value={value} onChange={setValue} />
      <pre data-testid="value">{JSON.stringify(value)}</pre>
    </div>
  )
}

test('thumbnail via URL shows preview and updates value', () => {
  render(<Harness />)
  const urlInput = screen.getByPlaceholderText('https://example.com/cover.jpg')
  fireEvent.change(urlInput, { target: { value: 'https://img/cover.jpg' } })
  expect(screen.getByAltText('Thumbnail preview image')).toBeInTheDocument()
  expect(screen.getByTestId('value').textContent).toContain('"mode":"url"')
  expect(screen.getByTestId('value').textContent).toContain('"url":"https://img/cover.jpg"')
})

test('switch to file mode updates mode and shows upload UI', () => {
  render(<Harness />)
  fireEvent.click(screen.getByLabelText('Upload file'))
  expect(screen.getByText('Choose image')).toBeInTheDocument()
  expect(screen.getByTestId('value').textContent).toContain('"mode":"file"')
})
