import { render, screen, fireEvent } from '@testing-library/react'
import UploadComicForm from '../src/components/UploadComicForm/UploadComicForm'

// Visual/structure assertions for Upload form improvements

describe('Upload UI visual structure', () => {
  it('renders genres and trigger warnings in a responsive checkbox grid', () => {
    render(<UploadComicForm onSubmit={jest.fn()} />)

    // Sections present
    expect(screen.getByRole('heading', { name: /Files/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /Details/i })).toBeInTheDocument()

    // Grids exist by className (best-effort structural check)
    const gridEls = document.querySelectorAll('.checkboxGrid')
    expect(gridEls.length).toBeGreaterThanOrEqual(2)

    // Check that multiple checkboxes are present (genres)
    const actionBox = screen.getByLabelText(/Action/i)
    expect(actionBox).toBeInTheDocument()
  })

  it('renders uploaded files as large tile cards', () => {
    render(<UploadComicForm onSubmit={jest.fn()} />)

    // Find the hidden file input inside FileUpload and simulate selecting two images
    const input = document.querySelector('input[type="file"][multiple]')
    expect(input).toBeTruthy()
    const file1 = new File(['x'], 'page-001.jpg', { type: 'image/jpeg' })
    const file2 = new File(['y'], 'page-002.jpg', { type: 'image/jpeg' })
    fireEvent.change(input, { target: { files: [file1, file2] } })

    // The list container should be present with tile items
    const list = document.querySelector('.list')
    expect(list).toBeTruthy()
    const items = list.querySelectorAll('.item')
    expect(items.length).toBe(2)
    // Each item has a thumb and truncated name element
    items.forEach((el) => {
      expect(el.querySelector('.thumb')).toBeTruthy()
      expect(el.querySelector('.name')?.textContent).toMatch(/page-00[12]\.jpg/)
    })
  })
})
