import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import UploadComicForm from '../src/components/UploadComicForm/UploadComicForm.jsx'

// Mock FileUpload to immediately call onPreviewChange with two preview items
jest.mock('../src/components/FileUpload/FileUpload.jsx', () => ({ __esModule: true, default: function MockFileUpload(props) {
  const React = require('react')
  const calledRef = React.useRef(false)
  const { onPreviewChange, onComplete } = props
  React.useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    onPreviewChange?.([
      { name: 'p1.jpg', isImage: true, url: 'blob://1' },
      { name: 'p2.jpg', isImage: true, url: 'blob://2' },
    ])
    onComplete?.({ file_id: 'file_123' })
  }, [onPreviewChange, onComplete])
  return React.createElement('div', null, 'FileUpload Mock')
} }))

test('preview mode shows thumbnails from upload preview', () => {
  render(<UploadComicForm onSubmit={() => {}} mySeriesOptions={[{ id: '1', name: 'Series A' }]} />)
  // enable preview
  fireEvent.click(screen.getByLabelText('Show preview of metadata'))

  // thumbnails from mocked FileUpload should be visible
  expect(screen.getByLabelText('Upload Preview Thumbnails')).toBeInTheDocument()
  expect(screen.getByAltText('Page 1: p1.jpg')).toBeInTheDocument()
  expect(screen.getByAltText('Page 2: p2.jpg')).toBeInTheDocument()
})
