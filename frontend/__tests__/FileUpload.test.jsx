import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import FileUpload from '../src/components/FileUpload/FileUpload.jsx'

jest.mock('axios', () => ({
  post: jest.fn(async () => ({ data: { data: { comic: { s3Key: 'file_s3_key' }, uploadId: 'u1', pageOrder: ['p1','p2'] } } }))
}))

describe('FileUpload', () => {
  const origCreate = URL.createObjectURL
  const origRevoke = URL.revokeObjectURL
  beforeEach(() => {
    URL.createObjectURL = jest.fn(() => 'blob://preview')
    URL.revokeObjectURL = jest.fn()
    localStorage.setItem('authToken', 'test-token')
  })
  afterEach(() => {
    URL.createObjectURL = origCreate
    URL.revokeObjectURL = origRevoke
    jest.clearAllMocks()
  })

  it('filters unsupported files and shows error', () => {
    render(<FileUpload onComplete={jest.fn()} />)
    const choose = screen.getByRole('button', { name: /choose files/i })
    const input = choose.parentElement.querySelector('input[type="file"]')
    const bad = new File(['x'], 'doc.txt', { type: 'text/plain' })
    fireEvent.change(input, { target: { files: [bad] } })
    expect(screen.getByText(/unsupported file types selected/i)).toBeInTheDocument()
  })

  it('single file upload calls onComplete with file_id', async () => {
    const onComplete = jest.fn()
    render(<FileUpload onComplete={onComplete} />)
    const choose = screen.getByRole('button', { name: /choose files/i })
    const input = choose.parentElement.querySelector('input[type="file"]')
    const good = new File(['x'], 'book.pdf', { type: 'application/pdf' })
    fireEvent.change(input, { target: { files: [good] } })
    fireEvent.click(screen.getByRole('button', { name: /upload/i }))
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
    expect(onComplete).toHaveBeenCalledWith({ file_id: 'file_s3_key' })
  })

  it('multiple image upload sends page order and uploadId when allowed', async () => {
    const onComplete = jest.fn()
    render(<FileUpload onComplete={onComplete} allowImagesReorder />)
    const choose = screen.getByRole('button', { name: /choose files/i })
    const input = choose.parentElement.querySelector('input[type="file"]')
    const img1 = new File(['a'], 'p1.jpg', { type: 'image/jpeg' })
    const img2 = new File(['b'], 'p2.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [img1, img2] } })
    fireEvent.click(screen.getByRole('button', { name: /upload/i }))
    await waitFor(() => expect(onComplete).toHaveBeenCalled())
    expect(onComplete.mock.calls[0][0]).toHaveProperty('uploadId', 'u1')
    expect(onComplete.mock.calls[0][0]).toHaveProperty('page_order')
  })

  it('emits onPreviewChange with generated preview items', async () => {
    const onPreviewChange = jest.fn()
    render(<FileUpload onComplete={jest.fn()} onPreviewChange={onPreviewChange} />)
    const choose = screen.getByRole('button', { name: /choose files/i })
    const input = choose.parentElement.querySelector('input[type="file"]')
    const img1 = new File(['a'], 'p1.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [img1] } })
    await waitFor(() => expect(onPreviewChange).toHaveBeenCalled())
    const calls = onPreviewChange.mock.calls
    const items = calls[calls.length - 1][0]
    expect(Array.isArray(items)).toBe(true)
    expect(items[0]).toMatchObject({ name: 'p1.jpg', isImage: true })
  })
})
