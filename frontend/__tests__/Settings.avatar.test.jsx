import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../src/context/ThemeContext'
import { Settings } from '../src/components/Settings/Settings'

// Stub Navbar
jest.mock('../src/components/Navbar/Navbar', () => ({
  Navbar: () => <nav data-testid="navbar" />,
}))

// Mock API
jest.mock('../src/services/api', () => {
  return {
    getUserSettings: jest.fn(async () => ({
      username: 'Alice',
      email: 'alice@example.com',
      joinDate: new Date('2024-01-01').toISOString(),
      isCreator: false,
      emailVerified: true,
      theme: 'light',
      readingPreferences: { showDialogues: true, enableClickNavigation: true },
      notifications: { emailNotifications: true, pushNotifications: false },
    })),
    saveUserSettings: jest.fn((partial) => partial),
    setCreatorMode: jest.fn(async () => ({ success: true, data: { user: { id: 1, isCreator: false } } })),
    deleteMyAccount: jest.fn(async () => ({ success: true })),
    getUserProfile: jest.fn(async () => ({ username: 'Alice', email: 'alice@example.com', phone: '' })),
    updateUsername: jest.fn(),
    updateEmail: jest.fn(),
    updatePhone: jest.fn(),
    updatePassword: jest.fn(),
    updateProfilePicture: jest.fn(async () => ({ success: true, data: { user: { profilePictureS3Url: 'https://cdn.example.com/u/1.jpg' } } })),
  }
})

import * as api from '../src/services/api'

function renderSettings() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <Settings />
      </ThemeProvider>
    </MemoryRouter>
  )
}

describe('Settings avatar', () => {
  it('shows letter avatar with deterministic color when no image', async () => {
    renderSettings()
    // Wait for page to load
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

    // The avatar default is a div with aria-label
    const avatar = screen.getByLabelText('Profile picture')
    expect(avatar).toBeInTheDocument()
    expect(avatar.textContent).toBe('A') // first letter of Alice
    // Color style applied (deterministic function), at least ensure has inline style background
    expect(avatar.getAttribute('style') || '').toMatch(/background:/)
  })

  it('uploads and then shows the image avatar', async () => {
    renderSettings()
    expect(await screen.findByText(/Account Settings/i)).toBeInTheDocument()

  const file = new File([new Uint8Array([1,2,3])], 'avatar.jpg', { type: 'image/jpeg' })
    // The label is clickable and associated with a hidden input; get the hidden input by id
    const hiddenInput = document.getElementById('profilePictureInput')
    expect(hiddenInput).toBeTruthy()

    // Fire change on the hidden input
    await waitFor(() => {
      fireEvent.change(hiddenInput, { target: { files: [file] } })
    })

    // API called
    await waitFor(() => {
      expect(api.updateProfilePicture).toHaveBeenCalled()
    })

    // Image should render with src
    await waitFor(() => {
      const img = screen.getByAltText('Profile')
      expect(img).toBeInTheDocument()
      const src = img.getAttribute('src') || ''
      expect(src.length).toBeGreaterThan(0)
    })
  })
})
