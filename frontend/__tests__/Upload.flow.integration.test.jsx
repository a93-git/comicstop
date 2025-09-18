import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { Upload } from '../src/components/Upload/Upload.jsx'

// Mock Navbar dependencies
jest.mock('../src/context/ThemeContext', () => ({ ThemeProvider: ({ children }) => children }))
jest.mock('../src/hooks/useThemeContext', () => ({ useThemeContext: () => ({ toggleTheme: jest.fn(), isDark: false }) }))
jest.mock('../src/context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({ isAuthenticated: true, user: { username: 'u', isCreator: true }, logout: jest.fn() })
}))

// Mock router navigation
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  }
})

// Mock API services used by Upload
const mockCreateComic = jest.fn(async () => ({ id: 'draft-1' }))
const mockUpdateComic = jest.fn(async () => ({ id: 'draft-1', status: 'published' }))
const mockGetUserProfile = jest.fn(async () => ({ id: 'user-1' }))
const mockGetMySeriesMinimal = jest.fn(async () => ([{ id: '1', name: 'Series A' }]))

jest.mock('../src/services/api', () => ({
  getUserProfile: (...a) => mockGetUserProfile(...a),
  getMySeriesMinimal: (...a) => mockGetMySeriesMinimal(...a),
  createComic: (...a) => mockCreateComic(...a),
  updateComic: (...a) => mockUpdateComic(...a),
}))

// Mock FileUpload to set fileRef and preview items
jest.mock('../src/components/FileUpload/FileUpload.jsx', () => ({ __esModule: true, default: function MockFileUpload(props) {
  const React = require('react')
  const calledRef = React.useRef(false)
  const { onPreviewChange, onComplete } = props
  React.useEffect(() => {
    if (calledRef.current) return
    calledRef.current = true
    onPreviewChange?.([{ name: 'p1.jpg', isImage: true, url: 'blob://p1' }])
    onComplete?.({ file_id: 'file_abc' })
  }, [onPreviewChange, onComplete])
  return React.createElement('div', null, 'FileUpload Mock')
} }))

describe('Upload flow integration', () => {
  beforeEach(() => {
    localStorage.setItem('authToken', 't')
    localStorage.removeItem('upload:lastDraftId')
    jest.clearAllMocks()
  })

  it('creates draft on preview then publishes on submit', async () => {
    render(<Upload />)

    // Wait for loading to finish
    await screen.findByText('Upload Comics')

    // Fill required fields
    fireEvent.change(screen.getByLabelText('Title *'), { target: { value: 'My Comic' } })
    fireEvent.change(screen.getByLabelText('Add to Series'), { target: { value: '1' } })
    fireEvent.click(screen.getByText(/I agree that I have the right to upload/i))

    // Click Preview (should call createComic once)
    fireEvent.click(screen.getByRole('button', { name: /preview & save draft/i }))
    await waitFor(() => expect(mockCreateComic).toHaveBeenCalled())
    expect(localStorage.getItem('upload:lastDraftId')).toBe('draft-1')

    // Now click Save & Continue (should call updateComic with status published)
    fireEvent.click(screen.getByRole('button', { name: /save & continue/i }))
    await waitFor(() => expect(mockUpdateComic).toHaveBeenCalled())
  })
})
